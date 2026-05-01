## 📁 Command Category: Server-stats

### 💾 `/server-stats`

**Description:** 📈 Server statistics settings

### 💻 Usage

`/server-stats add <format> [channel]`
`/server-stats category <category>`
`/server-stats disable <stats>`
`/server-stats edit <stats> [channel] [format]`
`/server-stats enable <stats>`
`/server-stats remove <stats>`

### 🔧 Subcommands

**`/server-stats add <format> [<channel>]`**
> 📈 Add a new stat for a specific channel

**Options for this subcommand:**
- **`format*`**
  - **Description:** Stat format, e.g.: {memberstotal}
  - **Type:** Text
- **`channel`**
  - **Description:** 📈 Select a channel to use as stat (if not selected, the bot will create a new channel)
  - **Type:** Channel
**`/server-stats category <category>`**
> 📈 Set category for server stats channels

**Options for this subcommand:**
- **`category*`**
  - **Description:** Category channel
  - **Type:** Channel
**`/server-stats disable <stats>`**
> 📈 Disable stat channel

**Options for this subcommand:**
- **`stats*`**
  - **Description:** Select the stat to disable
  - **Type:** Text
**`/server-stats edit <stats> [<channel>] [<format>]`**
> 📈 Edit the format of an existing stat channel

**Options for this subcommand:**
- **`stats*`**
  - **Description:** Select the stat to edit
  - **Type:** Text
- **`channel`**
  - **Description:** 📈 Edit stat channel
  - **Type:** Channel
- **`format`**
  - **Description:** 📈 Edit stat format, e.g.: {membersonline}
  - **Type:** Text
**`/server-stats enable <stats>`**
> 📈 Enable stat channel

**Options for this subcommand:**
- **`stats*`**
  - **Description:** Select the stat to enable
  - **Type:** Text
**`/server-stats remove <stats>`**
> 📈 Delete the stat and its channel

**Options for this subcommand:**
- **`stats*`**
  - **Description:** Select the stat to delete
  - **Type:** Text


