# syntax=docker/dockerfile:1.4
FROM python:3.11.9-slim-bullseye AS build-env

# Prevents Python from writing pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# Keeps Python from buffering stdout and stderr to avoid situations where
# the application crashes without emitting any logs due to buffering.
ENV PYTHONUNBUFFERED=1

RUN pip install pipenv

ARG USERID=1000
ARG GROUPID=1000
RUN addgroup --system --gid $GROUPID appuser
RUN adduser --system --uid $USERID --gid $GROUPID appuser

WORKDIR /workbench
COPY ./Pipfile /workbench/Pipfile
COPY ./Pipfile.lock /workbench/Pipfile.lock 

# RUN PIPENV_VENV_IN_PROJECT=1 pipenv run test
#RUN set -ex && pipenv install --deploy --system
RUN pipenv install --deploy --system --dev

ENV TEST_CONFIG="This is a test value from .env"
COPY <<EOF /workbench/.env
export TEST_CONFIG="This is a test value from .env"
export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
EOF

#CMD ["fastapi", "run", "main.py"]
#CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
#CMD 
COPY --chmod=755 <<EOF /workbench/start.sh
#!/usr/bin/env bash
. ./.env
env
opentelemetry-instrument --traces_exporter console --metrics_exporter console --logs_exporter console --service_name 01_python_fastapi_tracing --log_level TRACE uvicorn main:app --host 0.0.0.0
#opentelemetry-instrument --traces_exporter oltp --metrics_exporter oltp --service_name 01_python_fastapi_tracing --log_level TRACE uvicorn main:app --host 0.0.0.0
EOF

COPY ./tests /workbench/tests
COPY ./main.py /workbench
COPY ./logging_config.yaml /workbench

USER appuser
CMD ["./start.sh"]

