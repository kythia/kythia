## 📁 Command Category: Server

### 💾 `/server`

**Description:** ⚙️ Discord server management tools

### 📋 Details

- **Bot Permissions:** `ManageChannels`, `ManageGuild`, `ManageRoles`
### 💻 Usage

`/server autobuild <template> <reset> [dry_run] [include_voice] [private_staff] [locale]`
`/server backup`
`/server restore <file> [clear]`
`/server reset [clear]`

### 🔧 Subcommands

**`/server autobuild <template> <reset> [<dry_run>] [<include_voice>] [<private_staff>] [<locale>]`**
> automatically build server structure from a JSON template

**Options for this subcommand:**
- **`template*`**
  - **Description:** template key (e.g. store, gaming, saas, company, tech-community)
  - **Type:** Text
- **`reset*`**
  - **Description:** reset server first
  - **Type:** Boolean
- **`dry_run`**
  - **Description:** simulation only
  - **Type:** Boolean
- **`include_voice`**
  - **Description:** include voice category
  - **Type:** Boolean
- **`private_staff`**
  - **Description:** force staff private
  - **Type:** Boolean
- **`locale`**
  - **Description:** id/en
  - **Type:** Text
**`/server backup`**
> Backup server structure to a JSON file


**`/server restore <file> [<clear>]`**
> Restore server structure from a JSON backup file

**Options for this subcommand:**
- **`file*`**
  - **Description:** Server backup file (.json)
  - **Type:** Attachment
- **`clear`**
  - **Description:** Delete all channels & roles first?
  - **Type:** Boolean
**`/server reset [<clear>]`**
> Reset server structure to default

**Options for this subcommand:**
- **`clear`**
  - **Description:** Delete all channels & roles first?
  - **Type:** Boolean


