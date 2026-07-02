# ADR-003: AWS CDK para Infrastructure as Code

**Status:** Aceito  
**Data:** 2025-06-23  
**Autores:** Equipe Afro90s

## Contexto

Com AWS definida como cloud provider (ADR-002), precisamos escolher a ferramenta de IaC. A stack de aplicação usa TypeScript (React + Lambda Node.js).

## Decisão

Adotar **AWS CDK (Cloud Development Kit)** em **TypeScript** para definir toda a infraestrutura.

- Código IaC em `infra/` na raiz do repositório `afro90sInfra`
- Stacks separadas por domínio (frontend, API, dados, auth)
- Ambientes controlados via context CDK (`-c env=dev|production`)

## Alternativas consideradas

| Alternativa | Motivo de rejeição |
|-------------|-------------------|
| Terraform | Linguagem HCL separada da stack TypeScript da aplicação |
| Pulumi | Viável, mas CDK tem integração nativa com constructs AWS |
| CloudFormation raw | Verboso; CDK gera CFN com abstrações de alto nível |
| SAM | Focado em serverless; CDK cobre SPA + API + dados de forma unificada |

## Consequências

**Positivas**

- Mesma linguagem (TypeScript) em infra, backend e tipos compartilháveis
- Constructs reutilizáveis e testáveis
- Synth gera CloudFormation auditável

**Negativas**

- Dependência de versões CDK/AWS
- Debugging de synth/deploy pode ser indireto via CloudFormation

## Referências

- [ADR-002](002-aws-cloud-provider.md)
- [Spec CDK](../../specs/infra/cdk.md)
