# DM3D Tech Store

Projeto baseado em Magento 2 com uma camada frontend headless em React + Vite para a vitrine.

## Visao Geral

Este repositorio contem:

- Magento 2.4.8-p4 como backend de e-commerce
- OpenSearch para indexacao de catalogo
- Frontend headless em `frontend/` consumindo GraphQL do Magento
- Configuracao de Nginx para publicar o frontend em `headless.dev.dm3dtech.com`

## Estrutura

- `app/`, `bin/`, `lib/`, `pub/`, `setup/`, `vendor/`: estrutura principal do Magento
- `app/etc/env.php`: configuracao local da aplicacao Magento
- `frontend/`: storefront headless em React + Vite
- `devops/nginx/headless.dev.dm3dtech.com.conf`: virtual host do frontend headless
- `docker-compose.opensearch.yml`: container OpenSearch para desenvolvimento

## Stack

- PHP / Magento 2.4.8-p4
- MySQL
- OpenSearch
- React 18
- Vite
- React Router

## Ambiente Atual

- Magento mode: `default`
- Banco configurado: `magento`
- Host do banco: `localhost`
- OpenSearch: `127.0.0.1:9200`

## Magento

O Magento atende a loja principal e expoe GraphQL em:

```text
http://dev.dm3dtech.com/graphql
```

O frontend headless usa esse endpoint para carregar:

- `storeConfig`
- CMS da home
- categorias
- produtos

## Frontend Headless

O app React fica em `frontend/` e foi estruturado em camadas:

- `src/domain`: modelos de dominio
- `src/application`: casos de uso
- `src/infrastructure`: acesso ao Magento
- `src/presentation`: controllers da interface
- `src/components` e `src/features`: views e composicao das telas

### Variaveis de ambiente

Arquivo base:

```text
frontend/.env
```

Variaveis suportadas:

- `VITE_MAGENTO_GRAPHQL_URL`
- `VITE_MAGENTO_MEDIA_BASE_URL`
- `VITE_STORE_CODE`

### Rodando o frontend

Instale as dependencias:

```bash
cd /var/www/html/dm3dtech/frontend
/home/diego/snap/code/235/.local/share/pnpm/pnpm install
```

Suba em modo desenvolvimento:

```bash
/home/diego/snap/code/235/.local/share/pnpm/pnpm dev --host
```

Gere o build:

```bash
/home/diego/snap/code/235/.local/share/pnpm/pnpm build
```

## OpenSearch

Para subir o OpenSearch com Docker Compose:

```bash
docker compose -f docker-compose.opensearch.yml up -d
```

Portas expostas:

- `9200`
- `9600`

## Publicacao do Frontend

O build do Vite e gerado em:

```text
frontend/dist
```

O server block previsto para o frontend esta em:

```text
devops/nginx/headless.dev.dm3dtech.com.conf
```

Fluxo esperado:

1. Gerar o build do frontend
2. Publicar o arquivo de Nginx em `/etc/nginx/conf.d/`
3. Validar com `nginx -t`
4. Recarregar o Nginx

## Git

Remote configurado:

```text
https://github.com/diegomiyabara/magento-store.git
```

## Observacoes

- Este repositorio usa `.gitignore` para evitar versionar dependencias, builds e artefatos locais.
- O frontend foi pensado para carregar a interface base imediatamente e usar loader apenas nas secoes dependentes do Magento.
- Se o catalogo ainda nao estiver populado, a home e as categorias exibem estados vazios amigaveis.
