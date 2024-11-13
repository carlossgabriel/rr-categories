PARENT_ID="da0bd45f-e775-4ae2-8da1-331ce1a83e48"

echo "Invoking listCategory"

FILTERS='{
  "enabled": true,
  "depth": 2,
  "parentId": "'$PARENT_ID'",
  "deleted": false,
  "name": "example"
}'

serverless invoke local -f listCategories \
  --config serverless-dev.yml \
  --data '{
    "queryStringParameters": '$FILTERS'
  }'
