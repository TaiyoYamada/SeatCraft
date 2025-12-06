#!/bin/bash
# ============================================================
# DynamoDB Local テーブル作成スクリプト
# ============================================================

set -e

ENDPOINT_URL="http://localhost:8000"
TABLE_NAME="seatcraft_layouts"

echo "Creating DynamoDB Local table: $TABLE_NAME"

aws dynamodb create-table \
  --endpoint-url $ENDPOINT_URL \
  --table-name $TABLE_NAME \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-northeast-1 \
  2>/dev/null || echo "Table already exists"

echo "Table created successfully!"

# テーブル一覧を表示
echo ""
echo "Available tables:"
aws dynamodb list-tables --endpoint-url $ENDPOINT_URL --region ap-northeast-1
