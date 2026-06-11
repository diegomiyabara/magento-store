# Miyabara_Buffer

Integrates the [Buffer](https://buffer.com) social media scheduling API with the Magento 2 admin panel. Store administrators can compose social media posts, attach product images, select target channels, and queue or schedule them — all without leaving the admin.

---

## Features

- Configure your Buffer API key via Stores → Configuration
- Sync available Buffer channels with one click
- Compose posts (up to 2,200 characters) directly in the admin
- Attach any public image URL or pull from a product search
- Post to multiple channels simultaneously
- Add to queue or schedule for a specific date and time

---

## Requirements

- Mage-OS / Magento 2.4.x
- PHP 8.1+
- A [Buffer account](https://buffer.com) with an API key (`publish.buffer.com → Settings → API`)
- Admin role with `Miyabara_Buffer::post_index` and `Miyabara_Buffer::config` ACL resources

---

## Installation

The module lives inside `app/code/` and is loaded automatically. After adding the files, run:

```bash
bin/magento module:enable Miyabara_Buffer
bin/magento setup:upgrade
bin/magento cache:flush
```

---

## Configuration

1. Go to **Stores → Configuration → DM3D → Buffer API**.
2. Paste your Buffer API key in the **API Key** field (stored encrypted).
3. Save the configuration.
4. Navigate to **Marketing → Buffer Posts** and click **Sync Channels** to pull your Buffer channels.

### Configuration path reference

| Setting | Config path |
|---------|-------------|
| API Key | `miyabara_buffer/general/api_key` |
| Channels cache | `miyabara_buffer/channels/data` |

---

## Usage

### Creating a social post

1. Go to **Marketing → Buffer Posts** in the admin sidebar.
2. **Search for a product** (optional) — type a product name in the search box; selecting a result pre-fills the image URL field.
3. **Write your post text** in the textarea (character counter shown).
4. **Add an image URL** (optional) — paste any publicly accessible image URL; a preview appears automatically.
5. **Select channels** — check one or more Buffer channels.
6. **Choose scheduling**:
   - **Add to Queue** — Buffer queues the post according to your schedule.
   - **Schedule for specific time** — pick a date and time.
7. Click **Publish Post**.

### Syncing channels

Click the **Sync Channels** button on the Buffer Posts page. This calls the Buffer GraphQL API and caches the channel list in `core_config_data`. Re-sync any time you add or remove channels in Buffer.

---

## Admin Routes

| URL | Method | Purpose |
|-----|--------|---------|
| `/admin/buffer/post/index` | GET | Buffer post creation page |
| `/admin/buffer/post/save` | POST | Submit and queue post(s) |
| `/admin/buffer/channel/sync` | POST (AJAX) | Fetch channels from Buffer API |
| `/admin/buffer/product/search` | GET (AJAX) | Product autocomplete search |

---

## Module Structure

```
Miyabara/Buffer/
├── Api/
│   └── BufferClientInterface.php   # Service contract
├── Controller/Adminhtml/
│   ├── AbstractAction.php          # Base admin controller
│   ├── Channel/Sync.php            # Channel sync AJAX
│   ├── Post/Index.php              # Post creation page
│   ├── Post/Save.php               # Post form submission
│   └── Product/Search.php          # Product search AJAX
├── Model/
│   ├── BufferClient.php            # Buffer GraphQL API client
│   └── Config.php                  # Config reader/writer
├── etc/
│   ├── module.xml
│   ├── config.xml
│   ├── di.xml
│   ├── acl.xml
│   └── adminhtml/
│       ├── menu.xml
│       ├── routes.xml
│       └── system.xml
└── view/adminhtml/
    ├── layout/buffer_post_index.xml
    └── templates/post/create.phtml
```

---

## ACL Resources

| Resource | Purpose |
|----------|---------|
| `Miyabara_Buffer::post_index` | Access Marketing → Buffer Posts page |
| `Miyabara_Buffer::config` | Access Stores → Configuration → Buffer API |

---

## External API

All requests go to the Buffer GraphQL API. The `BufferClient` handles:

- `GET /channels` — retrieve connected Buffer channels
- `POST /posts` — create/queue a post with optional media attachment

No webhooks or inbound API surface.

---

## Troubleshooting

| Symptom | Solution |
|---------|---------|
| No channels listed after sync | Verify the API key is correct and the Buffer account has at least one channel connected |
| Post fails silently | Check Magento logs (`var/log/exception.log`); the Buffer API may return an error payload |
| Channels out of date | Click **Sync Channels** again — the cached JSON in `core_config_data` is not auto-refreshed |
