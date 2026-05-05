# Image Addon - Configuration Guide

## Overview

The **Image Addon** allows users to upload, store, and manage images using **Cloudflare R2** — an S3-compatible object storage service with no egress fees.

## Requirements

- **Cloudflare R2 bucket** — with a public URL enabled (custom domain or R2.dev subdomain)
- **R2 API Token** — with `Object Read & Write` permissions on the bucket
- **`@aws-sdk/client-s3`** npm package

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# ─── Cloudflare R2 Credentials ───────────────────────────────────────────────

# Your Cloudflare Account ID
# Found at: https://dash.cloudflare.com → right sidebar → Account ID
R2_ACCOUNT_ID=your-cloudflare-account-id

# R2 API Token – Access Key ID
# Generated at: Cloudflare Dashboard → R2 → Manage R2 API Tokens
R2_ACCESS_KEY_ID=your-r2-access-key-id

# R2 API Token – Secret Access Key
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key

# The name of your R2 bucket
R2_BUCKET_NAME=your-bucket-name

# Public base URL for the bucket (no trailing slash)
# Either your custom domain:     https://img.example.com
# Or the R2.dev public URL:      https://pub-xxxx.r2.dev
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
```

### How to create an R2 API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2** → **Manage R2 API Tokens**
2. Click **Create API Token**
3. Set permissions: **Object Read & Write** on your specific bucket
4. Copy the **Access Key ID** and **Secret Access Key** — the secret is shown only once

### Enabling Public Access on Your Bucket

Go to your R2 bucket → **Settings** → **Public Access**, then either:
- Allow the free **R2.dev subdomain** (`https://pub-xxxx.r2.dev`), or
- Connect a **custom domain** you own

## Commands

### `/image add`
Upload a new image to Cloudflare R2.

**Usage:**
```
/image add image:[attach file]
```

**What it does:**
1. Validates the attachment is an image
2. Downloads the image from Discord's CDN into a Buffer
3. Uploads the Buffer to R2 under a unique key (`images/<userId>/<uuid>.<ext>`)
4. Stores metadata (key, public URL, MIME type, file size) in the database
5. Replies with the public R2 URL

**Supported formats:** `jpg`, `jpeg`, `png`, `gif`, `webp`, `svg`, `bmp`, `tiff`, `ico`, `avif`

### `/image list`
List all your uploaded images.

**Usage:**
```
/image list
```

### `/image delete`
Delete an image by its code (the filename/key shown in `/image list`).

**Usage:**
```
/image delete code:[filename]
```

**What it does:**
- Deletes the object from Cloudflare R2
- Removes the database record

## File Structure

```
addons/image/
├── addon.json
├── README.md
├── commands/
│   ├── _command.js       # Slash command group definition
│   ├── add.js            # /image add
│   ├── delete.js         # /image delete
│   └── list.js           # /image list
├── services/
│   └── r2.js             # ← Cloudflare R2 service (upload / delete)
├── database/
│   ├── migrations/
│   └── models/
│       └── Image.js
└── lang/
```

## Database Schema

| Field | Type | Description |
|-------|------|-------------|
| `userId` | STRING | Discord user ID who uploaded |
| `filename` | STRING | R2 object key (e.g. `images/<userId>/<uuid>.png`) |
| `originalName` | STRING | Original Discord filename |
| `fileId` | STRING | Same as `filename` (R2 key) |
| `storageUrl` | TEXT | Public R2 URL |
| `mimetype` | STRING | MIME type (e.g. `image/jpeg`) |
| `fileSize` | INTEGER | File size in bytes |

## Troubleshooting

### ❌ "R2_ACCOUNT_ID is not set"
Set the `R2_ACCOUNT_ID` environment variable to your Cloudflare Account ID.

### ❌ "R2_BUCKET_NAME is not set"
Set the `R2_BUCKET_NAME` environment variable to the name of your bucket.

### ❌ "R2_PUBLIC_URL is not set"
Set the `R2_PUBLIC_URL` to your bucket's public base URL (custom domain or R2.dev URL).

### ❌ Upload fails with 403 / Access Denied
- Confirm the R2 API token has **Object Read & Write** on the correct bucket.
- Double-check `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`.

### ❌ Image URL returns 403 / Access Denied
- Your bucket's public access is not enabled.
- Go to R2 → your bucket → **Settings** → **Public Access** and enable it.

### ❌ Image URL returns the file as a download instead of rendering
- The `ContentType` was not set correctly. This is handled automatically based on file extension in `services/r2.js`.

## Security Best Practices

- ✅ Store credentials in environment variables, never hardcode them
- ✅ Scope your R2 API token to only the specific bucket it needs
- ✅ Use a custom domain with HTTPS for production public URLs
- ✅ Set a maximum file size in your bot's attachment validation if needed

---

**Built with ❤️ by Kythia Labs**
