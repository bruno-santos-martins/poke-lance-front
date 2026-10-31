# PokéLance — Frontend

Interface web do PokéLance para acompanhar leilões Pokémon, criar lotes, realizar lances e consultar relatórios. A aplicação usa React, TypeScript, Vite e Socket.IO Client.

![Tela do PokéLance](image.png)

## Funcionalidades da interface

- Vitrine de lotes abertos com busca, detalhes e contagem regressiva.
- Atualizações em tempo real de lances e lotes.
- Formulário de criação de lote com busca de Pokémon e pré-visualização da carta.
- Área do licitante para consultar carteira, histórico de lances, cartas adquiridas e transações.
- Área do leiloeiro com relatórios, auditoria pesquisável por Pokémon e período, e histórico de lotes vendidos.
- Consulta do contato do ganhador e ação para enviar e-mail ao licitante.
- Comprovativos públicos dos lotes liquidados.
- Temas claro, escuro e automático, além de catálogo Storybook dos componentes compartilhados.

## Requisitos

- Node.js 22 ou superior e npm.
- Backend do PokéLance em execução e acessível pela URL configurada em `VITE_API_URL`.

## Desenvolvimento local

Execute os comandos na pasta `frontend`:

```powershell
npm ci
Copy-Item .env.example .env
```

No arquivo `.env`, configure a URL base da API, sem adicionar o sufixo `/api`:

```env
VITE_API_URL=http://localhost:4000
```

Inicie o servidor local:

```powershell
npm run dev
```

O Vite disponibiliza a aplicação em `http://localhost:5173`.
Em desenvolvimento, o cliente ajusta `localhost`/`127.0.0.1` na URL da API para usar o mesmo host da página, evitando que o navegador omita o cookie de sessão. Em outros ambientes, configure `CLIENT_ORIGIN` no backend com a origem exata do frontend e `VITE_API_URL` com a URL da API.

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento Vite. |
| `npm run build` | Verifica os tipos TypeScript e cria `dist/`. |
| `npm run preview` | Serve localmente o build de produção. |
| `npm run storybook` | Inicia o Storybook. |
| `npm run build-storybook` | Gera o Storybook estático. |
| `npm run preview:e2e` | Serve o build de produção na porta `4173`, usada pelo Cypress. |
| `npm run cypress:open` | Abre o Cypress com interface gráfica. |
| `npm run cypress:run` | Executa os testes E2E em modo headless. |
| `npm run test:e2e:ci` | Sobe o servidor, executa o Cypress headless e encerra o servidor. |
| `npm run typecheck:e2e` | Verifica os tipos TypeScript dos testes Cypress. |
| `npm run verify` | Build, typecheck dos testes, E2E e build do Storybook — o mesmo que roda no CI. |

## 🧪 Testes de frontend

### Estratégia

O frontend é validado em duas camadas complementares:

| Camada | Ferramenta | Responsabilidade |
|---|---|---|
| 🧩 Componentes | **Storybook** (CSF 3.0) | Isola cada componente de `src/shared/components/`, documenta as props e demonstra os estados visuais. |
| 🌐 Fluxos do usuário | **Cypress** (E2E) | Executa a aplicação real no navegador e valida os fluxos críticos de ponta a ponta. |

**Storybook** — cada componente compartilhado tem um arquivo `[Componente].stories.tsx` ao lado do código, com:

- `argTypes` tipados para experimentar todas as props públicas no painel *Controls*;
- histórias para os estados `Default`, `Hover`, `Focus`, `Active`, `Disabled`, `Loading`, `Error` e `Success`, conforme o que cada componente suporta;
- *play functions* (`storybook/test`) que reproduzem a interação e verificam o resultado esperado ao abrir a história;
- alternância global de tema na barra do Storybook (**Tema → Light / Dark**), que aplica os Design Tokens de `src/shared/styles/tokens.css`, além de histórias `DarkMode` explícitas.

> ℹ️ As *play functions* executam ao abrir a história no navegador. No CI, o Storybook é validado pela compilação (`build-storybook`).

**Cypress** — os testes rodam contra o **build de produção** (`vite preview`), e o backend é simulado com `cy.intercept`. Assim, a suíte é determinística e não depende de banco de dados nem de API externa. Os seletores usam exclusivamente atributos `data-cy`, sem depender de classes CSS.

### Como executar

Todos os comandos são executados na pasta `frontend`.

**Storybook**

```bash
npm run storybook          # catálogo interativo em http://localhost:6006
npm run build-storybook    # gera o Storybook estático e valida a compilação
```

**Cypress — modo headless (recomendado)**

```bash
npm run build              # os testes usam o build de produção
npm run test:e2e:ci        # sobe o servidor, executa os testes e encerra o servidor
```

**Cypress — modo interativo**, em dois terminais:

```bash
# terminal 1
npm run build
npm run preview:e2e

# terminal 2
npm run cypress:open       # escolha "E2E Testing" e o spec desejado
```

