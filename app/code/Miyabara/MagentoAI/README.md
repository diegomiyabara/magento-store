# Miyabara_MagentoAI

AI-powered content generation for Magento 2 product pages. Generates product descriptions, short descriptions, and product images directly inside the product edit form — with support for OpenAI, Anthropic Claude, and Google Gemini.

---

## Features

- **Text generation**: full and short product descriptions using product attribute context
- **Image generation**: create product images from a text prompt
- **Image modification**: edit existing gallery images using an AI prompt
- **Multi-provider**: OpenAI, Anthropic (Claude), and Google Gemini — switch at any time from config
- **Page Builder integration**: inject AI-generated HTML directly into the Page Builder HTML editor
- **Flexible prompts**: configurable system prompts with template variables (`{{name}}`, `{{sku}}`, `{{attributes}}`)
- **Attribute context**: choose which product attributes feed into the AI prompt

---

## Requirements

- Mage-OS / Magento 2.4.x
- PHP 8.1+
- At least one AI provider API key:
  - [OpenAI](https://platform.openai.com) — text and image generation/modification
  - [Anthropic](https://console.anthropic.com) — text generation
  - [Google Gemini](https://aistudio.google.com) — text and image generation/modification
- Admin role with `Miyabara_MagentoAI::generate` ACL resource

---

## Installation

```bash
bin/magento module:enable Miyabara_MagentoAI
bin/magento setup:upgrade
bin/magento setup:di:compile
bin/magento cache:flush
```

---

## Configuration

Go to **Stores → Configuration → Miyabara → MagentoAI**.

### General

| Field | Description |
|-------|-------------|
| Enabled | Turn the module on/off globally |
| Baseline Prompt | Text prepended to every AI request (e.g. brand voice guidelines) |

### API Configuration

| Field | Description |
|-------|-------------|
| Provider | Active provider: `OpenAI`, `Anthropic`, or `Gemini` |
| OpenAI API Key | Encrypted. Get from `platform.openai.com` |
| OpenAI Model | e.g. `gpt-4o`, `gpt-4-turbo` |
| OpenAI Base URL | Override for proxies; default `https://api.openai.com/v1` |
| Anthropic API Key | Encrypted. Get from `console.anthropic.com` |
| Anthropic Model | e.g. `claude-opus-4-8`, `claude-sonnet-4-6` |
| Anthropic Base URL | Override for proxies; default `https://api.anthropic.com` |
| Gemini API Key | Encrypted. Get from `aistudio.google.com` |
| Gemini Model | e.g. `gemini-2.5-pro`, `gemini-2.0-flash` |
| Gemini Base URL | Override for proxies |

### Product Description Generation

| Field | Description |
|-------|-------------|
| Attributes | Multiselect — which product attributes are sent as context to the AI |
| Temperature | Creativity level 0.0–2.0 (default 0.5) |
| Full Description Prompt | Prompt template for long description; supports `{{name}}`, `{{sku}}`, `{{attributes}}` |
| Full Description Max Tokens | Token limit for full description (default 1024) |
| Short Description Prompt | Prompt template for short description |
| Short Description Max Tokens | Token limit for short description (default 256) |

### Image Generation

| Field | Description |
|-------|-------------|
| Attributes | Product attributes used to seed the image prompt |
| Default Generation Prompt | Default prompt shown in the image generation modal |
| Default Modification Prompt | Default prompt shown in the image modification modal |
| OpenAI Image Model | e.g. `gpt-image-1`, `dall-e-3` |
| OpenAI Image Size | e.g. `1024x1024`, `1792x1024` |
| OpenAI Image Quality | `standard` or `hd` |
| Gemini Image Model | e.g. `imagen-3.0-generate-002` |

---

## Usage

### Generating a product description

1. Open any product in **Catalog → Products → Edit**.
2. Click **Generate with MagentoAI** above the Description or Short Description field.
   - The AI collects configured attribute values from the form and calls the configured provider.
   - The generated text is inserted into the editor automatically.
3. For a custom prompt, click **Advanced Generate with MagentoAI** to open the advanced modal, type your own prompt, and click Generate.

### Generating a product image

1. On the product edit page, scroll to the **Images and Videos** section.
2. Click **Generate Image with MagentoAI**.
3. In the modal, edit the prompt (pre-filled from config) and click **Generate**.
4. The generated image is saved to `pub/media/catalog/product/cache/` and added to the gallery.

### Modifying an existing image

1. On the product edit page, scroll to **Images and Videos**.
2. Click **Edit Image with MagentoAI**.
3. **Step 1** — select the gallery image you want to modify.
4. **Step 2** — enter a modification prompt (e.g. "Remove background and make it white").
5. **Step 3** — compare original and modified image; click **Use This Image** to apply.

### Using from Page Builder

1. Open a Page Builder row with an **HTML** content type.
2. Click the **MagentoAI** button in the HTML editor toolbar.
3. Write or auto-generate content; it is inserted into the HTML element.

---

## AJAX Endpoints

All endpoints require admin authentication and `Miyabara_MagentoAI::generate` ACL.

| URL | Method | Request | Response |
|-----|--------|---------|---------|
| `/admin/miyabara_mageai/ai/generate` | POST | `product_id`, `attributes[]`, `prompt` (optional), `type` (`full`/`short`) | `{ error: bool, data: string }` |
| `/admin/miyabara_mageai/ai/generateimage` | POST | `product_id`, `prompt` | `{ error: bool, data: { url: string } }` |
| `/admin/miyabara_mageai/ai/modifyimage` | POST | `image_url`, `prompt` | `{ error: bool, data: { url: string } }` |

---

## Prompt Template Variables

Use these placeholders in Description and Image prompt fields:

| Variable | Replaced with |
|----------|--------------|
| `{{name}}` | Product name |
| `{{sku}}` | Product SKU |
| `{{attributes}}` | Comma-separated `Label: Value` pairs from configured attributes |

Example:

```
Write a compelling product description for "{{name}}" (SKU: {{sku}}).
Product details: {{attributes}}.
Write in Brazilian Portuguese, formal tone, 2–3 paragraphs.
```

---

## Module Structure

```
Miyabara/MagentoAI/
├── Api/
│   ├── ConfigInterface.php
│   ├── TextGenerationServiceInterface.php
│   ├── ImageGenerationServiceInterface.php
│   └── ImageModificationServiceInterface.php
├── Controller/Adminhtml/Ai/
│   ├── Generate.php
│   ├── GenerateImage.php
│   └── ModifyImage.php
├── Model/
│   ├── Config.php
│   ├── AttributeData/Formatter.php
│   ├── Config/Source/              # Admin dropdown/multiselect option sources
│   │   ├── AiProvider.php
│   │   ├── AiModel.php
│   │   ├── AnthropicModel.php
│   │   ├── GeminiModel.php
│   │   ├── Attributes.php
│   │   ├── OpenAiImageModel.php
│   │   ├── GeminiImageModel.php
│   │   ├── GptImageSize.php
│   │   └── ImageQuality.php
│   ├── Service/
│   │   ├── TextGeneration.php
│   │   ├── ImageGeneration.php
│   │   ├── ImageModification.php
│   │   ├── ImageStorage.php
│   │   └── Exception/AiServiceException.php
│   └── ViewModel/GenerateModal.php
├── Plugin/
│   └── EditorButtonsPlugin.php
├── etc/
│   ├── module.xml
│   ├── config.xml
│   ├── acl.xml
│   └── adminhtml/
│       ├── di.xml
│       ├── routes.xml
│       └── system.xml
└── view/adminhtml/
    ├── requirejs-config.js
    ├── layout/
    │   ├── default.xml
    │   ├── catalog_product_new.xml
    │   └── catalog_product_edit.xml
    ├── templates/generate.phtml
    └── web/
        ├── css/styles.less
        └── js/
            ├── generate.js           # Text generation widget
            ├── image-generate.js     # Image generation widget
            ├── image-modify.js       # Image modification widget (3-step flow)
            ├── html-code-mixin.js    # Page Builder HTML editor mixin
            └── model/mage-ai.js      # Shared core: attribute collection, AJAX, editor update
```

---

## ACL Resources

| Resource | Purpose |
|----------|---------|
| `Miyabara_MagentoAI::generate` | Use Generate/GenerateImage/ModifyImage buttons in product form |
| `Miyabara_MagentoAI::config` | Access Stores → Configuration → MagentoAI |

---

## How It Works

### Text generation flow

1. Admin clicks a generate button on the product form.
2. `generate.js` / `mage-ai.js` reads attribute values from the product form fields.
3. A POST request is sent to `Generate` controller with attribute data and prompt.
4. `TextGeneration` service builds the prompt using the configured template and calls the active provider (OpenAI Chat Completions, Anthropic Messages, or Gemini GenerateContent).
5. The response text is written back into the TinyMCE editor or the plain textarea.

### Image generation flow

1. Admin clicks **Generate Image with MagentoAI** in the gallery section.
2. `image-generate.js` opens the modal; admin enters/edits the prompt.
3. POST request sent to `GenerateImage` controller.
4. `ImageGeneration` service calls OpenAI Images API or Gemini Imagen.
5. The returned image (base64 or URL) is saved via `ImageStorage` to `pub/media/catalog/product/cache/miyabara_ai/`.
6. The URL is returned; `image-generate.js` adds the image to the product gallery.

### Image modification flow

1. Admin clicks **Edit Image with MagentoAI**.
2. `image-modify.js` renders the 3-step modal: gallery picker → prompt → comparison.
3. The selected image and prompt are POSTed to `ModifyImage` controller.
4. `ImageModification` service uploads the image to OpenAI Edit endpoint (multipart) or encodes it inline for Gemini.
5. The modified image is saved and its URL returned for comparison.

---

## Adding a New Provider

1. Add an entry to `AiProvider` source model.
2. Add a model list source model under `Model/Config/Source/`.
3. Add API key/URL/model fields to `adminhtml/system.xml`.
4. Implement the provider logic in `TextGeneration`, `ImageGeneration`, and/or `ImageModification` services with a new `case` branch.
5. Add config defaults to `etc/config.xml`.

---

## Troubleshooting

| Symptom | Solution |
|---------|---------|
| Button does not appear in editor | Verify `Miyabara_MagentoAI::generate` ACL is granted; flush cache; check JS console for errors |
| "AI service error" in modal | Check `var/log/exception.log`; verify the API key is set and the provider URL is reachable |
| Generated image not shown in gallery | Check write permissions on `pub/media/catalog/product/cache/`; review `var/log/exception.log` |
| Page Builder button missing | Ensure Page Builder is installed; check `html-code-mixin.js` is loaded (check `requirejs-config.js`) |
| Wrong language / tone | Customize the prompt templates under Stores → Configuration → Miyabara → MagentoAI → Product Description Generation |
