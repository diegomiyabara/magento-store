/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAGENTO_GRAPHQL_URL: string;
  readonly VITE_MAGENTO_MEDIA_BASE_URL: string;
  readonly VITE_STORE_CODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
