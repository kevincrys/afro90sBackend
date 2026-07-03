/** Canonical Lambda flows — keep in sync with scripts/flows.sh */
export const FLOWS = [
  'products-public',
  'orders-public',
  'products-admin',
  'orders-admin',
];

export function isValidFlow(flow) {
  return FLOWS.includes(flow);
}
