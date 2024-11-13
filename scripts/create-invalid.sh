#!/bin/bash

serverless invoke local -f createCategory --config serverless-dev.yml -d '{"body": "{\"name\": \"Electronics\", \"isRoot\": true}"}'