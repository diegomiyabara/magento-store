export function createStoreConfigModel(storeConfig) {
  if (!storeConfig) {
    return null;
  }

  return {
    storeCode: storeConfig.store_code,
    storeName: storeConfig.store_name,
    baseUrl: storeConfig.base_url,
    baseMediaUrl: storeConfig.base_media_url,
    secureBaseUrl: storeConfig.secure_base_url,
    secureBaseMediaUrl: storeConfig.secure_base_media_url,
    raw: storeConfig,
  };
}

export function createCategoryModel(category) {
  if (!category) {
    return null;
  }

  return {
    id: category.id,
    uid: category.uid,
    name: category.name,
    urlKey: category.url_key,
    description: category.description || '',
    productCount: category.product_count || 0,
    metaTitle: category.meta_title || '',
    metaDescription: category.meta_description || '',
    raw: category,
  };
}

export function createProductModel(product) {
  if (!product) {
    return null;
  }

  const minimumPrice = product.price_range?.minimum_price;

  return {
    uid: product.uid,
    sku: product.sku,
    name: product.name,
    urlKey: product.url_key,
    urlSuffix: product.url_suffix || '',
    stockStatus: product.stock_status || 'OUT_OF_STOCK',
    imageUrl: product.image?.url || product.small_image?.url || '',
    imageLabel: product.image?.label || product.small_image?.label || product.name,
    descriptionHtml: product.description?.html || product.short_description?.html || '',
    shortDescriptionHtml: product.short_description?.html || '',
    regularPrice: minimumPrice?.regular_price?.value ?? null,
    finalPrice: minimumPrice?.final_price?.value ?? null,
    currency: minimumPrice?.final_price?.currency || minimumPrice?.regular_price?.currency || 'BRL',
    raw: product,
  };
}

export function createCmsPageModel(page) {
  if (!page) {
    return null;
  }

  return {
    identifier: page.identifier,
    title: page.title,
    content: page.content || '',
    metaTitle: page.meta_title || '',
    metaDescription: page.meta_description || '',
    raw: page,
  };
}

export function createCustomerModel(customer) {
  if (!customer) {
    return null;
  }

  return {
    email: customer.email,
    firstName: customer.firstname,
    fullName: [customer.firstname, customer.lastname].filter(Boolean).join(' '),
    lastName: customer.lastname,
    raw: customer,
  };
}
