#!/bin/bash

CATEGORY_ID="613a4baa-4445-469b-b862-5dce2bf80e63"

echo "Invoking removeCategory for category: $CATEGORY_ID"

serverless invoke local -f removeCategory --config serverless-dev.yml --data "$(cat <<EOF
{
  "pathParameters": {
    "categoryId": "$CATEGORY_ID"
  }
}
EOF
)"
