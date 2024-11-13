#!/bin/bash

NUM_CALLS=10

IS_ROOT="true"
DESCRIPTION="Smartphone Category"

for ((i=1; i<=NUM_CALLS; i++))
do
  CATEGORY_NAME="Smartphones_$i"
  echo "Invoking createCategory for category: $CATEGORY_NAME"

  serverless invoke local -f createCategory --config serverless-dev.yml -d "{\"body\": \"{\\\"name\\\": \\\"$CATEGORY_NAME\\\", \\\"isRoot\\\": $IS_ROOT, \\\"description\\\": \\\"$DESCRIPTION\\\"}\"}"
  
done
