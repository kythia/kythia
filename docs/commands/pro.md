## Command Category: Pro

### `/pro`

**Description:** 🌸 All commands related to the Kythia Pro users.

### Usage

`/pro claim subdomain <name>`
`/pro dns delete <record>`
`/pro dns help`
`/pro dns list <subdomain>`
`/pro dns set <subdomain> <type> <name> <value> [priority]`

### Subcommands

**`/pro claim subdomain <name>`**
> 🌐 Claim a new .kyth.me subdomain (Max 5).

**Options for this subcommand:**
- **`name*`**
  - **Description:** Unique subdomain name (e.g.: kythia-cool)
  - **Type:** Text
**`/pro dns delete <record>`**
> 🌐 Delete a DNS record from your subdomain.

**Options for this subcommand:**
- **`record*`**
  - **Description:** Select the record you want to delete
  - **Type:** Text
**`/pro dns help`**
> 📖 Information and examples about each DNS record type.


**`/pro dns list <subdomain>`**
> 🌐 Show all DNS records for one of your subdomains.

**Options for this subcommand:**
- **`subdomain*`**
  - **Description:** The subdomain name you want to view (e.g. my-project)
  - **Type:** Text
**`/pro dns set <subdomain> <type> <name> <value> [<priority>]`**
> 🌐 Create or update a DNS record.

**Options for this subcommand:**
- **`subdomain*`**
  - **Description:** The subdomain you want to manage (e.g. amazing-project)
  - **Type:** Text
- **`type*`**
  - **Description:** Record type (A, CNAME, TXT, MX)
  - **Type:** Text
  - **Choices:** `A (IP Address)` (`A`), `CNAME (Alias to another domain)` (`CNAME`), `TXT (Verification, etc)` (`TXT`), `MX (Mail Server)` (`MX`)
- **`name*`**
  - **Description:** Host name. Type "@" for root (e.g. amazing-project.kyth.me)
  - **Type:** Text
- **`value*`**
  - **Description:** The value/content of the record (IP, domain, text)
  - **Type:** Text
- **`priority`**
  - **Description:** For MX only. (Default: 10).
  - **Type:** Integer


