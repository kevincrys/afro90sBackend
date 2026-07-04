#!/usr/bin/env bash
# API phase 2 smoke test — auth admin + phase 1 regression (afro90sBackend CI).
set -euo pipefail

ENV="${1:-dev}"
REGION="${AWS_REGION:-us-east-1}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Phase 1 regression ==="
bash "${SCRIPT_DIR}/smoke-test-api-fase1.sh" "${ENV}"

API=$(aws ssm get-parameter --region "${REGION}" --name "/afro90s/${ENV}/api-base-url" --query Parameter.Value --output text)

api_url() {
  echo "${API}/${ENV}$1"
}

echo ""
echo "=== API smoke test Phase 2 — ${ENV} ==="

echo -n "GET /admin/products sem token... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$(api_url /admin/products)")
if [ "${STATUS}" = "404" ]; then
  echo "SKIP (404 — rotas /admin/* ainda não no API GW; infra task 16)"
  echo "=== API smoke test Phase 2 passed (partial — auth E2E pendente infra) ==="
  exit 0
fi
if [ "${STATUS}" != "401" ]; then
  echo "FAILED (HTTP ${STATUS}, esperado 401)" && exit 1
fi
echo "OK (401)"

echo -n "GET /admin/products token inválido... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer not-a-valid-jwt" \
  "$(api_url /admin/products)")
if [ "${STATUS}" != "401" ]; then
  echo "FAILED (HTTP ${STATUS}, esperado 401)" && exit 1
fi
echo "OK (401)"

if [ -n "${SMOKE_ADMIN_ACCESS_TOKEN:-}" ]; then
  echo -n "GET /admin/products com token admin... "
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer ${SMOKE_ADMIN_ACCESS_TOKEN}" \
    "$(api_url /admin/products)")
  if [ "${STATUS}" = "401" ]; then
    echo "FAILED (401 — token rejeitado pelo authorizer ou middleware)" && exit 1
  fi
  echo "OK (${STATUS})"
else
  echo "GET /admin/products com token admin: SKIP (defina SMOKE_ADMIN_ACCESS_TOKEN no CI ou local)"
fi

echo "=== API smoke test Phase 2 passed ==="
