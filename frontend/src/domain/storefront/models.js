export function createStoreConfigModel(storeConfig) {
  if (!storeConfig) {
    return null;
  }

  return {
    storeCode: storeConfig.store_code,
    storeName: storeConfig.store_name,
    rootCategoryId: storeConfig.root_category_id || null,
    rootCategoryUid: storeConfig.root_category_uid || null,
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
  const stockStatus = product.stock_status || null;

  return {
    uid: product.uid,
    sku: product.sku,
    name: product.name,
    urlKey: product.url_key,
    urlSuffix: product.url_suffix || '',
    stockStatus,
    isAvailableForSale: stockStatus ? stockStatus === 'IN_STOCK' : true,
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

export function createCartModel(cart) {
  if (!cart) {
    return null;
  }

  const prices = cart.prices || {};
  const shippingAddress = cart.shipping_addresses?.[0] || null;
  const appliedTaxes = prices.applied_taxes ?? [];
  const totalTaxValue = appliedTaxes.reduce(
    (sum, tax) => sum + (tax?.amount?.value ?? 0),
    0,
  );

  return {
    id: cart.id || '',
    totalQuantity: cart.total_quantity ?? 0,
    isVirtual: Boolean(cart.is_virtual),
    email: cart.email || '',
    items: (cart.items ?? []).map(createCartItemModel),
    subtotal: createMoneyModel(prices.subtotal_excluding_tax),
    grandTotal: createMoneyModel(prices.grand_total),
    totalTax: createMoneyModel(
      appliedTaxes.length
        ? {
            value: totalTaxValue,
            currency: appliedTaxes[0]?.amount?.currency || prices.grand_total?.currency || 'BRL',
          }
        : null,
    ),
    totalShipping: createMoneyModel(shippingAddress?.selected_shipping_method?.amount),
    discounts: (prices.discounts ?? []).map(createCartDiscountModel),
    appliedCoupons: (cart.applied_coupons ?? []).map((coupon) => ({
      code: coupon?.code || '',
    })),
    shippingAddresses: (cart.shipping_addresses ?? []).map(createCartAddressModel),
    billingAddress: createCartAddressModel(cart.billing_address),
    availablePaymentMethods: (cart.available_payment_methods ?? []).map((method) => ({
      code: method.code || '',
      title: method.title || '',
    })),
    selectedPaymentMethod: cart.selected_payment_method
      ? {
          code: cart.selected_payment_method.code || '',
          title: cart.selected_payment_method.title || '',
          purchaseOrderNumber: cart.selected_payment_method.purchase_order_number || '',
        }
      : null,
    raw: cart,
  };
}

function createCartItemModel(item) {
  if (!item) {
    return null;
  }

  const product = item.product || {};
  const configuredVariant = item.configured_variant || {};
  const priceRange = configuredVariant.price_range || product.price_range || {};
  const minimumPrice = priceRange.minimum_price || {};

  return {
    uid: item.uid || '',
    id: item.id || '',
    quantity: item.quantity ?? 0,
    product: {
      uid: product.uid || '',
      sku: product.sku || '',
      name: product.name || '',
      urlKey: product.url_key || '',
      imageUrl: product.image?.url || '',
      imageLabel: product.image?.label || product.name || '',
      regularPrice: minimumPrice.regular_price?.value ?? null,
      finalPrice: minimumPrice.final_price?.value ?? null,
      currency: minimumPrice.final_price?.currency || minimumPrice.regular_price?.currency || 'BRL',
    },
    configuredVariant: configuredVariant.uid
      ? {
          uid: configuredVariant.uid || '',
          sku: configuredVariant.sku || '',
          name: configuredVariant.name || '',
          finalPrice: configuredVariant.price_range?.minimum_price?.final_price?.value ?? null,
          currency: configuredVariant.price_range?.minimum_price?.final_price?.currency || 'BRL',
        }
      : null,
    raw: item,
  };
}

function createMoneyModel(money) {
  if (!money) {
    return null;
  }
  return {
    value: money.value ?? null,
    currency: money.currency || 'BRL',
  };
}

function createCartDiscountModel(discount) {
  if (!discount) {
    return null;
  }
  return {
    label: discount.label || '',
    value: discount.amount?.value ?? 0,
    currency: discount.amount?.currency || 'BRL',
    appliedTo: discount.applied_to || '',
  };
}

function createCartAddressModel(address) {
  if (!address) {
    return null;
  }
  return {
    firstName: address.firstname || '',
    lastName: address.lastname || '',
    company: address.company || '',
    street: address.street || [],
    city: address.city || '',
    region: address.region?.label || address.region?.code || '',
    regionCode: address.region?.code || '',
    regionId: address.region?.region_id ?? null,
    postcode: address.postcode || '',
    countryCode: address.country?.code || '',
    countryLabel: address.country?.label || '',
    telephone: address.telephone || '',
    availableShippingMethods: (address.available_shipping_methods ?? []).map((method) => ({
      carrierCode: method.carrier_code || '',
      methodCode: method.method_code || '',
      carrierTitle: method.carrier_title || '',
      methodTitle: method.method_title || '',
      price: method.amount?.value ?? 0,
      currency: method.amount?.currency || 'BRL',
      errorMessage: method.error_message || '',
      available: Boolean(method.available),
    })),
    selectedShippingMethod: address.selected_shipping_method
      ? {
          carrierCode: address.selected_shipping_method.carrier_code || '',
          methodCode: address.selected_shipping_method.method_code || '',
          carrierTitle: address.selected_shipping_method.carrier_title || '',
          methodTitle: address.selected_shipping_method.method_title || '',
          price: address.selected_shipping_method.amount?.value ?? 0,
          currency: address.selected_shipping_method.amount?.currency || 'BRL',
        }
      : null,
  };
}

export function createCustomerModel(customer) {
  if (!customer) {
    return null;
  }

  return {
    createdAt: customer.created_at || '',
    dateOfBirth: customer.date_of_birth || customer.dob || '',
    email: customer.email,
    firstName: customer.firstname || '',
    fullName: [customer.firstname, customer.lastname].filter(Boolean).join(' '),
    gender: customer.gender ?? null,
    lastName: customer.lastname || '',
    prefix: customer.prefix || '',
    suffix: customer.suffix || '',
    taxvat: customer.taxvat || '',
    raw: customer,
  };
}

export function createCustomerAddressModel(address) {
  if (!address) {
    return null;
  }

  return {
    city: address.city || '',
    company: address.company || '',
    countryCode: address.country_code || '',
    defaultBilling: Boolean(address.default_billing),
    defaultShipping: Boolean(address.default_shipping),
    fax: address.fax || '',
    firstName: address.firstname || '',
    id: address.id,
    lastName: address.lastname || '',
    middleName: address.middlename || '',
    postcode: address.postcode || '',
    prefix: address.prefix || '',
    region: address.region?.region || '',
    regionCode: address.region?.region_code || '',
    regionId: address.region?.region_id ?? address.region_id ?? null,
    street: address.street || [],
    suffix: address.suffix || '',
    telephone: address.telephone || '',
    vatId: address.vat_id || '',
    raw: address,
  };
}

export function createCustomerOrderModel(order) {
  if (!order) {
    return null;
  }

  return {
    appliedCoupons: (order.applied_coupons ?? []).map((coupon) => ({
      code: coupon?.code || '',
    })),
    availableActions: order.available_actions ?? [],
    billingAddress: createOrderAddressModel(order.billing_address),
    carrier: order.carrier || '',
    comments: (order.comments ?? []).map(createSalesCommentModel),
    customerEmail: order.email || '',
    customerInfo: createOrderCustomerInfoModel(order.customer_info),
    date: order.order_date || '',
    grandTotalCurrency: order.total?.grand_total?.currency || 'BRL',
    grandTotalValue: order.total?.grand_total?.value ?? null,
    id: order.id,
    invoices: (order.invoices ?? []).map(createOrderInvoiceModel),
    isVirtual: Boolean(order.is_virtual),
    items: (order.items ?? []).map(createOrderItemModel),
    number: order.number || '',
    paymentMethods: (order.payment_methods ?? []).map(createOrderPaymentMethodModel),
    shippingAddress: createOrderAddressModel(order.shipping_address),
    shippingMethod: order.shipping_method || '',
    shipments: (order.shipments ?? []).map(createOrderShipmentModel),
    status: order.status || '',
    statusChangedAt: order.order_status_change_date || '',
    subtotalCurrency: order.total?.subtotal_excl_tax?.currency || order.total?.subtotal?.currency || 'BRL',
    subtotalValue:
      order.total?.subtotal_excl_tax?.value ??
      order.total?.subtotal?.value ??
      null,
    token: order.token || '',
    totalDiscounts: (order.total?.discounts ?? []).map(createDiscountModel),
    totalShippingCurrency:
      order.total?.shipping_handling?.total_amount?.currency ||
      order.total?.total_shipping?.currency ||
      'BRL',
    totalShippingValue:
      order.total?.shipping_handling?.total_amount?.value ??
      order.total?.total_shipping?.value ??
      null,
    totalTaxCurrency: order.total?.total_tax?.currency || 'BRL',
    totalTaxValue: order.total?.total_tax?.value ?? null,
    raw: order,
  };
}

function createOrderAddressModel(address) {
  if (!address) {
    return null;
  }

  return {
    city: address.city || '',
    company: address.company || '',
    countryCode: address.country_code || '',
    fax: address.fax || '',
    firstName: address.firstname || '',
    lastName: address.lastname || '',
    middleName: address.middlename || '',
    postcode: address.postcode || '',
    region: address.region || '',
    regionId: address.region_id ?? null,
    street: address.street || [],
    telephone: address.telephone || '',
    vatId: address.vat_id || '',
    raw: address,
  };
}

function createOrderCustomerInfoModel(customerInfo) {
  if (!customerInfo) {
    return null;
  }

  return {
    firstName: customerInfo.firstname || '',
    lastName: customerInfo.lastname || '',
    middleName: customerInfo.middlename || '',
    prefix: customerInfo.prefix || '',
    suffix: customerInfo.suffix || '',
    raw: customerInfo,
  };
}

function createOrderItemModel(item) {
  if (!item) {
    return null;
  }

  return {
    discounts: (item.discounts ?? []).map(createDiscountModel),
    enteredOptions: (item.entered_options ?? []).map(createOrderItemOptionModel),
    id: item.id,
    productName: item.product_name || '',
    productSku: item.product_sku || '',
    productType: item.product_type || '',
    quantityCanceled: item.quantity_canceled ?? 0,
    quantityInvoiced: item.quantity_invoiced ?? 0,
    quantityOrdered: item.quantity_ordered ?? 0,
    quantityRefunded: item.quantity_refunded ?? 0,
    quantityReturned: item.quantity_returned ?? 0,
    quantityShipped: item.quantity_shipped ?? 0,
    salePriceCurrency: item.product_sale_price?.currency || 'BRL',
    salePriceValue: item.product_sale_price?.value ?? null,
    selectedOptions: (item.selected_options ?? []).map(createOrderItemOptionModel),
    status: item.status || '',
    rowTotalCurrency: item.prices?.row_total?.currency || 'BRL',
    rowTotalValue: item.prices?.row_total?.value ?? null,
    raw: item,
  };
}

function createOrderItemOptionModel(option) {
  if (!option) {
    return null;
  }

  return {
    label: option.label || '',
    value: option.value || '',
    raw: option,
  };
}

function createDiscountModel(discount) {
  if (!discount) {
    return null;
  }

  return {
    amountCurrency: discount.amount?.currency || 'BRL',
    amountValue: discount.amount?.value ?? null,
    label: discount.label || '',
    raw: discount,
  };
}

function createOrderPaymentMethodModel(paymentMethod) {
  if (!paymentMethod) {
    return null;
  }

  return {
    additionalData: (paymentMethod.additional_data ?? []).map((item) => ({
      name: item?.name || '',
      value: item?.value || '',
      raw: item,
    })),
    name: paymentMethod.name || '',
    type: paymentMethod.type || '',
    raw: paymentMethod,
  };
}

function createOrderShipmentModel(shipment) {
  if (!shipment) {
    return null;
  }

  return {
    comments: (shipment.comments ?? []).map(createSalesCommentModel),
    id: shipment.id,
    items: (shipment.items ?? []).map((item) => ({
      id: item?.id,
      productName: item?.product_name || '',
      productSku: item?.product_sku || '',
      quantityShipped: item?.quantity_shipped ?? 0,
      raw: item,
    })),
    number: shipment.number || '',
    tracking: (shipment.tracking ?? []).map((track) => ({
      carrier: track?.carrier || '',
      number: track?.number || '',
      title: track?.title || '',
      raw: track,
    })),
    raw: shipment,
  };
}

function createOrderInvoiceModel(invoice) {
  if (!invoice) {
    return null;
  }

  return {
    comments: (invoice.comments ?? []).map(createSalesCommentModel),
    grandTotalCurrency: invoice.total?.grand_total?.currency || 'BRL',
    grandTotalValue: invoice.total?.grand_total?.value ?? null,
    id: invoice.id,
    items: (invoice.items ?? []).map((item) => ({
      id: item?.id,
      productName: item?.product_name || '',
      productSku: item?.product_sku || '',
      quantityInvoiced: item?.quantity_invoiced ?? 0,
      raw: item,
    })),
    number: invoice.number || '',
    raw: invoice,
  };
}

function createSalesCommentModel(comment) {
  if (!comment) {
    return null;
  }

  return {
    message: comment.message || '',
    timestamp: comment.timestamp || '',
    raw: comment,
  };
}

export function createCustomerDashboardModel(customer) {
  if (!customer) {
    return null;
  }

  return {
    customer: createCustomerModel(customer),
    defaultBillingAddress:
      customer.addresses
        ?.map(createCustomerAddressModel)
        .find((address) => address?.defaultBilling) ?? null,
    defaultShippingAddress:
      customer.addresses
        ?.map(createCustomerAddressModel)
        .find((address) => address?.defaultShipping) ?? null,
    isSubscribed: Boolean(customer.is_subscribed),
    orders: (customer.orders?.items ?? []).map(createCustomerOrderModel),
    ordersTotalCount: customer.orders?.total_count ?? 0,
    addresses: (customer.addresses ?? []).map(createCustomerAddressModel),
  };
}
