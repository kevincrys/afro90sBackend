#!/usr/bin/env bash
set -euo pipefail

# Deploy one Lambda flow: upload zip to S3 and update-function-code.
# Usage: deploy-flow.sh <flow> <env> [zip-path]
# Requires: ARTIFACT_BUCKET, GITHUB_SHA, AWS credentials (OIDC).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=flows.sh
source "${SCRIPT_DIR}/flows.sh"

FLOW="${1:?flow required (e.g. products-public)}"
ENV="${2:?env required (dev|prod)}"
ZIP="${3:-lambda.zip}"
SHA="${GITHUB_SHA:?GITHUB_SHA required}"

if [[ "${ENV}" != "dev" && "${ENV}" != "prod" ]]; then
  echo "Invalid env: ${ENV} (expected dev or prod)" >&2
  exit 1
fi

if ! is_valid_flow "${FLOW}"; then
  echo "Invalid flow: ${FLOW} (expected one of: ${FLOWS[*]})" >&2
  exit 1
fi

if [[ ! -f "${ZIP}" ]]; then
  echo "Zip not found: ${ZIP}" >&2
  exit 1
fi

BUCKET="${ARTIFACT_BUCKET:?ARTIFACT_BUCKET required}"

SSM_NAME="/afro90s/${ENV}/lambda-${FLOW}-name"

FN=$(aws ssm get-parameter \
  --name "${SSM_NAME}" \
  --query Parameter.Value \
  --output text)

echo "Deploying ${FLOW} (${ENV}) → ${FN}"

aws s3 cp "${ZIP}" "s3://${BUCKET}/${FLOW}/${SHA}.zip"
aws s3 cp "${ZIP}" "s3://${BUCKET}/${FLOW}/latest.zip"

aws lambda update-function-code \
  --function-name "${FN}" \
  --s3-bucket "${BUCKET}" \
  --s3-key "${FLOW}/latest.zip"

aws lambda wait function-updated-v2 --function-name "${FN}"

echo "Done: ${FLOW}"
