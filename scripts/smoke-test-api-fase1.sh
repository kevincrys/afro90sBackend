#!/usr/bin/env bash
# API-only phase 1 smoke test — run after Lambda deploy (afro90sBackend CI).
set -euo pipefail

ENV="${1:-dev}"
REGION="${AWS_REGION:-us-east-1}"
MISSING_PRODUCT_ID="550e8400-e29b-41d4-a716-446655440000"

API=$(aws ssm get-parameter --region "${REGION}" --name "/afro90s/${ENV}/api-base-url" --query Parameter.Value --output text)

api_url() {
  echo "${API}/${ENV}$1"
}

echo "=== API smoke test Phase 1 — ${ENV} ==="

echo -n "GET /products (200, items[])... "
RESPONSE=$(curl -s -w "\n%{http_code}" "$(api_url /products)")
HTTP=$(echo "${RESPONSE}" | tail -n 1)
BODY=$(echo "${RESPONSE}" | sed '$d')
if [ "${HTTP}" != "200" ] || ! echo "${BODY}" | grep -q '"items"'; then
  echo "FAILED (HTTP ${HTTP})" && exit 1
fi
echo "OK"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$(api_url '/products?name=cat')")
[ "${STATUS}" = "200" ] && echo "GET /products?name=cat: OK" || (echo "GET /products?name=cat: FAILED (${STATUS})" && exit 1)

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$(api_url /products/naoexiste)")
[ "${STATUS}" = "400" ] && echo "GET /products invalid id: OK" || (echo "GET /products invalid id: FAILED (${STATUS})" && exit 1)

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$(api_url "/products/${MISSING_PRODUCT_ID}")")
[ "${STATUS}" = "404" ] && echo "GET /products missing: OK" || (echo "GET /products missing: FAILED (${STATUS})" && exit 1)

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$(api_url /orders)" -H "Content-Type: application/json" -d '{}')
[ "${STATUS}" = "400" ] && echo "POST /orders empty: OK" || (echo "POST /orders empty: FAILED (${STATUS})" && exit 1)

echo -n "POST /orders valid body (201 or 409)... "
PRODUCT_ID=$(echo "${BODY}" | sed -n 's/.*"id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
if [ -z "${PRODUCT_ID}" ]; then
  echo "SKIP (no products in catalog)"
else
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$(api_url /orders)" \
    -H "Content-Type: application/json" \
    -d "{\"customer\":{\"name\":\"Smoke Test\",\"address\":\"Rua Teste 1\",\"postalCode\":\"01310100\",\"tel\":\"11999999999\"},\"items\":[{\"productId\":\"${PRODUCT_ID}\",\"quantity\":1}]}")
  if [ "${STATUS}" = "201" ] || [ "${STATUS}" = "409" ]; then
    echo "OK (${STATUS})"
  else
    echo "FAILED (${STATUS})" && exit 1
  fi
fi

echo "=== API smoke test passed ==="
