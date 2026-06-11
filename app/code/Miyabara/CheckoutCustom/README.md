# Miyabara_CheckoutCustom

Provides branded checkout UI customizations for the DM3D Tech store. Replaces the default Magento/Hyvä checkout visuals with a dark-header layout, DM3D logo, and a branded order success page — all in Portuguese.

---

## Features

- Custom checkout header with DM3D SVG logo and "Compra segura" trust badge
- Dark navigation bar (`#0f172a`) replacing the default Magento header
- Blue primary buttons (`#1d4ed8`) and orange accent (`#f97316`) throughout the checkout flow
- Branded order success card with checkmark, Portuguese labels, and CTAs
- Overridden cart items summary template
- LESS-based style overrides for: progress bar, step titles, form inputs, sidebar, shipping and payment areas, loading spinner

---

## Requirements

- Mage-OS / Magento 2.4.x
- Hyvä Theme with `Hyva_ThemeFallback` and `Hyva_LumaCheckout` installed
- `Magento_Checkout` module (core)

---

## Installation

```bash
bin/magento module:enable Miyabara_CheckoutCustom
bin/magento setup:upgrade
bin/magento setup:static-content:deploy pt_BR en_US -f
bin/magento cache:flush
```

---

## What Gets Customized

### Checkout page (`/checkout`)

| Element | Behavior |
|---------|---------|
| Default Magento logo | Removed |
| Header | Replaced by `header.phtml` — dark bar with DM3D logo and trust badge |
| Primary buttons | Blue `#1d4ed8` (hover `#1e40af`) |
| Progress bar | Styled with brand colors |
| Form input focus | Blue outline `#1d4ed8` |
| Cart sidebar | Custom background and border |
| Shipping/payment rows | Brand-consistent styling |
| Loading spinner | Custom overlay |

### Order success page (`/checkout/onepage/success`)

| Element | Behavior |
|---------|---------|
| Default logo | Removed |
| Header | Same DM3D branded header |
| Success block | Replaced by `success.phtml` — centered card with green checkmark |
| Heading | "Pedido realizado com sucesso!" |
| Subtext | "Obrigado pela sua compra. Seu pedido foi confirmado." |
| Order ID | Displayed with Portuguese label |
| CTA buttons | "Ver Meus Pedidos" and "Continuar Comprando" |

---

## Module Structure

```
Miyabara/CheckoutCustom/
├── etc/
│   └── module.xml
├── view/frontend/
│   ├── requirejs-config.js              # Replaces cart-items template
│   ├── layout/
│   │   ├── checkout_index_index.xml     # Checkout page layout overrides
│   │   └── checkout_onepage_success.xml # Success page layout overrides
│   ├── templates/
│   │   ├── header.phtml                 # DM3D branded header
│   │   └── success.phtml               # Order success card
│   └── web/
│       ├── css/source/_module.less      # All style overrides
│       └── template/summary/
│           └── cart-items.html          # Cart items Knockout template
```

---

## No Admin Configuration

This module has no system configuration, no database tables, no controllers, and no admin UI. All customization is via layout XML, PHTML templates, and LESS.

---

## Customizing Further

### Changing brand colors

Edit [view/frontend/web/css/source/_module.less](view/frontend/web/css/source/_module.less). The primary variables used throughout:

| Purpose | Value |
|---------|-------|
| Primary (buttons, links, focus) | `#1d4ed8` |
| Primary hover | `#1e40af` |
| Accent | `#f97316` |
| Header background | `#0f172a` |

After editing LESS, redeploy static content:

```bash
bin/magento setup:static-content:deploy pt_BR en_US -f
bin/magento cache:clean
```

### Changing the logo

Open [view/frontend/templates/header.phtml](view/frontend/templates/header.phtml) and replace the inline SVG with your own SVG markup or an `<img>` tag pointing to a file under `view/frontend/web/images/`.

### Changing success page text

Edit [view/frontend/templates/success.phtml](view/frontend/templates/success.phtml). Order ID is passed via the standard `Magento\Checkout\Model\Session` order data available on the success page.

---

## Dependencies

| Module | Reason |
|--------|--------|
| `Hyva_ThemeFallback` | Hyvä theme compatibility layer |
| `Hyva_LumaCheckout` | Hyvä Luma checkout variant being customized |
| `Magento_Checkout` | Core checkout module |
