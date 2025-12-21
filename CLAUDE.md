# API Tests Playwright

Projeto de automação de testes de API utilizando Playwright + TypeScript.

## Stack Tecnológico

| Categoria | Tecnologia | Versão | Descrição |
|-----------|------------|--------|-----------|
| Framework | Playwright | 1.49+ | API Testing framework |
| Linguagem | TypeScript | 5.x | Strict mode habilitado |
| Runtime | Node.js | 20+ | JavaScript runtime |
| Reports | HTML + Allure | - | Relatórios de teste |
| CI/CD | GitHub Actions | - | Automação de pipeline |

---

## URLs

### API Target

| Ambiente | URL |
|----------|-----|
| Produção | https://api-project-gules.vercel.app |
| Staging | https://api-project-gules.vercel.app |
| Desenvolvimento | http://localhost:3000 |
| Swagger | https://api-project-gules.vercel.app/docs |

### Repositórios

| Recurso | URL |
|---------|-----|
| API Project | https://github.com/filipeCardorso/api-project |
| Este Repo | https://github.com/filipeCardorso/api-tests-playwright |

---

## Arquitetura

### Estrutura de Diretórios

```
api-tests-playwright/
├── src/
│   ├── tests/                 # Arquivos de teste
│   │   ├── auth/              # Testes de autenticação
│   │   │   ├── login.spec.ts
│   │   │   ├── register.spec.ts
│   │   │   ├── refresh-token.spec.ts
│   │   │   ├── logout.spec.ts
│   │   │   └── me.spec.ts
│   │   ├── users/             # Testes de usuários
│   │   │   ├── list-users.spec.ts
│   │   │   ├── get-user.spec.ts
│   │   │   ├── update-user.spec.ts
│   │   │   └── delete-user.spec.ts
│   │   └── health/            # Testes de health check
│   │       └── health.spec.ts
│   ├── helpers/               # Utilitários
│   │   ├── api-client.ts      # HTTP client wrapper
│   │   └── auth-helper.ts     # Autenticação helpers
│   ├── fixtures/              # Fixtures do Playwright
│   │   ├── api-fixtures.ts    # Fixtures customizados
│   │   ├── global-setup.ts    # Setup global
│   │   └── global-teardown.ts # Teardown global
│   ├── data/                  # Dados de teste
│   │   └── test-data.ts       # Constantes e geradores
│   └── types/                 # TypeScript types
│       └── api.types.ts       # Interfaces da API
├── reports/                   # Relatórios gerados
├── .github/workflows/         # GitHub Actions
├── playwright.config.ts       # Configuração Playwright
├── package.json
└── tsconfig.json
```

### Descrição dos Módulos

| Arquivo | Responsabilidade |
|---------|------------------|
| `api-client.ts` | Wrapper HTTP para requisições com headers, auth, etc. |
| `auth-helper.ts` | Login, register, refresh token, logout |
| `api-fixtures.ts` | Fixtures reutilizáveis para testes |
| `test-data.ts` | Dados de teste, geradores, constantes |
| `api.types.ts` | Interfaces TypeScript para API |

---

## Testes Implementados

### Health Check (@health @smoke)

| Endpoint | Cenários |
|----------|----------|
| GET /api/health | Status healthy, database connection, memory info, response time |
| GET /api/v1 | Version info, content-type |

### Autenticação (@auth)

| Endpoint | Cenários |
|----------|----------|
| POST /api/auth/register | Registro válido, validações, email duplicado |
| POST /api/auth/login | Login válido, credenciais inválidas, email não verificado |
| POST /api/auth/refresh | Refresh token válido, token rotation, token inválido |
| POST /api/auth/logout | Logout válido, invalidação de token |
| GET /api/auth/me | Dados do usuário, token inválido |

### Usuários (@users)

| Endpoint | Cenários |
|----------|----------|
| GET /api/users | Listagem paginada, busca, filtros |
| GET /api/users/:id | Busca por ID, usuário não encontrado |
| PUT /api/users/:id | Atualização, validação, permissões |
| DELETE /api/users/:id | Soft delete, permissões |

---

## Tags de Teste

| Tag | Descrição | Comando |
|-----|-----------|---------|
| @smoke | Testes rápidos de validação | `npm run test:smoke` |
| @regression | Suíte completa de regressão | `npm run test:regression` |
| @auth | Testes de autenticação | `npm run test:auth` |
| @users | Testes de usuários | `npm run test:users` |
| @health | Testes de health check | `npm run test:health` |

---

## Comandos

### Execução de Testes

```bash
# Todos os testes
npm test

# Por tag
npm run test:smoke
npm run test:auth
npm run test:users
npm run test:health

# Por ambiente
npx playwright test --project=development
npx playwright test --project=staging
npx playwright test --project=production

# Debug
npm run test:debug
npm run test:ui
npm run test:headed
```

### Relatórios

```bash
# HTML report
npm run report

# Allure report
npm run report:allure
```

### Desenvolvimento

```bash
# Instalar dependências
npm install

# Lint
npm run lint
npm run lint:fix

# Type check
npm run typecheck
```

---

## Variáveis de Ambiente

| Variável | Descrição | Default |
|----------|-----------|---------|
| `API_BASE_URL` | URL base da API | https://api-project-gules.vercel.app |
| `STAGING_URL` | URL de staging | https://api-project-gules.vercel.app |
| `CI` | Ambiente CI | false |

---

## CI/CD

### GitHub Actions

O workflow `.github/workflows/tests.yml` executa:

- **Push para main**: Roda testes completos
- **Pull Requests**: Roda smoke tests
- **Manual**: Permite selecionar ambiente
- **Scheduled**: Roda diariamente às 6h UTC
- **Repository Dispatch**: Disparado pela API após deploy

### Integração com API Project

A pipeline da API (`api-project`) dispara os testes após deploy bem-sucedido:

```yaml
- name: Trigger Playwright API Tests
  uses: peter-evans/repository-dispatch@v3
  with:
    repository: filipeCardorso/api-tests-playwright
    event-type: run-api-tests
```

---

## Troubleshooting

### Erro: "Cannot find module '@playwright/test'"

```bash
npm install
```

### Erro: "Email not verified"

Os testes que fazem login podem falhar se a verificação de email estiver ativa. Os testes estão preparados para isso com `test.skip()`.

### Erro: "Rate limit exceeded"

A API tem rate limiting. Aguarde ou use um ambiente de desenvolvimento sem limites.

### Testes falhando no CI

1. Verifique se a API está online
2. Verifique os logs no GitHub Actions
3. Baixe os artefatos de relatório para análise

---

## Links Úteis

- **Playwright Docs**: https://playwright.dev/docs/api-testing
- **API Swagger**: https://api-project-gules.vercel.app/docs
- **API Repo**: https://github.com/filipeCardorso/api-project
