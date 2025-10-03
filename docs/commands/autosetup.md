## 📁 Command Category: Autosetup

### 💾 `/autosetup`

**Description:** ⚙️ Automatically setup certain features

### 💻 Usage

`/autosetup testimony <newcategory> [category_id]`
`/autosetup server-stats <newcategory> [category_id]`
`/autosetup minecraft <newcategory> [category_id]`
`/autosetup store <newcategory> <type> [category_id]`

### 🔧 Subcommands

**`/autosetup testimony <newcategory> [<category_id>]`**
> Automatically setup testimony & feedback channels

**Options for this subcommand:**
- **`newcategory*`**
  - **Description:** Create a new category or not
  - **Type:** Boolean
- **`category_id`**
  - **Description:** Use an existing category ID (ignore if creating new)
  - **Type:** Text
**`/autosetup server-stats <newcategory> [<category_id>]`**
> Automatically setup server statistics channels

**Options for this subcommand:**
- **`newcategory*`**
  - **Description:** Create a new category or not
  - **Type:** Boolean
- **`category_id`**
  - **Description:** Use an existing category ID (ignore if creating new)
  - **Type:** Text
**`/autosetup minecraft <newcategory> [<category_id>]`**
> Automatically setup Minecraft server statistics channels

**Options for this subcommand:**
- **`newcategory*`**
  - **Description:** Create a new category or not
  - **Type:** Boolean
- **`category_id`**
  - **Description:** Use an existing category ID (ignore if creating new)
  - **Type:** Text
**`/autosetup store <newcategory> <type> [<category_id>]`**
> Automatically setup open/close store channel

**Options for this subcommand:**
- **`newcategory*`**
  - **Description:** Create a new category or not
  - **Type:** Boolean
- **`type*`**
  - **Description:** Store action type (change channel name, send message, or both).
  - **Type:** Text
  - **Choices:** `Change Channel Name` (`channelname`), `Send Embed Message` (`channelmessage`), `Name + Message` (`channelnameandmessage`)
- **`category_id`**
  - **Description:** Use an existing category ID (ignore if creating new)
  - **Type:** Text


