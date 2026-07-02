# Task 12 — Aceite Fase 1 (Site público)

**Fase:** 1 — Site público  
**Status:** pendente  
**Arquivos alvo:** [`overview.md`](../overview.md)

## Objetivo

Validar que o site público está no ar com catálogo de produtos, imagens e formulário de pedido funcionando — sem login, sem admin, sem e-mail.

## O que implementar

### Script `smoke-test-fase1.sh`

- [ ] Criar `infra/scripts/smoke-test-fase1.sh`:

```bash
#!/bin/bash
set -e
ENV=${1:-dev}

API=$(aws ssm get-parameter --name "/afro90s/${ENV}/api-base-url" --query Parameter.Value --output text)
CF=$(aws ssm get-parameter --name "/afro90s/${ENV}/cloudfront-web-url" --query Parameter.Value --output text)

echo "=== Smoke test Fase 1 — ${ENV} ==="

echo -n "GET /products (200)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${API}/products")
[ "$STATUS" = "200" ] && echo "OK" || (echo "FALHOU ($STATUS)" && exit 1)

echo -n "GET /products/{id} inexistente (404)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${API}/products/naoexiste")
[ "$STATUS" = "404" ] && echo "OK" || (echo "FALHOU ($STATUS)" && exit 1)

echo -n "POST /orders sem body (400)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${API}/orders" -H "Content-Type: application/json" -d '{}')
[ "$STATUS" = "400" ] && echo "OK" || echo "AVISO ($STATUS — verificar validação)"

echo -n "CloudFront index.html (200)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${CF}")
[ "$STATUS" = "200" ] && echo "OK" || (echo "FALHOU ($STATUS)" && exit 1)

echo -n "CloudFront SPA routing /catalogo (200)... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${CF}/catalogo")
[ "$STATUS" = "200" ] && echo "OK" || (echo "FALHOU ($STATUS)" && exit 1)

echo ""
echo "=== Fase 1 OK ==="
```

- [ ] Executar script após deploy dev: `bash infra/scripts/smoke-test-fase1.sh dev`
- [ ] Adicionar como step final no `cdk-deploy-dev.yml` (task 04)

## Checklist de aceite manual

- [ ] `cdk deploy --all -c env=dev` sem erros
- [ ] Todas as stacks da fase 1 com status `CREATE_COMPLETE`
- [ ] Script `smoke-test-fase1.sh dev` passa sem erros
- [ ] CloudFront URL abre o frontend no browser
- [ ] Rotas SPA (`/catalogo`, `/produto/123`) servem `index.html`
- [ ] `GET /products` retorna JSON com `items: []`
- [ ] `POST /orders` com body válido retorna `201` (sem e-mail)
- [ ] Pipeline CI: PR → validate/diff; merge dev → deploy automático

## Pré-requisitos

- Tasks 00–11 concluídas

## Critérios de conclusão

- [ ] Script `smoke-test-fase1.sh` executa sem erros
- [ ] Todos os itens do checklist marcados
- [ ] `overview.md` atualizado com status da fase 1
- [ ] Atualizar **Status** para `concluída` — **fase 1 entregue**
