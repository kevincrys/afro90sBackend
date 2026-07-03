# Task 00 — Setup do repositório afro90sFrontend

**Fase:** 0 — Fundação  
**Status:** pendente  
**Repo:** `afro90sFrontend`

## Objetivo

Criar e configurar o repositório `afro90sFrontend` com stack React + Vite antes de implementar qualquer página.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Framework | React 18 + Vite + TypeScript |
| CSS | Tailwind CSS |
| Estado carrinho | Zustand |
| HTTP | Axios |
| Auth admin | AWS Amplify Auth (SRP) |
| Testes unitários | Vitest + Testing Library |
| Testes E2E | Cypress (fase 4) |
| Gerenciador | npm |

## O que implementar

### Criar projeto

```bash
npm create vite@latest afro90sFrontend -- --template react-ts
cd afro90sFrontend
npm install
```

### Dependências

```bash
npm install react-router-dom @tanstack/react-query axios zustand
npm install aws-amplify @aws-amplify/ui-react
npm install zod react-hook-form @hookform/resolvers
npm install sonner
npm install -D tailwindcss postcss autoprefixer
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D eslint prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### Estrutura `src/`

```
src/
├── main.tsx
├── App.tsx
├── routes/
│   ├── index.tsx           # definição de rotas
│   ├── PublicRoutes.tsx
│   └── AdminRoutes.tsx
├── pages/
│   ├── catalog/
│   ├── product/
│   ├── checkout/
│   └── admin/
├── components/
│   ├── ui/                 # Button, Input, Card, Skeleton
│   └── layout/             # Header, Footer
├── api/                    # cliente HTTP (task 03)
├── stores/                 # Zustand (carrinho)
├── hooks/
├── types/                  # espelha backend data-models
├── lib/
│   └── amplify.ts          # config Cognito (fase 2)
└── styles/
    └── globals.css
```

### Configuração

- [ ] `tailwind.config.js` com content `['./index.html', './src/**/*.{js,ts,jsx,tsx}']`
- [ ] `tsconfig.json` com `strict: true`
- [ ] `.env.example`:
  ```
  VITE_API_BASE_URL=
  VITE_ASSETS_CDN_URL=
  VITE_WHATSAPP_NUMBER=
  VITE_COGNITO_USER_POOL_ID=
  VITE_COGNITO_CLIENT_ID=
  VITE_COGNITO_REGION=us-east-1
  ```
- [ ] `.gitignore`: `node_modules/`, `dist/`, `.env`
- [ ] ESLint + Prettier configurados

### Scripts `package.json`

- [ ] `"dev": "vite"`
- [ ] `"build": "tsc -b && vite build"`
- [ ] `"preview": "vite preview"`
- [ ] `"test": "vitest run"`
- [ ] `"lint": "eslint src"`

## Pré-requisitos

Nenhum — primeira task do frontend.

## Critérios de conclusão

- [ ] `npm run dev` abre em `localhost:5173`
- [ ] `npm run build` sem erros
- [ ] Estrutura de pastas criada
- [ ] Atualizar **Status** para `concluída`
