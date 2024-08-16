# PYTHON FASTAPI TRACING

Demonstrate OTEL fastapi tracing  

## Contents

- [PYTHON FASTAPI TRACING](#python-fastapi-tracing)
  - [Contents](#contents)
  - [Prepare](#prepare)
  - [Start](#start)
  - [Configuration](#configuration)
  - [Debugging and Troubleshooting](#debugging-and-troubleshooting)
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

## Configuration

```sh
pipenv  install opentelemetry-distro
pipenv run -- opentelemetry-bootstrap -a install

export OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED=true
pipenv run -- opentelemetry-instrument \
    --traces_exporter console \
    --metrics_exporter console \
    --logs_exporter console \
    --service_name 01_python_fastapi_tracing \
    fastapi dev main.py
```

## Debugging and Troubleshooting

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