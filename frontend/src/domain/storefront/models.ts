// Raw GraphQL response shapes — intentionally permissive to accept dynamic API data
type RawObject = Record<string, unknown>;

export interface StoreConfigModel {
  storeCode: string;
  storeName: string;
  rootCategoryId: number | null;
  rootCategoryUid: string | null;
  baseUrl: string;
  baseMediaUrl: string;
  secureBaseUrl: string;
  secureBaseMediaUrl: string;
  raw: RawObject;
}

export interface CategoryModel {
  id: number;
  uid: string;
  name: string;
  urlKey: string;
  description: string;
  productCount: number;
  metaTitle: string;
  metaDescription: string;
  raw: RawObject;
}

export interface ProductModel {
  uid: string;
  sku: string;
  name: string;
  urlKey: string;
  urlSuffix: string;
  stockStatus: string | null;
  isAvailableForSale: boolean;
  imageUrl: string;
  imageLabel: string;
  descriptionHtml: string;
  shortDescriptionHtml: string;
  regularPrice: number | null;
  finalPrice: number | null;
  currency: string;
  raw: RawObject;
}

export interface CmsPageModel {
  identifier: string;
  title: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  raw: RawObject;
}

export interface MoneyModel {
  value: number | null;
  currency: string;
}

export interface CartItemProductModel {
  uid: string;
  sku: string;
  name: string;
  urlKey: string;
  imageUrl: string;
  imageLabel: string;
  regularPrice: number | null;
  finalPrice: number | null;
  currency: string;
}

export interface CartItemConfiguredVariantModel {
  uid: string;
  sku: string;
  name: string;
  finalPrice: number | null;
  currency: string;
}

export interface CartItemModel {
  uid: string;
  id: string;
  quantity: number;
  product: CartItemProductModel;
  configuredVariant: CartItemConfiguredVariantModel | null;
  raw: RawObject;
}

export interface CartDiscountModel {
  label: string;
  value: number;
  currency: string;
  appliedTo: string;
}

export interface ShippingMethodModel {
  carrierCode: string;
  methodCode: string;
  carrierTitle: string;
  methodTitle: string;
  price: number;
  currency: string;
  errorMessage: string;
  available: boolean;
}

export interface SelectedShippingMethodModel {
  carrierCode: string;
  methodCode: string;
  carrierTitle: string;
  methodTitle: string;
  price: number;
  currency: string;
}

export interface CartAddressModel {
  firstName: string;
  lastName: string;
  company: string;
  street: string[];
  city: string;
  region: string;
  regionCode: string;
  regionId: number | null;
  postcode: string;
  countryCode: string;
  countryLabel: string;
  telephone: string;
  availableShippingMethods: ShippingMethodModel[];
  selectedShippingMethod: SelectedShippingMethodModel | null;
}

export interface PaymentMethodModel {
  code: string;
  title: string;
}

export interface SelectedPaymentMethodModel {
  code: string;
  title: string;
  purchaseOrderNumber: string;
}

export interface CartModel {
  id: string;
  totalQuantity: number;
  isVirtual: boolean;
  email: string;
  items: Array<CartItemModel | null>;
  subtotal: MoneyModel | null;
  grandTotal: MoneyModel | null;
  totalTax: MoneyModel | null;
  totalShipping: MoneyModel | null;
  discounts: CartDiscountModel[];
  appliedCoupons: Array<{ code: string }>;
  shippingAddresses: Array<CartAddressModel | null>;
  billingAddress: CartAddressModel | null;
  availablePaymentMethods: PaymentMethodModel[];
  selectedPaymentMethod: SelectedPaymentMethodModel | null;
  raw: RawObject;
}

export interface CustomerModel {
  createdAt: string;
  dateOfBirth: string;
  email: string;
  firstName: string;
  fullName: string;
  gender: number | null;
  lastName: string;
  prefix: string;
  suffix: string;
  taxvat: string;
  raw: RawObject;
}

