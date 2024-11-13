#!/bin/bash

NUM_CALLS=20

PARENT_ID="d272f9d4-b6ed-48dc-bc0b-8647fd2809c1"
IS_ROOT="false"
DESCRIPTION="Iphone 16 CASE COLOR"

for ((i=1; i<=NUM_CALLS; i++))
do
  CATEGORY_NAME="Iphone_16 CASE SCREEN COLOR: $i"
  echo "Invoking createCategory for category: $CATEGORY_NAME"

  serverless invoke local -f createCategory --config serverless-dev.yml -d "{\"body\": \"{\\\"name\\\": \\\"$CATEGORY_NAME\\\", \\\"parentId\\\": \\\"$PARENT_ID\\\", \\\"isRoot\\\": $IS_ROOT, \\\"description\\\": \\\"$DESCRIPTION\\\"}\"}"
done
