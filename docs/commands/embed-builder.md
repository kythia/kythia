## Command Category: Embed-builder

### `/embed-builder`

**Description:** Create and manage saved embeds for your server

### Usage

`/embed-builder create <name> [mode]`
`/embed-builder delete <id> [delete_message]`
`/embed-builder edit <id>`
`/embed-builder list`
`/embed-builder send <id> [channel] [allowed_mentions]`

### Subcommands

**`/embed-builder create <name> [<mode>]`**
> Create a new saved embed

**Options for this subcommand:**
- **`name*`**
  - **Description:** A label to identify this embed (e.g. "welcome-message")
  - **Type:** Text
- **`mode`**
  - **Description:** Builder type (default: embed)
  - **Type:** Text
  - **Choices:** `📋 Classic Embed` (`embed`), `🧩 Components V2` (`components_v2`)
**`/embed-builder delete <id> [<delete_message>]`**
> Delete a saved embed

**Options for this subcommand:**
- **`id*`**
  - **Description:** The embed to delete
  - **Type:** Text
- **`delete_message`**
  - **Description:** Also delete the Discord message if the embed was sent (default: false)
  - **Type:** Boolean
**`/embed-builder edit <id>`**
> Edit a saved embed

**Options for this subcommand:**
- **`id*`**
  - **Description:** The embed to edit
  - **Type:** Text
**`/embed-builder list`**
> List all saved embeds for this server


**`/embed-builder send <id> [<channel>] [<allowed_mentions>]`**
> Send a saved embed to a channel

**Options for this subcommand:**
- **`id*`**
  - **Description:** The embed to send
  - **Type:** Text
- **`channel`**
  - **Description:** Target channel (defaults to current channel)
  - **Type:** Channel
- **`allowed_mentions`**
  - **Description:** Who can be mentioned in the embed (default: everyone)
  - **Type:** Text
  - **Choices:** `🌐 Everyone (@everyone, @here, roles & users)` (`everyone`), `👥 Roles only` (`roles`), `👤 Users only` (`users`), `🔕 No mentions` (`none`)


