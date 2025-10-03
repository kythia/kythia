## 📁 Command Category: Embed

### 💾 `/embed`

**Description:** 💬 Make various embeds with buttons and fields.

### 💻 Usage

`/embed create <channel> [title] [description] [buttons] [fields] [image] [color] [footer]`
`/embed delete <message_id>`
`/embed role create <title> <description> <channel> <buttons> [color]`

### 🔧 Subcommands

**`/embed create <channel> [<title>] [<description>] [<buttons>] [<fields>] [<image>] [<color>] [<footer>]`**
> Make an embed with buttons and fields.

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Target channel for the embed
  - **Type:** Channel
- **`title`**
  - **Description:** Embed title
  - **Type:** Text
- **`description`**
  - **Description:** Embed description
  - **Type:** Text
- **`buttons`**
  - **Description:** Buttons (Format: Text|LINK|Style(Primary, Secondary, Success, Danger), separated by ~~)
  - **Type:** Text
- **`fields`**
  - **Description:** Fields (Format: Title|Value, separated by ~~)
  - **Type:** Text
- **`image`**
  - **Description:** Image
  - **Type:** Attachment
- **`color`**
  - **Description:** Embed color (hex code or color name)
  - **Type:** Text
- **`footer`**
  - **Description:** Footer text
  - **Type:** Text
**`/embed delete <message_id>`**
> Delete embed react role

**Options for this subcommand:**
- **`message_id*`**
  - **Description:** ID pesan embed react role yang ingin dihapus
  - **Type:** Text
**`/embed role create <title> <description> <channel> <buttons> [<color>]`**
> Create an embed with role buttons

**Options for this subcommand:**
- **`title*`**
  - **Description:** Embed title
  - **Type:** Text
- **`description*`**
  - **Description:** Embed description
  - **Type:** Text
- **`channel*`**
  - **Description:** Target channel for the embed
  - **Type:** Channel
- **`buttons*`**
  - **Description:** Buttons (Format: Label|RoleID|Style(Primary, Secondary, Success, Danger), separated by ~~)
  - **Type:** Text
- **`color`**
  - **Description:** Embed color (hex code or color name)
  - **Type:** Text