export interface CustomerAddressModel {
  city: string;
  company: string;
  countryCode: string;
  defaultBilling: boolean;
  defaultShipping: boolean;
  fax: string;
  firstName: string;
  id: number | string;
  lastName: string;
  middleName: string;
  postcode: string;
  prefix: string;
  region: string;
  regionCode: string;
  regionId: number | null;
  street: string[];
  suffix: string;
  telephone: string;
  vatId: string;
  raw: RawObject;
}

export interface OrderAddressModel {
  city: string;
  company: string;
  countryCode: string;
  fax: string;
  firstName: string;
  lastName: string;
  middleName: string;
  postcode: string;
  region: string;
  regionId: number | null;
  street: string[];
  telephone: string;
  vatId: string;
  raw: RawObject;
}

export interface OrderCustomerInfoModel {
  firstName: string;
  lastName: string;
  middleName: string;
  prefix: string;
  suffix: string;
  raw: RawObject;
}

export interface OrderItemOptionModel {
  label: string;
  value: string;
  raw: RawObject;
}

export interface DiscountModel {
  amountCurrency: string;
  amountValue: number | null;
  label: string;
  raw: RawObject;
}

export interface OrderItemModel {
  discounts: Array<DiscountModel | null>;
  enteredOptions: Array<OrderItemOptionModel | null>;
  id: string | number;
  productName: string;
  productSku: string;
  productType: string;
  quantityCanceled: number;
  quantityInvoiced: number;
  quantityOrdered: number;
  quantityRefunded: number;
  quantityReturned: number;
  quantityShipped: number;
  salePriceCurrency: string;
  salePriceValue: number | null;
  selectedOptions: Array<OrderItemOptionModel | null>;
  status: string;
  rowTotalCurrency: string;
  rowTotalValue: number | null;
  raw: RawObject;
}

export interface OrderPaymentAdditionalDataModel {
  name: string;
  value: string;
  raw: RawObject;
}

export interface OrderPaymentMethodModel {
  additionalData: OrderPaymentAdditionalDataModel[];
  name: string;
  type: string;
  raw: RawObject;
}

export interface OrderShipmentItemModel {
  id: string | number | undefined;
  productName: string;
  productSku: string;
  quantityShipped: number;
  raw: RawObject;
}

export interface OrderTrackingModel {
  carrier: string;
  number: string;
  title: string;
  raw: RawObject;
}

export interface SalesCommentModel {
  message: string;
  timestamp: string;
  raw: RawObject;
}

export interface OrderShipmentModel {
  comments: Array<SalesCommentModel | null>;
  id: string | number;
  items: OrderShipmentItemModel[];
  number: string;
  tracking: OrderTrackingModel[];
  raw: RawObject;
}

export interface OrderInvoiceItemModel {
  id: string | number | undefined;
  productName: string;
  productSku: string;
  quantityInvoiced: number;
  raw: RawObject;
}

export interface OrderInvoiceModel {
  comments: Array<SalesCommentModel | null>;
  grandTotalCurrency: string;
  grandTotalValue: number | null;
  id: string | number;
  items: OrderInvoiceItemModel[];
  number: string;
  raw: RawObject;
}

export interface CustomerOrderModel {
  appliedCoupons: Array<{ code: string }>;
  availableActions: string[];
  billingAddress: OrderAddressModel | null;
  carrier: string;
  comments: Array<SalesCommentModel | null>;
  customerEmail: string;
  customerInfo: OrderCustomerInfoModel | null;
  date: string;
  grandTotalCurrency: string;
  grandTotalValue: number | null;
  id: string | number;
  invoices: Array<OrderInvoiceModel | null>;
  isVirtual: boolean;
  items: Array<OrderItemModel | null>;
  number: string;
  paymentMethods: Array<OrderPaymentMethodModel | null>;
  shippingAddress: OrderAddressModel | null;
  shippingMethod: string;
  shipments: Array<OrderShipmentModel | null>;
  status: string;
  statusChangedAt: string;
  subtotalCurrency: string;
  subtotalValue: number | null;
  token: string;
  totalDiscounts: Array<DiscountModel | null>;
  totalShippingCurrency: string;
  totalShippingValue: number | null;
  totalTaxCurrency: string;
  totalTaxValue: number | null;
  raw: RawObject;
}

