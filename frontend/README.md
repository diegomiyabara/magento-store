# DM3D Tech Headless Frontend

Frontend inicial em React + Vite para a vitrine headless da DM3D Tech, consumindo o Magento 2 via GraphQL.

## Requisitos

- `node`
- `yarn`

## Setup

1. Copie `frontend/.env.example` para `frontend/.env`.
2. Ajuste as variáveis se necessário.
3. Instale as dependências:

```bash
cd frontend
yarn install
```

4. Rode em desenvolvimento:

```bash
yarn dev --host
```

5. Gere o build:

```bash
yarn build
```

## Variáveis de ambiente

- `VITE_MAGENTO_GRAPHQL_URL`: endpoint GraphQL. Em produção pode ficar como `/graphql` usando proxy no Nginx.
- `VITE_MAGENTO_MEDIA_BASE_URL`: override opcional para mídia.
- `VITE_STORE_CODE`: store view usada nos headers GraphQL.
