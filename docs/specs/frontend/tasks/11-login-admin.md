# Task 11 — Login admin (Cognito + Amplify)

**Fase:** 2 — Login admin  
**Status:** pendente  
**Arquivos alvo:** [`integration.md`](../integration.md)

## Objetivo

Implementar autenticação admin via AWS Amplify Auth (SRP) e proteção de rotas `/admin/*`.

## Configurações já definidas

| Decisão | Valor |
|---------|-------|
| Biblioteca | Amplify `configure` + `signIn` (SRP) |
| Token storage | `sessionStorage` (ou cookie se possível) |
| Refresh automático | Sim (1h refresh, access token diário) |
| Redirect pós-login | `/admin/pedidos` |
| Logout | Limpa token + cache React Query admin |
| `403` sem grupo admins | Mensagem específica em pt-BR |

## O que implementar

### `src/lib/amplify.ts`

```typescript
import { Amplify } from 'aws-amplify';
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    },
  },
});
```

### `src/pages/admin/AdminLoginPage.tsx`

- [ ] Formulário email + senha
- [ ] `signIn({ username, password })` via Amplify
- [ ] Loading state no submit
- [ ] Erro de credenciais → toast em pt-BR
- [ ] Sucesso → redirect para `/admin/pedidos`

### `src/components/ProtectedRoute.tsx`

- [ ] Verificar sessão Amplify (`fetchAuthSession`)
- [ ] Sem sessão → `<Navigate to="/admin/login" />`
- [ ] Com sessão → renderizar `<Outlet>`

### Interceptor Axios (task 03)

- [ ] Adicionar `Authorization: Bearer {accessToken}` em requests para `/admin/*`
- [ ] Em `401` → redirect para `/admin/login` + limpar sessão

### Logout

- [ ] Botão no header admin → `signOut()` + `queryClient.clear()` + redirect `/`

## Pré-requisitos

- Fase 1 entregue (task 10)
- Infra fase 2 (Cognito) + backend fase 2 deployados

## Critérios de conclusão

- [ ] Login funcional com usuário admin criado no Cognito
- [ ] Rotas `/admin/*` redirecionam para login sem sessão
- [ ] Logout limpa sessão e cache
- [ ] Atualizar **Status** para `concluída`
