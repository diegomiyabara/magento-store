# DM3D Tech Store

Magento 2 project with a headless React + Vite frontend layer for the storefront.

## Overview

This repository contains:

- Magento 2.4.8-p4 as the e-commerce backend
- OpenSearch for catalog indexing
- Headless frontend in `frontend/` consuming Magento's GraphQL API
- Nginx configuration to serve the frontend at `headless.dev.dm3dtech.com`

## Structure

- `app/`, `bin/`, `lib/`, `pub/`, `setup/`, `vendor/`: Magento core structure
- `app/etc/env.php`: local Magento application configuration
- `frontend/`: headless storefront built with React + Vite
- `docker-compose.opensearch.yml`: OpenSearch container for local development

## Stack

- PHP / Magento 2.4.8-p4
- MySQL
- OpenSearch
- React 18
- Vite
- React Router

## Current Environment

- Magento mode: `default`
- Database name: `magento`
- Database host: `localhost`
- OpenSearch: `127.0.0.1:9200`

## Magento

Magento serves the main store and exposes GraphQL at:

```text
http://dev.dm3dtech.com/graphql
```

The headless frontend uses this endpoint to load:

- `storeConfig`
- Home CMS page
- Categories
- Products

## Headless Frontend

The React app lives in `frontend/` and is structured in layers:

- `src/domain`: domain models
- `src/application`: use cases
- `src/infrastructure`: Magento access layer
- `src/presentation`: interface controllers
- `src/components` and `src/features`: views and screen composition

### Environment variables

Base file:

```text
frontend/.env
```

Supported variables:

- `VITE_MAGENTO_GRAPHQL_URL`
- `VITE_MAGENTO_MEDIA_BASE_URL`
- `VITE_STORE_CODE`

### Running the frontend

Install dependencies:

```bash
cd frontend
pnpm install
```

Start development server:

```bash
pnpm dev --host
```

Generate production build:

```bash
pnpm build
```

## OpenSearch

Start OpenSearch with Docker Compose:

```bash
docker compose -f docker-compose.opensearch.yml up -d
```

Exposed ports:

- `9200`
- `9600`

## Frontend Deployment

The Vite build output is generated at:

```text
frontend/dist
```

Expected deployment flow:

1. Generate the frontend build
2. Place the Nginx config in `/etc/nginx/conf.d/`
3. Validate with `nginx -t`
4. Reload Nginx

## Git

Configured remote:

```text
https://github.com/diegomiyabara/magento-store.git
```

## Notes

- This repository uses `.gitignore` to avoid versioning dependencies, builds, and local artifacts.
- The frontend is designed to render the base UI immediately, using loaders only for sections that depend on Magento data.
- If the catalog is not yet populated, the home page and category pages display friendly empty states.
