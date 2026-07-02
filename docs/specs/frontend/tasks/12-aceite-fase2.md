# Task 12 — Aceite Fase 2 (Login admin)

**Fase:** 2 — Login admin  
**Status:** pendente

## Objetivo

Validar fluxo de login admin sem as páginas de gestão ainda implementadas.

## Checklist de aceite

- [ ] `/admin/login` exibe formulário
- [ ] Login com credenciais válidas → redirect `/admin/pedidos`
- [ ] Login com credenciais inválidas → mensagem de erro
- [ ] `/admin/pedidos` sem sessão → redirect `/admin/login`
- [ ] Logout limpa sessão e volta ao catálogo
- [ ] Loja pública (fase 1) continua funcionando (regressão)

## Pré-requisitos

- Task 11 concluída
- Infra + backend fase 2 entregues

## Critérios de conclusão

- [ ] Checklist completo
- [ ] Atualizar **Status** para `concluída` — **fase 2 entregue**
