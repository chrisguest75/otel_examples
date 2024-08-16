# PYTHON FASTAPI TRACING

Demonstrate OTEL fastapi tracing  

## Contents

- [PYTHON FASTAPI TRACING](#python-fastapi-tracing)
  - [Contents](#contents)
  - [Prepare](#prepare)
  - [Start](#start)
  - [Just](#just)
  - [Testing](#testing)
  - [Configuration](#configuration)
  - [Debugging and Troubleshooting](#debugging-and-troubleshooting)
    - [Container](#container)
    - [Interpreter](#interpreter)
    - [Pipenv Environment](#pipenv-environment)
    - [Single step](#single-step)
      - [Application](#application)
      - [Tests](#tests)
  - [Resources](#resources)

## Prepare

If using `vscode` remember to set your interpreter location to `.venv/bin/python`

## Start

```sh
export PIPENV_VENV_IN_PROJECT=1
# install
pipenv install --dev

# lint and test code
pipenv run format
pipenv run lint
pipenv run test

# enter venv
pipenv shell

# create .env file
cp .env.template .env

# run with arguments
pipenv run start:fastapi
```

## Just

```sh
# terminal 1
just collector-restart 
# you can check collector metrics here.
curl 0.0.0.0:8888/metrics

# terminal 2
just service-run

# terminal 3
just tests-run-simple
just tests-run

# from windows browser
open http://127.0.0.1:8000/
open http://127.0.0.1:8000/docs
```

## Testing

```sh
ENDPOINT=http://0.0.0.0:8000
curl -vvv --parallel --parallel-immediate --parallel-max 10  ${ENDPOINT}/sleep/12 ${ENDPOINT}/sleep/12 ${ENDPOINT}/sleep/12 ${ENDPOINT}/sleep/12 ${ENDPOINT}/sleep/12 ${ENDPOINT}/sleep/12 ${ENDPOINT}/status/200 ${ENDPOINT}/status/200 ${ENDPOINT}/status/200
```

## Configuration

```sh
pipenv  install opentelemetry-distro
pipenv run -- opentelemetry-bootstrap -a install


pipenv run -- opentelemetry-instrument --help
pipenv run -- opentelemetry-instrument --traces_exporter console --metrics_exporter console --logs_exporter console --service_name 01_python_fastapi_tracing --disabled_instrumentations aws-lambda --log_level TRACE fastapi dev main.py

pipenv run -- opentelemetry-instrument --traces_exporter console --metrics_exporter console --logs_exporter console --service_name 01_python_fastapi_tracing --log_level TRACE fastapi dev main.py
```

## Debugging and Troubleshooting

### Container

```sh
dive 01_python_fastapi_tracing:latest

docker exec -it 01_python_fastapi_tracing /bin/bash
```

### Interpreter

Set the interpreter path to `./01_python_fastapi_tracing/.venv/bin/python3.11`

### Pipenv Environment

```sh
# enter python
pipenv run python

> import main

> main.test.__doc__
```

### Single step

#### Application

- Copy the `launch.json` to the root `.vscode`
- `. ./.env` in the terminal

#### Tests

- Configure pytest using the beaker icon in `vscode`
- You can run and debug the discovered tests

## Resources

- Python testing in Visual Studio Code [here](https://code.visualstudio.com/docs/python/testing#_example-test-walkthroughs)
- FastAPI framework, high performance, easy to learn, fast to code, ready for production [here](https://fastapi.tiangolo.com/#installation)
- An ASGI web server, for Python. [here](https://www.uvicorn.org/)
- OpenTelemetry FastAPI Instrumentation [here](https://opentelemetry-python-contrib.readthedocs.io/en/latest/instrumentation/fastapi/fastapi.html)  
- https://opentelemetry.io/docs/languages/python/
- https://opentelemetry.io/docs/languages/python/getting-started/
- https://coralogix.com/blog/configure-otel-demo-send-telemetry-data-coralogix/
- https://github.com/open-telemetry/opentelemetry-demo/tree/v1.0.0
- https://docs.wavefront.com/opentelemetry_python_app_tutorial.html#step-3-configuring-the-opentelemetry-exporter
- https://opentelemetry-python.readthedocs.io/en/latest/sdk/environment_variables.html#opentelemetry.sdk.environment_variables.OTEL_EXPORTER_OTLP_TRACES_INSECURE