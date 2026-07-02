# Task 10 — Aceite Fase 1 (Site público)

**Fase:** 1 — Site público  
**Status:** pendente

## Objetivo

Validar que a loja pública está funcional end-to-end — sem login, sem admin.

## Checklist de aceite

- [ ] `https://*.cloudfront.net` abre o site
- [ ] Catálogo carrega e pagina (scroll infinito)
- [ ] Busca por nome funciona (Enter)
- [ ] Filtro por categoria funciona
- [ ] Detalhe do produto abre com galeria
- [ ] Adicionar ao carrinho atualiza badge
- [ ] Carrinho persiste após reload
- [ ] Checkout cria pedido (`201`) e abre WhatsApp
- [ ] Produto esgotado exibe overlay e botão desabilitado
- [ ] Skeletons visíveis durante loading
- [ ] Responsivo em 375px (mobile) e 1280px (desktop)
- [ ] Deploy automático via CI (merge em `dev`)

## Pré-requisitos

- Tasks 00–09 concluídas
- Infra + backend fase 1 entregues

## Critérios de conclusão

- [ ] Checklist completo
- [ ] Atualizar **Status** para `concluída` — **fase 1 entregue**