Com o servidor do terminal 1 ativo, `npm run cypress:run` executa a suíte headless sem subir outro servidor.

**Tudo de uma vez**, como no CI:

```bash
npm run verify
```

> ⚠️ **Problemas comuns**
> - `bad option: --smoke-test` ao executar pelo terminal do VS Code: a variável `ELECTRON_RUN_AS_NODE` foi herdada do editor. Remova-a antes de rodar (`Remove-Item Env:ELECTRON_RUN_AS_NODE` no PowerShell ou `unset ELECTRON_RUN_AS_NODE` no Bash).
> - `Port 4173 is already in use` ou erro de `taskkill` no final: há outro `preview:e2e` aberto. Feche-o antes de executar `test:e2e:ci`.

### Cenários cobertos

| Spec | Cenários |
|---|---|
| `auth.cy.ts` | Visitante não vê o formulário de lance e é direcionado ao login; validação de e-mail, senha e nome sem chamada à API; login com sucesso; erro de credenciais inválidas; logout. |
| `bid.cy.ts` | Lance abaixo do mínimo é bloqueado **sem requisição de rede**; rejeição de valores vazios, não numéricos e negativos; aceitação do valor mínimo exato; envio do lance em centavos e atualização do lance, do campo e da carteira na tela; exibição do erro devolvido pelo servidor. |
| `realtime.cy.ts` | Eventos Socket.IO `bid:placed`, `lots:updated` e `wallet:updated` atualizam a interface; contagem regressiva avança com relógio controlado até “Encerrado”. |
| `theme.cy.ts` | Alternância entre tema claro e escuro; persistência da preferência; troca efetiva dos Design Tokens; contraste mínimo **WCAG AA (4,5:1)** medido nos dois temas. |
| `layout.cy.ts` | Smoke test de abertura: vitrine, *Como funciona*, comprovativo, modal de login e modal do lote. |

### 🚦 Quality gate: deploy bloqueado por testes

O deploy no Render só acontece depois que todos os testes passam. A verificação roda no **GitHub Actions** (`.github/workflows/ci-cd.yml`), não no build do Render:

```text
push na main
   └─► GitHub Actions: npm ci → npm run verify
          ├─ build (tsc + vite)
          ├─ typecheck dos testes Cypress
          ├─ Cypress headless contra o build
          └─ build do Storybook
                 │
       falhou? ──┴──► job termina com exit code ≠ 0 → deploy NÃO acontece ❌
       passou? ─────► job "deploy" chama o Deploy Hook do Render → Render publica ✅
```

- Pull requests executam a mesma verificação, mas nunca disparam deploy.
- Em caso de falha, as capturas de tela do Cypress ficam disponíveis como artefato (`cypress-screenshots`) na execução do workflow.
- O Cypress repete uma vez um teste que falhou no CI (`retries.runMode: 1`), para absorver instabilidades do runner. Um teste que falha duas vezes bloqueia o deploy.

**Por que os testes não rodam dentro do build do Render?** O Cypress precisa de um navegador e de bibliotecas de sistema que não estão disponíveis no ambiente de build de Static Sites do Render, e o binário tem centenas de MB. Executar a verificação no GitHub Actions mantém o build do Render rápido e garante o mesmo bloqueio.

## Deploy como Static Site no Render

Crie um **Static Site** conectado ao repositório do frontend e configure:

- **Root Directory:** em branco, se o frontend estiver na raiz do repositório.
- **Build Command:** `npm ci && npm run build`
- **Publish Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_URL` com a URL pública base do backend, sem `/api`;
  - `CYPRESS_INSTALL_BINARY=0`, para o `npm ci` não baixar o binário do Cypress, que só é usado no CI.
- **Auto-Deploy:** `Off`. O deploy é disparado pelo GitHub Actions depois que os testes passam.

Copie a URL em **Settings → Deploy Hook** e cadastre-a no repositório do GitHub em **Settings → Secrets and variables → Actions** com o nome `RENDER_DEPLOY_HOOK_URL`.

Adicione a regra de rewrite `/*` → `/index.html` com ação **Rewrite**, para permitir o acesso direto às páginas internas, como comprovativos. No serviço do backend, configure a origem pública do frontend como origem permitida.

## Estrutura

```text
cypress/
  e2e/                      Specs E2E (*.cy.ts)
  support/                  Comandos customizados (cy.login, cy.setTheme...) e dados de teste
src/
  pages/
    AuctionPage/            Tela de leilões e painéis por perfil
      components/           Componentes específicos da tela
    HowItWorksPage/         Página explicativa
    ReceiptPage/            Comprovativos de lotes liquidados
  shared/
    api/                    Cliente de comunicação com o backend
    components/             Componentes reutilizáveis
    context/                Estado e provedores compartilhados
    layout/                 Elementos de layout
    styles/                 Tokens e estilos globais
    utils/                  Funções utilitárias
```
