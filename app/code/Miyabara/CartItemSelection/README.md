# Miyabara_CartItemSelection

Allows customers to selectively include or exclude items from a cart before checkout. Each cart item carries an `is_active` flag; deselected items are invisible to totals, shipping, and the checkout flow, but remain in the quote. After a successful order, deselected items are automatically moved to a new cart (the "remnant cart") so the customer can purchase them later.

---

## Features

- Per-item `is_active` flag stored on `quote_item`
- Deselected items are excluded from totals and shipping calculations
- GraphQL field `is_active` on every `CartItemInterface` implementation
- GraphQL mutations to toggle one or many items in a single request
- Automatic remnant cart created for logged-in customers after order placement

---

## Requirements

- Mage-OS / Magento 2.4.x
- PHP 8.1+
- `Magento_Quote` and `Magento_QuoteGraphQl`

---

## Installation

```bash
bin/magento module:enable Miyabara_CartItemSelection
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento cache:flush
```

`setup:upgrade` runs the declarative schema patch that adds the `is_active` column (default `1`) to `quote_item`.

---

## How It Works

### Item filtering during checkout

Two `after` plugins intercept the item collections returned by `Quote` and `Quote\Address`:

- `FilterInactiveQuoteItems` — filters the results of `Quote::getAllVisibleItems()` and `Quote::getAllItems()`.
- `FilterInactiveAddressItems` — filters the result of `Quote\Address::getAllItems()`.

Any item with `is_active = 0` is stripped from the returned array before Magento uses it for totals collection, shipping rate calculation, or order placement. Items without the flag (legacy rows) are treated as active (`is_active ?? 1`).

### GraphQL cart items list

The native `CartItems` GraphQL resolver calls `Quote::getAllVisibleItems()`, which would already apply the filter above and hide inactive items from the storefront. A third plugin (`CartItemsGraphQlResolver`) uses an `around` interceptor on `CartItems::resolve()` to bypass the filtered collection and instead iterate `Quote::getItemsCollection()` directly — returning **all** items, both active and inactive, so the storefront can render the full list with toggle controls.

When totals and checkout run through the non-GraphQL path they still see only active items because those code paths go through the filtered `getAllItems` / `getAllVisibleItems` methods.

### Remnant cart after order

The `checkout_submit_all_after` event triggers `CreateRemnantCartAfterOrder`. For logged-in customers it:

1. Collects all parent items on the just-placed quote that have `is_active = 0`.
2. Creates a new empty cart for the customer via `CartManagementInterface`.
3. Re-saves each inactive item with the new `quote_id`.

If an individual item cannot be transferred (e.g. stock issue), a session warning is shown and the failure is logged; the remaining items are still processed.

Guest carts are skipped — no remnant cart is created for guests.

---

## GraphQL API

### Field: `is_active` on `CartItemInterface`

Every cart item type (simple, configurable, bundle, etc.) inherits this field.

```graphql
interface CartItemInterface {
    is_active: Boolean!
}
```

Returns `true` if the item is included in totals and checkout; `false` if deselected.

Example query:

```graphql
{
  cart(cart_id: "MASKED_CART_ID") {
    items {
      uid
      quantity
      is_active
      product {
        name
        sku
      }
    }
  }
}
```

---

### Mutation: `setCartItemSelected`

Toggle the active state of a single cart item.

```graphql
mutation SetCartItemSelected($input: SetCartItemSelectedInput!) {
  setCartItemSelected(input: $input) {
    cart {
      prices {
        grand_total { value currency }
      }
      items {
        uid
        is_active
      }
    }
  }
}
```

**Input**

| Field | Type | Description |
|-------|------|-------------|
| `cart_id` | `String!` | Masked cart ID |
| `cart_item_uid` | `ID!` | Base64-encoded cart item ID |
| `is_active` | `Boolean!` | `true` to include, `false` to exclude |

**Output**: `SetCartItemSelectedOutput { cart: Cart! }` — the updated cart with recalculated totals.

Example variables:

```json
{
  "input": {
    "cart_id": "abc123masked",
    "cart_item_uid": "Mw==",
    "is_active": false
  }
}
```

---

### Mutation: `setCartItemsSelected`

Toggle the active state of multiple items in one request. All items are validated before any write occurs; if any UID is invalid the mutation throws without modifying the cart.

```graphql
mutation SetCartItemsSelected($input: SetCartItemsSelectedInput!) {
  setCartItemsSelected(input: $input) {
    cart {
      prices {
        grand_total { value currency }
      }
      items {
        uid
        is_active
      }
    }
  }
}
```

**Input**

| Field | Type | Description |
|-------|------|-------------|
| `cart_id` | `String!` | Masked cart ID |
| `items` | `[CartItemSelectionInput!]!` | List of items to update |

`CartItemSelectionInput`:

| Field | Type | Description |
|-------|------|-------------|
| `cart_item_uid` | `ID!` | Base64-encoded cart item ID |
| `is_active` | `Boolean!` | `true` to include, `false` to exclude |

**Output**: `SetCartItemsSelectedOutput { cart: Cart! }` — the updated cart with recalculated totals.

Example variables:

```json
{
  "input": {
    "cart_id": "abc123masked",
    "items": [
      { "cart_item_uid": "Mw==", "is_active": false },
      { "cart_item_uid": "NA==", "is_active": true }
    ]
  }
}
```

Both mutations reset shipping rates and clear the address item cache after writing, so totals returned in the response are accurate.

---

## Module Structure

```
Miyabara/CartItemSelection/
├── Model/Resolver/
│   ├── CartItemIsActive.php          # Resolves is_active field on CartItemInterface
│   ├── SetCartItemSelected.php       # setCartItemSelected mutation resolver
│   └── SetCartItemsSelected.php      # setCartItemsSelected mutation resolver
├── Observer/
│   └── CreateRemnantCartAfterOrder.php  # Moves inactive items to a new cart after order
├── Plugin/
│   ├── CartItemsGraphQlResolver.php  # around CartItems::resolve — exposes all items to GraphQL
│   ├── FilterInactiveAddressItems.php  # after Address::getAllItems — removes inactive items
│   └── FilterInactiveQuoteItems.php  # after Quote::getAllItems/getAllVisibleItems — removes inactive items
├── etc/
│   ├── di.xml                        # Plugin registrations
│   ├── events.xml                    # checkout_submit_all_after observer
│   ├── module.xml                    # Sequence: Magento_Quote, Magento_GraphQl, Magento_QuoteGraphQl
│   └── schema.graphqls               # is_active field + two mutations
├── db_schema.xml                     # Adds is_active (tinyint, default 1) to quote_item
└── registration.php
```
