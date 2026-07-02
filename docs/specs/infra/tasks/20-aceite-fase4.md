# Task 20 — Aceite Fase 4 (Email + aceite final)

**Fase:** 4 — Email  
**Status:** pendente  
**Arquivos alvo:** [`overview.md`](../overview.md), [`tasks/README.md`](README.md)

## Objetivo

Validar o envio de e-mail no fluxo de pedido e declarar a infraestrutura v1 completa.

## Script de smoke test completo

- [ ] Criar `infra/scripts/smoke-test-completo.sh`:

```bash
#!/bin/bash
set -e
ENV=${1:-dev}

API=$(aws ssm get-parameter --name "/afro90s/${ENV}/api-base-url" --query Parameter.Value --output text)
CF=$(aws ssm get-parameter --name "/afro90s/${ENV}/cloudfront-web-url" --query Parameter.Value --output text)

echo "=== Smoke test completo — ${ENV} ==="

# Fase 1
echo -n "GET /products (200)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${API}/products")
[ "$STATUS" = "200" ] && echo "OK" || (echo "FALHOU ($STATUS)" && exit 1)

echo -n "CloudFront (200)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${CF}")
[ "$STATUS" = "200" ] && echo "OK" || (echo "FALHOU ($STATUS)" && exit 1)

# Fase 2 e 3
echo -n "GET /admin/products sem token (401)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${API}/admin/products")
[ "$STATUS" = "401" ] && echo "OK" || (echo "FALHOU ($STATUS)" && exit 1)

# Fase 4 — POST /orders com e-mail
echo -n "POST /orders (201 + e-mail esperado)... "
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API}/orders" \
  -H "Content-Type: application/json" \
  -d '{"customer":{"name":"Teste","address":"Rua A","postalCode":"00000-000","tel":"11999999999"},"items":[]}')
STATUS=$(echo "$RESPONSE" | tail -1)
[ "$STATUS" = "201" ] && echo "OK ($STATUS)" || (echo "FALHOU ($STATUS)" && exit 1)
echo "  → Verificar recebimento do e-mail manualmente no sandbox"

echo ""
echo "=== Smoke test completo OK ==="
```

## Checklist de aceite final

### Fase 4 — SES

- [ ] Template `afro90s-dev-ses-new-order` visível no console SES
- [ ] `POST /orders` → `201` + e-mail recebido no endereço admin verificado
- [ ] E-mail contém `orderId` e `customerName` corretos
- [ ] Variável `SES_ENABLED=true` na Lambda

### Infraestrutura completa

- [ ] Todas as 5 stacks com status `CREATE_COMPLETE` ou `UPDATE_COMPLETE` no CloudFormation
- [ ] Dashboard `afro90s-dev-dashboard` com métricas após invocações
- [ ] Log groups com retenção 14 dias
- [ ] Script `smoke-test-completo.sh dev` executa sem erros
- [ ] Pipeline CI: validate/diff em PRs + deploy automático por branch funcionando
- [ ] `outputs-dev.json` gerado corretamente pelo CI

### Regressão completa

- [ ] Fase 1: site público + rotas públicas + POST /orders
- [ ] Fase 2: login Cognito funcional
- [ ] Fase 3: CRUD products + orders admin via token
- [ ] Fase 4: e-mail enviado no POST /orders

## Pré-requisitos

- Tasks 00–19 todas concluídas

## Critérios de conclusão

- [ ] Script `smoke-test-completo.sh dev` passa sem erros
- [ ] Todos os itens do checklist marcados
- [ ] `overview.md` critérios de aceite marcados como cumpridos
- [ ] `tasks/README.md` com todas as tasks `concluída`
- [ ] Atualizar **Status** para `concluída` — **infraestrutura v1 completa**
