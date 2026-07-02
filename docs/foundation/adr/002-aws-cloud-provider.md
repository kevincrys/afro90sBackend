# ADR-002: AWS como cloud provider

**Status:** Aceito  
**Data:** 2025-06-23  
**Autores:** Equipe Afro90s

## Contexto

O projeto Afro90s precisa de infraestrutura serverless escalável para e-commerce: hospedagem de SPA, API, banco de dados, autenticação de admin, envio de e-mail e armazenamento de imagens de produtos.

## Decisão

Adotar **Amazon Web Services (AWS)** como único cloud provider para os ambientes **`dev`** e **`production`** (v1).

Serviços principais:

- S3 + CloudFront — frontend SPA e imagens de produtos
- API Gateway + Lambda — API REST serverless
- DynamoDB — persistência de produtos e pedidos
- Cognito — autenticação de administradores
- SES — notificações por e-mail de novos pedidos

## Alternativas consideradas

| Alternativa | Motivo de rejeição |
|-------------|-------------------|
| GCP | Menor alinhamento com stack serverless já definida pela equipe |
| Azure | Mesmo motivo; curva adicional sem benefício claro |
| Multi-cloud | Complexidade desnecessária para v1 |

## Consequências

**Positivas**

- Ecossistema integrado (IAM, CloudWatch, CDK)
- Modelo pay-per-use adequado a tráfego inicial variável
- Documentação e exemplos abundantes para serverless

**Negativas**

- Vendor lock-in moderado
- Curva de aprendizado em serviços AWS específicos

## Referências

- [Arquitetura](../architecture.md)
- [Spec infra](../../specs/infra/overview.md)
