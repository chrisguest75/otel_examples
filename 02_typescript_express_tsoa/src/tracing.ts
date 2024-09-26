import { Metadata, credentials } from '@grpc/grpc-js'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { Resource } from '@opentelemetry/resources'
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import opentelemetry, { DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'

import { logger } from './logger.js'
import process from 'process'

const metadata = new Metadata()
let sdk: NodeSDK | undefined = undefined

export async function shutdownOtel() {
  logger.info('shutdownOtel')
  if (sdk != undefined) {
    await sdk
      .shutdown()
      .then(() => logger.info('Tracing terminated'))
      .catch((error: Error) => logger.error('Error terminating tracing', error))
  }
}

export async function configureHoneycomb(apikey: string, dataset: string, servicename: string) {
  // configure otel diagnostics
  const enableDiag = process.env.ENABLE_OTEL_DIAG ?? 'false'
  if (enableDiag.toLowerCase() == 'true') {
    opentelemetry.diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL)
  }

  logger.info(`'${servicename}' in '${dataset}' using '${apikey}'`)
  metadata.set('x-honeycomb-team', apikey)
  metadata.set('x-honeycomb-dataset', dataset)
  const traceExporter = new OTLPTraceExporter({
    url: 'grpc://api.honeycomb.io:443/',
    credentials: credentials.createSsl(),
    metadata,
  })

  const serviceversion = process.env.SERVICE_VERSION ?? 'unset'

  sdk = new NodeSDK({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: servicename,
      [SEMRESATTRS_SERVICE_VERSION]: serviceversion,
    }),
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // load custom configuration for http instrumentation
        '@opentelemetry/instrumentation-http': {
          applyCustomAttributesOnSpan: (span) => {
            span.setAttribute('instrumentation-http', 'true')
          },
        },
        '@opentelemetry/instrumentation-express': {},
      }),
      new HttpInstrumentation(),
    ],
  })

  if (sdk != undefined) {
    await sdk.start()
    logger.info('Tracing initialized')
  }
  process.on('exit', shutdownOtel)
  process.on('SIGINT', shutdownOtel)
  process.on('SIGTERM', shutdownOtel)
  process.on('uncaughtException', async (error) => {
    logger.error(error)
    await shutdownOtel()
    process.exit(1)
  })
}

export async function configureCollector(servicename: string) {
  // configure otel diagnostics
  const enableDiag = process.env.ENABLE_OTEL_DIAG ?? 'false'
  if (enableDiag.toLowerCase() == 'true') {
    opentelemetry.diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL)
  }

  const endpoint = process.env.COLLECTOR_ENDPOINT
  let insecure = false
  if (
    process.env.ENABLE_INSECURE_COLLECTOR == undefined ||
    process.env.ENABLE_INSECURE_COLLECTOR.toLowerCase() == 'true'
  ) {
    insecure = true
  }

  logger.info(`'${servicename}' endpoint:'${endpoint}' enableDiag:'${enableDiag}' insecure:'${insecure}'`)

  const traceExporter = new OTLPTraceExporter({
    url: endpoint,
    credentials: insecure == true ? credentials.createInsecure() : credentials.createSsl(),
    metadata,
  })

  const serviceversion = process.env.SERVICE_VERSION ?? 'unset'

  sdk = new NodeSDK({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: servicename,
      [SEMRESATTRS_SERVICE_VERSION]: serviceversion,
    }),
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // load custom configuration for http instrumentation
        '@opentelemetry/instrumentation-http': {
          applyCustomAttributesOnSpan: (span) => {
            span.setAttribute('instrumentation-http', 'true')
          },
        },
        '@opentelemetry/instrumentation-express': {},
      }),
      new HttpInstrumentation(),
    ],
  })

  if (sdk != undefined) {
    await sdk.start()
    logger.info('Tracing initialized')
  }
  process.on('exit', shutdownOtel)
  process.on('SIGINT', shutdownOtel)
  process.on('SIGTERM', shutdownOtel)
  process.on('uncaughtException', async (error) => {
    logger.error(error)
    await shutdownOtel()
    process.exit(1)
  })
}
