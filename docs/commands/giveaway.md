## 📁 Command Category: Giveaway

### 💾 `/giveaway`

**Description:** 🎉 Create a giveaway event to your members

### 💻 Usage

`/giveaway start <type> <duration> <winners> <prize> [color] [role]`
`/giveaway end <message_id>`
`/giveaway cancel <message_id>`
`/giveaway reroll <message_id>`

### 🔧 Subcommands

**`/giveaway start <type> <duration> <winners> <prize> [<color>] [<role>]`**
> Start a giveaway

**Options for this subcommand:**
- **`type*`**
  - **Description:** Giveaway type
  - **Type:** Text
  - **Choices:** `In Server Money` (`money`), `Other` (`another`)
- **`duration*`**
  - **Description:** Duration (e.g. 1 week 4 days 12 minutes)
  - **Type:** Text
- **`winners*`**
  - **Description:** Number of winners
  - **Type:** Integer
- **`prize*`**
  - **Description:** Prize for the giveaway
  - **Type:** Text
- **`color`**
  - **Description:** Embed color (hex code or color name)
  - **Type:** Text
- **`role`**
  - **Description:** Role required to join
  - **Type:** Role
**`/giveaway end <message_id>`**
> End a giveaway

**Options for this subcommand:**
- **`message_id*`**
  - **Description:** Message ID of the giveaway
  - **Type:** Text
**`/giveaway cancel <message_id>`**
> Cancel a giveaway

**Options for this subcommand:**
- **`message_id*`**
  - **Description:** Message ID of the giveaway
  - **Type:** Text
**`/giveaway reroll <message_id>`**
> Reroll giveaway winners

**Options for this subcommand:**
- **`message_id*`**
  - **Description:** Message ID of the giveaway
  - **Type:** Text


