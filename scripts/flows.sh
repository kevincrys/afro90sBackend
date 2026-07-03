#!/usr/bin/env bash
# Canonical list of Lambda deploy flows (must match infra SSM + API routes).
FLOWS=(
  products-public
  orders-public
  products-admin
  orders-admin
)

is_valid_flow() {
  local candidate="$1"
  local flow
  for flow in "${FLOWS[@]}"; do
    if [[ "${flow}" == "${candidate}" ]]; then
      return 0
    fi
  done
  return 1
}
