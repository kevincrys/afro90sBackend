# ADR-006: Integração WhatsApp para conclusão de pedidos

**Status:** Proposto  
**Data:** 2025-06-23  
**Autores:** Equipe Afro90s

## Contexto

Na v1, pedidos não passam por gateway de pagamento. A conclusão da compra depende de contato via WhatsApp entre cliente e loja. O backend cria o pedido e envia e-mail (SES); o canal WhatsApp ainda precisa ser definido.

## Decisão (recomendação v1)

**Opção A — Link `wa.me` montado no frontend (recomendada para v1)**

- Após `POST /orders` com sucesso, o frontend abre link WhatsApp com mensagem pré-formatada (itens, total, ID do pedido)
- Backend não chama API do WhatsApp
- Número da loja em variável de ambiente `VITE_WHATSAPP_NUMBER`

**Opção B — WhatsApp Business API no backend (futuro)**

- Lambda envia mensagem automática ao criar pedido
- Requer conta Meta Business, templates aprovados, custo por mensagem
- Maior automação; complexidade de setup

> **Pendente de confirmação final.** Implementar v1 com Opção A; revisar ADR quando Opção B for necessária.

## Alternativas consideradas

| Alternativa | Motivo de rejeição / nota |
|-------------|--------------------------|
| Apenas e-mail (SES) | Insuficiente — WhatsApp é canal principal de negociação/pagamento |
| SMS | Custo; menos usado pelo público-alvo |
| Opção B na v1 | Aumenta escopo e dependências externas sem necessidade imediata |

## Consequências

**Positivas (Opção A)**

- Zero integração backend com Meta
- Cliente inicia conversa imediatamente após pedido
- Implementação rápida

**Negativas (Opção A)**

- Depende do cliente clicar no link
- Mensagem não é rastreada pelo backend

## Referências

- [Project overview](../project-overview.md)
- [Spec frontend integration](../../specs/frontend/integration.md)