export interface CustomerDashboardModel {
  customer: CustomerModel | null;
  defaultBillingAddress: CustomerAddressModel | null;
  defaultShippingAddress: CustomerAddressModel | null;
  isSubscribed: boolean;
  orders: Array<CustomerOrderModel | null>;
  ordersTotalCount: number;
  addresses: Array<CustomerAddressModel | null>;
}

// Helper to cast raw input to RawObject
function asRaw(value: unknown): RawObject {
  return value as RawObject;
}

function getString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function getNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' ? value : fallback;
}

function getNumberOrNull(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

function getBoolean(value: unknown): boolean {
  return Boolean(value);
}

function getArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function getObject(value: unknown): RawObject {
  return value !== null && typeof value === 'object' ? (value as RawObject) : {};
}

export function createStoreConfigModel(storeConfig: RawObject | null | undefined): StoreConfigModel | null {
  if (!storeConfig) {
    return null;
  }

  return {
    storeCode: getString(storeConfig['store_code']),
    storeName: getString(storeConfig['store_name']),
    rootCategoryId: storeConfig['root_category_id'] != null ? getNumber(storeConfig['root_category_id']) : null,
    rootCategoryUid: storeConfig['root_category_uid'] != null ? getString(storeConfig['root_category_uid']) : null,
    baseUrl: getString(storeConfig['base_url']),
    baseMediaUrl: getString(storeConfig['base_media_url']),
    secureBaseUrl: getString(storeConfig['secure_base_url']),
    secureBaseMediaUrl: getString(storeConfig['secure_base_media_url']),
    raw: asRaw(storeConfig),
  };
}

export function createCategoryModel(category: RawObject | null | undefined): CategoryModel | null {
  if (!category) {
    return null;
  }

  return {
    id: getNumber(category['id']),
    uid: getString(category['uid']),
    name: getString(category['name']),
    urlKey: getString(category['url_key']),
    description: getString(category['description']),
    productCount: getNumber(category['product_count']),
    metaTitle: getString(category['meta_title']),
    metaDescription: getString(category['meta_description']),
    raw: asRaw(category),
  };
}

export function createProductModel(product: RawObject | null | undefined): ProductModel | null {
  if (!product) {
    return null;
  }

  const priceRange = getObject(product['price_range']);
  const minimumPrice = getObject(priceRange['minimum_price']);
  const stockStatus = product['stock_status'] != null ? getString(product['stock_status']) : null;
  const image = getObject(product['image']);
  const smallImage = getObject(product['small_image']);
  const description = getObject(product['description']);
  const shortDescription = getObject(product['short_description']);
  const regularPrice = getObject(minimumPrice['regular_price']);
  const finalPrice = getObject(minimumPrice['final_price']);

  return {
    uid: getString(product['uid']),
    sku: getString(product['sku']),
    name: getString(product['name']),
    urlKey: getString(product['url_key']),
    urlSuffix: getString(product['url_suffix']),
    stockStatus,
    isAvailableForSale: stockStatus ? stockStatus === 'IN_STOCK' : true,
    imageUrl: getString(image['url'] ?? smallImage['url']),
    imageLabel: getString(image['label'] ?? smallImage['label'] ?? product['name']),
    descriptionHtml: getString(description['html'] ?? shortDescription['html']),
    shortDescriptionHtml: getString(shortDescription['html']),
    regularPrice: regularPrice['value'] != null ? getNumber(regularPrice['value']) : null,
    finalPrice: finalPrice['value'] != null ? getNumber(finalPrice['value']) : null,
    currency: getString(finalPrice['currency'] ?? regularPrice['currency'], 'BRL'),
    raw: asRaw(product),
  };
}

export function createCmsPageModel(page: RawObject | null | undefined): CmsPageModel | null {
  if (!page) {
    return null;
  }

  return {
    identifier: getString(page['identifier']),
    title: getString(page['title']),
    content: getString(page['content']),
    metaTitle: getString(page['meta_title']),
    metaDescription: getString(page['meta_description']),
    raw: asRaw(page),
  };
}

function createMoneyModel(money: unknown): MoneyModel | null {
  if (!money) {
    return null;
  }
  const m = getObject(money);
  return {
    value: m['value'] != null ? getNumber(m['value']) : null,
    currency: getString(m['currency'], 'BRL'),
  };
}

function createCartDiscountModel(discount: unknown): CartDiscountModel | null {
  if (!discount) {
    return null;
  }
  const d = getObject(discount);
  const amount = getObject(d['amount']);
  return {
    label: getString(d['label']),
    value: getNumber(amount['value']),
    currency: getString(amount['currency'], 'BRL'),
    appliedTo: getString(d['applied_to']),
  };
}

function createCartAddressModel(address: unknown): CartAddressModel | null {
  if (!address) {
    return null;
  }
  const a = getObject(address);
  const region = getObject(a['region']);
  const country = getObject(a['country']);
  const availableMethods = getArray(a['available_shipping_methods']);
  const selectedMethod = a['selected_shipping_method'];

  return {
    firstName: getString(a['firstname']),
    lastName: getString(a['lastname']),
    company: getString(a['company']),
    street: getArray(a['street']).map((s) => getString(s)),
    city: getString(a['city']),
    region: getString(region['label'] ?? region['code']),
    regionCode: getString(region['code']),
    regionId: region['region_id'] != null ? getNumber(region['region_id']) : null,
    postcode: getString(a['postcode']),
    countryCode: getString(country['code']),
    countryLabel: getString(country['label']),
    telephone: getString(a['telephone']),
    availableShippingMethods: availableMethods.map((method) => {
      const m = getObject(method);
      const amount = getObject(m['amount']);
      return {
        carrierCode: getString(m['carrier_code']),
        methodCode: getString(m['method_code']),
        carrierTitle: getString(m['carrier_title']),
        methodTitle: getString(m['method_title']),
        price: getNumber(amount['value']),
        currency: getString(amount['currency'], 'BRL'),
        errorMessage: getString(m['error_message']),
        available: getBoolean(m['available']),
      };
    }),
    selectedShippingMethod: selectedMethod
      ? (() => {
          const sm = getObject(selectedMethod);
          const amount = getObject(sm['amount']);
          return {
            carrierCode: getString(sm['carrier_code']),
            methodCode: getString(sm['method_code']),
            carrierTitle: getString(sm['carrier_title']),
            methodTitle: getString(sm['method_title']),
            price: getNumber(amount['value']),
            currency: getString(amount['currency'], 'BRL'),
          };
        })()
      : null,
  };
}

function createCartItemModel(item: unknown): CartItemModel | null {
  if (!item) {
    return null;
  }

  const i = getObject(item);
  const product = getObject(i['product']);
  const configuredVariant = getObject(i['configured_variant']);
  const priceRange = getObject(configuredVariant['price_range'] ?? product['price_range']);
  const minimumPrice = getObject(priceRange['minimum_price']);
  const productImage = getObject(product['image']);
  const regularPrice = getObject(minimumPrice['regular_price']);
  const finalPrice = getObject(minimumPrice['final_price']);

  return {
    uid: getString(i['uid']),
    id: getString(i['id']),
    quantity: getNumber(i['quantity']),
    product: {
      uid: getString(product['uid']),
      sku: getString(product['sku']),
      name: getString(product['name']),
      urlKey: getString(product['url_key']),
      imageUrl: getString(productImage['url']),
      imageLabel: getString(productImage['label'] ?? product['name']),
      regularPrice: regularPrice['value'] != null ? getNumber(regularPrice['value']) : null,
      finalPrice: finalPrice['value'] != null ? getNumber(finalPrice['value']) : null,
      currency: getString(finalPrice['currency'] ?? regularPrice['currency'], 'BRL'),
    },
    configuredVariant: configuredVariant['uid']
      ? (() => {
          const cvPriceRange = getObject(configuredVariant['price_range']);
          const cvMinPrice = getObject(cvPriceRange['minimum_price']);
          const cvFinalPrice = getObject(cvMinPrice['final_price']);
          return {
            uid: getString(configuredVariant['uid']),
            sku: getString(configuredVariant['sku']),
            name: getString(configuredVariant['name']),
            finalPrice: cvFinalPrice['value'] != null ? getNumber(cvFinalPrice['value']) : null,
            currency: getString(cvFinalPrice['currency'], 'BRL'),
          };
        })()
      : null,
    raw: asRaw(item),
  };
}

export function createCartModel(cart: RawObject | null | undefined): CartModel | null {
  if (!cart) {
    return null;
  }

  const prices = getObject(cart['prices']);
  const shippingAddresses = getArray(cart['shipping_addresses']);
  const shippingAddress = shippingAddresses[0];
  const appliedTaxes = getArray(prices['applied_taxes']);
  const totalTaxValue = appliedTaxes.reduce<number>((sum, tax) => {
    const t = getObject(tax);
    const amount = getObject(t['amount']);
    return sum + getNumber(amount['value']);
  }, 0);

  const selectedMethod = shippingAddress
    ? getObject(shippingAddress)['selected_shipping_method']
    : undefined;
  const selectedMethodAmount = selectedMethod
    ? getObject(getObject(selectedMethod)['amount'])
    : undefined;

  return {
    id: getString(cart['id']),
    totalQuantity: getNumber(cart['total_quantity']),
    isVirtual: getBoolean(cart['is_virtual']),
    email: getString(cart['email']),
    items: getArray(cart['items']).map(createCartItemModel),
    subtotal: createMoneyModel(prices['subtotal_excluding_tax']),
    grandTotal: createMoneyModel(prices['grand_total']),
    totalTax: createMoneyModel(
      appliedTaxes.length
        ? {
            value: totalTaxValue,
            currency: getString(
              getObject(getObject(appliedTaxes[0])['amount'])['currency'] ?? getObject(prices['grand_total'])['currency'],
              'BRL',
            ),
          }
        : null,
    ),
    totalShipping: createMoneyModel(selectedMethodAmount),
    discounts: getArray(prices['discounts']).map(createCartDiscountModel).filter((d): d is CartDiscountModel => d !== null),
    appliedCoupons: getArray(cart['applied_coupons']).map((coupon) => ({
      code: getString(getObject(coupon)['code']),
    })),
    shippingAddresses: shippingAddresses.map(createCartAddressModel),
    billingAddress: createCartAddressModel(cart['billing_address']),
    availablePaymentMethods: getArray(cart['available_payment_methods']).map((method) => {
      const m = getObject(method);
      return {
        code: getString(m['code']),
        title: getString(m['title']),
      };
    }),
    selectedPaymentMethod: cart['selected_payment_method']
      ? (() => {
          const spm = getObject(cart['selected_payment_method']);
          return {
            code: getString(spm['code']),
            title: getString(spm['title']),
            purchaseOrderNumber: getString(spm['purchase_order_number']),
          };
        })()
      : null,
    raw: asRaw(cart),
  };
}

export function createCustomerModel(customer: RawObject | null | undefined): CustomerModel | null {
  if (!customer) {
    return null;
  }

  const firstname = getString(customer['firstname']);
  const lastname = getString(customer['lastname']);

  return {
    createdAt: getString(customer['created_at']),
    dateOfBirth: getString(customer['date_of_birth'] ?? customer['dob']),
    email: getString(customer['email']),
    firstName: firstname,
    fullName: [firstname, lastname].filter(Boolean).join(' '),
    gender: customer['gender'] != null ? getNumber(customer['gender']) : null,
    lastName: lastname,
    prefix: getString(customer['prefix']),
    suffix: getString(customer['suffix']),
    taxvat: getString(customer['taxvat']),
    raw: asRaw(customer),
  };
}

export function createCustomerAddressModel(address: RawObject | null | undefined): CustomerAddressModel | null {
  if (!address) {
    return null;
  }

  const region = getObject(address['region']);

  return {
    city: getString(address['city']),
    company: getString(address['company']),
    countryCode: getString(address['country_code']),
    defaultBilling: getBoolean(address['default_billing']),
    defaultShipping: getBoolean(address['default_shipping']),
    fax: getString(address['fax']),
    firstName: getString(address['firstname']),
    id: address['id'] as number | string,
    lastName: getString(address['lastname']),
    middleName: getString(address['middlename']),
    postcode: getString(address['postcode']),
    prefix: getString(address['prefix']),
    region: getString(region['region']),
    regionCode: getString(region['region_code']),
    regionId: region['region_id'] != null
      ? getNumber(region['region_id'])
      : address['region_id'] != null
        ? getNumber(address['region_id'])
        : null,
    street: getArray(address['street']).map((s) => getString(s)),
    suffix: getString(address['suffix']),
    telephone: getString(address['telephone']),
    vatId: getString(address['vat_id']),
    raw: asRaw(address),
  };
}

function createOrderAddressModel(address: unknown): OrderAddressModel | null {
  if (!address) {
    return null;
  }

  const a = getObject(address);

  return {
    city: getString(a['city']),
    company: getString(a['company']),
    countryCode: getString(a['country_code']),
    fax: getString(a['fax']),
    firstName: getString(a['firstname']),
    lastName: getString(a['lastname']),
    middleName: getString(a['middlename']),
    postcode: getString(a['postcode']),
    region: getString(a['region']),
    regionId: a['region_id'] != null ? getNumber(a['region_id']) : null,
    street: getArray(a['street']).map((s) => getString(s)),
    telephone: getString(a['telephone']),
    vatId: getString(a['vat_id']),
    raw: asRaw(address),
  };
}

function createOrderCustomerInfoModel(customerInfo: unknown): OrderCustomerInfoModel | null {
  if (!customerInfo) {
    return null;
  }

  const ci = getObject(customerInfo);

  return {
    firstName: getString(ci['firstname']),
    lastName: getString(ci['lastname']),
    middleName: getString(ci['middlename']),
    prefix: getString(ci['prefix']),
    suffix: getString(ci['suffix']),
    raw: asRaw(customerInfo),
  };
}

function createOrderItemOptionModel(option: unknown): OrderItemOptionModel | null {
  if (!option) {
    return null;
  }

  const o = getObject(option);

  return {
    label: getString(o['label']),
    value: getString(o['value']),
    raw: asRaw(option),
  };
}

function createDiscountModel(discount: unknown): DiscountModel | null {
  if (!discount) {
    return null;
  }

  const d = getObject(discount);
  const amount = getObject(d['amount']);

  return {
    amountCurrency: getString(amount['currency'], 'BRL'),
    amountValue: amount['value'] != null ? getNumber(amount['value']) : null,
    label: getString(d['label']),
    raw: asRaw(discount),
  };
}

function createOrderItemModel(item: unknown): OrderItemModel | null {
  if (!item) {
    return null;
  }

  const i = getObject(item);
  const salePrice = getObject(i['product_sale_price']);
  const prices = getObject(i['prices']);
  const rowTotal = getObject(prices['row_total']);

  return {
    discounts: getArray(i['discounts']).map(createDiscountModel),
    enteredOptions: getArray(i['entered_options']).map(createOrderItemOptionModel),
    id: i['id'] as string | number,
    productName: getString(i['product_name']),
    productSku: getString(i['product_sku']),
    productType: getString(i['product_type']),
    quantityCanceled: getNumber(i['quantity_canceled']),
    quantityInvoiced: getNumber(i['quantity_invoiced']),
    quantityOrdered: getNumber(i['quantity_ordered']),
    quantityRefunded: getNumber(i['quantity_refunded']),
    quantityReturned: getNumber(i['quantity_returned']),
    quantityShipped: getNumber(i['quantity_shipped']),
    salePriceCurrency: getString(salePrice['currency'], 'BRL'),
    salePriceValue: salePrice['value'] != null ? getNumber(salePrice['value']) : null,
    selectedOptions: getArray(i['selected_options']).map(createOrderItemOptionModel),
    status: getString(i['status']),
    rowTotalCurrency: getString(rowTotal['currency'], 'BRL'),
    rowTotalValue: rowTotal['value'] != null ? getNumber(rowTotal['value']) : null,
    raw: asRaw(item),
  };
}

function createOrderPaymentMethodModel(paymentMethod: unknown): OrderPaymentMethodModel | null {
  if (!paymentMethod) {
    return null;
  }

  const pm = getObject(paymentMethod);

  return {
    additionalData: getArray(pm['additional_data']).map((item) => {
      const d = getObject(item);
      return {
        name: getString(d['name']),
        value: getString(d['value']),
        raw: asRaw(item),
      };
    }),
    name: getString(pm['name']),
    type: getString(pm['type']),
    raw: asRaw(paymentMethod),
  };
}

function createSalesCommentModel(comment: unknown): SalesCommentModel | null {
  if (!comment) {
    return null;
  }

  const c = getObject(comment);

  return {
    message: getString(c['message']),
    timestamp: getString(c['timestamp']),
    raw: asRaw(comment),
  };
}

function createOrderShipmentModel(shipment: unknown): OrderShipmentModel | null {
  if (!shipment) {
    return null;
  }

  const s = getObject(shipment);

  return {
    comments: getArray(s['comments']).map(createSalesCommentModel),
    id: s['id'] as string | number,
    items: getArray(s['items']).map((item) => {
      const si = getObject(item);
      return {
        id: si['id'] as string | number | undefined,
        productName: getString(si['product_name']),
        productSku: getString(si['product_sku']),
        quantityShipped: getNumber(si['quantity_shipped']),
        raw: asRaw(item),
      };
    }),
    number: getString(s['number']),
    tracking: getArray(s['tracking']).map((track) => {
      const t = getObject(track);
      return {
        carrier: getString(t['carrier']),
        number: getString(t['number']),
        title: getString(t['title']),
        raw: asRaw(track),
      };
    }),
    raw: asRaw(shipment),
  };
}

function createOrderInvoiceModel(invoice: unknown): OrderInvoiceModel | null {
  if (!invoice) {
    return null;
  }

  const inv = getObject(invoice);
  const total = getObject(inv['total']);
  const grandTotal = getObject(total['grand_total']);

  return {
    comments: getArray(inv['comments']).map(createSalesCommentModel),
    grandTotalCurrency: getString(grandTotal['currency'], 'BRL'),
    grandTotalValue: grandTotal['value'] != null ? getNumber(grandTotal['value']) : null,
    id: inv['id'] as string | number,
    items: getArray(inv['items']).map((item) => {
      const ii = getObject(item);
      return {
        id: ii['id'] as string | number | undefined,
        productName: getString(ii['product_name']),
        productSku: getString(ii['product_sku']),
        quantityInvoiced: getNumber(ii['quantity_invoiced']),
        raw: asRaw(item),
      };
    }),
    number: getString(inv['number']),
    raw: asRaw(invoice),
  };
}

export function createCustomerOrderModel(order: RawObject | null | undefined): CustomerOrderModel | null {
  if (!order) {
    return null;
  }

  const total = getObject(order['total']);
  const grandTotal = getObject(total['grand_total']);
  const subtotalExclTax = getObject(total['subtotal_excl_tax']);
  const subtotal = getObject(total['subtotal']);
  const shippingHandling = getObject(total['shipping_handling']);
  const shippingHandlingTotal = getObject(shippingHandling['total_amount']);
  const totalShipping = getObject(total['total_shipping']);
  const totalTax = getObject(total['total_tax']);

  return {
    appliedCoupons: getArray(order['applied_coupons']).map((coupon) => ({
      code: getString(getObject(coupon)['code']),
    })),
    availableActions: getArray(order['available_actions']).map((a) => getString(a)),
    billingAddress: createOrderAddressModel(order['billing_address']),
    carrier: getString(order['carrier']),
    comments: getArray(order['comments']).map(createSalesCommentModel),
    customerEmail: getString(order['email']),
    customerInfo: createOrderCustomerInfoModel(order['customer_info']),
    date: getString(order['order_date']),
    grandTotalCurrency: getString(grandTotal['currency'], 'BRL'),
    grandTotalValue: grandTotal['value'] != null ? getNumber(grandTotal['value']) : null,
    id: order['id'] as string | number,
    invoices: getArray(order['invoices']).map(createOrderInvoiceModel),
    isVirtual: getBoolean(order['is_virtual']),
    items: getArray(order['items']).map(createOrderItemModel),
    number: getString(order['number']),
    paymentMethods: getArray(order['payment_methods']).map(createOrderPaymentMethodModel),
    shippingAddress: createOrderAddressModel(order['shipping_address']),
    shippingMethod: getString(order['shipping_method']),
    shipments: getArray(order['shipments']).map(createOrderShipmentModel),
    status: getString(order['status']),
    statusChangedAt: getString(order['order_status_change_date']),
    subtotalCurrency: getString(subtotalExclTax['currency'] ?? subtotal['currency'], 'BRL'),
    subtotalValue: subtotalExclTax['value'] != null
      ? getNumber(subtotalExclTax['value'])
      : subtotal['value'] != null
        ? getNumber(subtotal['value'])
        : null,
    token: getString(order['token']),
    totalDiscounts: getArray(total['discounts']).map(createDiscountModel),
    totalShippingCurrency: getString(
      shippingHandlingTotal['currency'] ?? totalShipping['currency'],
      'BRL',
    ),
    totalShippingValue: shippingHandlingTotal['value'] != null
      ? getNumber(shippingHandlingTotal['value'])
      : totalShipping['value'] != null
        ? getNumber(totalShipping['value'])
        : null,
    totalTaxCurrency: getString(totalTax['currency'], 'BRL'),
    totalTaxValue: totalTax['value'] != null ? getNumber(totalTax['value']) : null,
    raw: asRaw(order),
  };
}

export function createCustomerDashboardModel(customer: RawObject | null | undefined): CustomerDashboardModel | null {
  if (!customer) {
    return null;
  }

  return {
    customer: createCustomerModel(customer),
    defaultBillingAddress:
      getArray(customer['addresses'])
        .map((a) => createCustomerAddressModel(getObject(a)))
        .find((address) => address?.defaultBilling) ?? null,
    defaultShippingAddress:
      getArray(customer['addresses'])
        .map((a) => createCustomerAddressModel(getObject(a)))
        .find((address) => address?.defaultShipping) ?? null,
    isSubscribed: getBoolean(customer['is_subscribed']),
    orders: getArray(getObject(customer['orders'])['items']).map((o) => createCustomerOrderModel(getObject(o))),
    ordersTotalCount: getNumber(getObject(customer['orders'])['total_count']),
    addresses: getArray(customer['addresses']).map((a) => createCustomerAddressModel(getObject(a))),
  };
}

// Re-export helper types for consumers
export type { RawObject };

// Suppress unused variable warnings for helper functions used via inference
void getNumberOrNull;
