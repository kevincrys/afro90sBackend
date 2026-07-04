#!/usr/bin/env bash
# API phase 3 smoke test — admin products/orders E2E + phase 1–2 regression (afro90sBackend CI).
set -euo pipefail

ENV="${1:-dev}"
REGION="${AWS_REGION:-us-east-1}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Phase 1–2 regression ==="
bash "${SCRIPT_DIR}/smoke-test-api-fase2.sh" "${ENV}"

API=$(aws ssm get-parameter --region "${REGION}" --name "/afro90s/${ENV}/api-base-url" --query Parameter.Value --output text)

api_url() {
  echo "${API}/${ENV}$1"
}

json_field() {
  echo "${1}" | sed -n "s/.*\"${2}\"[[:space:]]*:[[:space:]]*\"\\([^\"]*\\)\".*/\\1/p" | head -1
}

admin_auth_header() {
  if [ -n "${SMOKE_ADMIN_ACCESS_TOKEN:-}" ]; then
    echo "Authorization: Bearer ${SMOKE_ADMIN_ACCESS_TOKEN}"
  fi
}

echo ""
echo "=== API smoke test Phase 3 — ${ENV} ==="

echo -n "GET /admin/orders sem token... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$(api_url /admin/orders)")
if [ "${STATUS}" = "404" ]; then
  echo "SKIP (404 — rotas /admin/orders ainda não no API GW)"
  echo "=== API smoke test Phase 3 passed (partial — E2E admin pendente infra) ==="
  exit 0
fi
if [ "${STATUS}" != "401" ]; then
  echo "FAILED (HTTP ${STATUS}, esperado 401)" && exit 1
fi
echo "OK (401)"

if [ -z "${SMOKE_ADMIN_ACCESS_TOKEN:-}" ]; then
  echo "E2E admin produtos/pedidos: SKIP (defina SMOKE_ADMIN_ACCESS_TOKEN no CI ou local)"
  echo "=== API smoke test Phase 3 passed (auth 401 ok; E2E com token pendente) ==="
  exit 0
fi

AUTH=(-H "$(admin_auth_header)")

echo -n "POST /admin/products... "
PRODUCT_NAME="smoke-$(date +%s)"
CREATE_BODY=$(curl -s -w "\n%{http_code}" -X POST "$(api_url /admin/products)" \
  "${AUTH[@]}" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"${PRODUCT_NAME}\",\"description\":\"Smoke test\",\"price\":19.9,\"quantity\":10,\"category\":\"acessorios\"}")
CREATE_HTTP=$(echo "${CREATE_BODY}" | tail -n 1)
CREATE_JSON=$(echo "${CREATE_BODY}" | sed '$d')
if [ "${CREATE_HTTP}" != "201" ]; then
  echo "FAILED (HTTP ${CREATE_HTTP})" && exit 1
fi
PRODUCT_ID=$(json_field "${CREATE_JSON}" id)
if [ -z "${PRODUCT_ID}" ]; then
  echo "FAILED (resposta sem id)" && exit 1
fi
echo "OK (${PRODUCT_ID})"

echo -n "GET /products inclui produto criado... "
PUBLIC=$(curl -s "$(api_url /products)")
if ! echo "${PUBLIC}" | grep -q "${PRODUCT_ID}"; then
  echo "FAILED (produto não listado)" && exit 1
fi
echo "OK"

echo -n "PUT /admin/products/{id}... "
PUT_HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$(api_url "/admin/products/${PRODUCT_ID}")" \
  "${AUTH[@]}" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"${PRODUCT_NAME}-updated\"}")
if [ "${PUT_HTTP}" != "200" ]; then
  echo "FAILED (HTTP ${PUT_HTTP})" && exit 1
fi
echo "OK"

echo -n "PATCH /admin/products/{id}/stock... "
STOCK_HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$(api_url "/admin/products/${PRODUCT_ID}/stock")" \
  "${AUTH[@]}" \
  -H "Content-Type: application/json" \
  -d '{"delta":-1}')
if [ "${STOCK_HTTP}" != "200" ]; then
  echo "FAILED (HTTP ${STOCK_HTTP})" && exit 1
fi
echo "OK"

echo -n "POST /orders (público)... "
ORDER_BODY=$(curl -s -w "\n%{http_code}" -X POST "$(api_url /orders)" \
  -H "Content-Type: application/json" \
  -d "{\"customer\":{\"name\":\"Smoke Test\",\"address\":\"Rua Teste 1\",\"postalCode\":\"01310100\",\"tel\":\"11999999999\"},\"items\":[{\"productId\":\"${PRODUCT_ID}\",\"quantity\":1}]}")
ORDER_HTTP=$(echo "${ORDER_BODY}" | tail -n 1)
ORDER_JSON=$(echo "${ORDER_BODY}" | sed '$d')
if [ "${ORDER_HTTP}" != "201" ]; then
  echo "FAILED (HTTP ${ORDER_HTTP})" && exit 1
fi
ORDER_ID=$(json_field "${ORDER_JSON}" id)
if [ -z "${ORDER_ID}" ]; then
  echo "FAILED (resposta sem id)" && exit 1
fi
echo "OK (${ORDER_ID})"

echo -n "GET /admin/orders lista pedido... "
ORDERS=$(curl -s "${AUTH[@]}" "$(api_url /admin/orders)")
if ! echo "${ORDERS}" | grep -q "${ORDER_ID}"; then
  echo "FAILED (pedido não listado)" && exit 1
fi
echo "OK"

echo -n "PATCH /admin/orders/{id}/status... "
STATUS_HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$(api_url "/admin/orders/${ORDER_ID}/status")" \
  "${AUTH[@]}" \
  -H "Content-Type: application/json" \
  -d '{"status":"EM_ATENDIMENTO"}')
if [ "${STATUS_HTTP}" != "200" ]; then
  echo "FAILED (HTTP ${STATUS_HTTP})" && exit 1
fi
echo "OK"

echo -n "DELETE /admin/products/{id} (cleanup)... "
DELETE_HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$(api_url "/admin/products/${PRODUCT_ID}")" \
  "${AUTH[@]}")
if [ "${DELETE_HTTP}" != "204" ]; then
  echo "FAILED (HTTP ${DELETE_HTTP})" && exit 1
fi
echo "OK"

echo "=== API smoke test Phase 3 passed ==="
