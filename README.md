# PokéLance

Aplicação de leilões Pokémon com API Node/TypeScript/Prisma, PostgreSQL, armazenamento local de imagens e interface React/Vite com eventos Socket.IO.

## Requisitos

- Node.js 22+
- Docker com Docker Compose

## Desenvolvimento local

1. Inicie o PostgreSQL:

   ```powershell
   cd backend
   docker compose up -d postgres
   ```

2. Crie `backend\.env` com base em `.env.example`. Use um `JWT_SECRET` aleatório com pelo menos 32 caracteres.
3. Instale dependências, aplique a migration e carregue os dados de demonstração:

   ```powershell
   npm install
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

4. Inicie a API em `http://localhost:4000`:

   ```powershell
   npm run dev
   ```

5. Noutro terminal:

   ```powershell
   cd frontend
   npm install
   ```

   Crie `frontend\.env` a partir de `.env.example` e execute `npm run dev`. A interface fica disponível em `http://localhost:5173`.

   Para abrir o catálogo Storybook dos componentes compartilhados:

   ```powershell
   npm run storybook
   ```

   O build estático do catálogo pode ser validado com `npm run build-storybook`. A aplicação suporta temas claro, escuro e automático (preferência do sistema), controlados pelo botão de tema no cabeçalho.

O utilizador de demonstração `vendedor@leilao.local` e `ana@leilao.local` / `bruno@leilao.local` usam a senha `Senha123!`. Altere ou remova estes dados antes de qualquer ambiente partilhado.

Para executar API e PostgreSQL em contentores, configure `JWT_SECRET` em `backend\.env` e use `docker compose up --build`; a migration é aplicada antes da API e as imagens ficam num volume persistente.

## Valores e persistência

Valores monetários são inteiros em centavos BRL. As imagens Pokémon são obtidas somente durante a criação do lote e persistidas em `backend/uploads/cards`; as páginas e comprovativos leem o caminho local servido por `/uploads`. Não há consulta posterior à PokéAPI para renderização.

O serviço de liquidação verifica lotes expirados a cada cinco segundos. O bloqueio do lote e das carteiras e as atualizações financeiras ocorrem numa transação PostgreSQL; lances guardam sequência e hash encadeado para auditoria pública.

O leiloeiro pode cancelar os próprios lotes ainda abertos. O lote deixa de aparecer na vitrine, mas permanece guardado com o histórico; se houver um lance vigente, o valor comprometido é liberado na carteira do licitante. A tabela `Audit` regista criação de contas, sessões, lotes, lances, depósitos, cancelamentos e liquidações, identificando responsável, ação, data e detalhes. Os registos de uma operação financeira são gravados na mesma transação dessa operação.

## API principal

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/pokemon/search?q=cha` — sugestões de Pokémon pesquisadas na PokéAPI (cache local por 10 minutos)
- `GET /api/pokemon/:id` — detalhes do Pokémon selecionado, usados no preview de criação do lote
- `GET /api/lots`, `GET /api/lots/:id`, `POST /api/lots`, `DELETE /api/lots/:id`
- `POST /api/lots/:id/bids`
- `GET /api/wallet`, `POST /api/wallet/deposits`
- `GET /api/bidder/report` — relatório autenticado com histórico de lances e extrato financeiro
- `GET /api/seller/audit` — auditoria autenticada dos próprios lotes e atividades do leiloeiro
- `GET /api/lots/:id/audit`, `GET /api/receipts/:id`
- `GET /api/seller/reports`
- WebSocket: salas `lot:join` / `lot:leave`, eventos `bid:placed`, `lot:updated`, `lots:updated`

`/api/lots`, detalhes, auditoria e comprovativos são públicos. Endpoints de carteira e lances exigem JWT de licitante; criação, cancelamento e relatórios exigem JWT de leiloeiro.

## Verificação

```powershell
cd backend
npm test
npm run build
cd ..\frontend
npm run build
```
