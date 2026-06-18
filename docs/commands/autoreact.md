## Command Category: Autoreact

### `/autoreact`

**Description:** Manage automatic reactions for the server.

### Usage

`/autoreact add <emoji> [trigger] [channel]`
`/autoreact list`
`/autoreact remove <trigger>`

### Subcommands

**`/autoreact add <emoji> [<trigger>] [<channel>]`**
> Add a new auto-reaction.

**Options for this subcommand:**
- **`emoji*`**
  - **Description:** The emoji to react with.
  - **Type:** Text
- **`trigger`**
  - **Description:** The text to trigger the reaction (Text Mode).
  - **Type:** Text
- **`channel`**
  - **Description:** The channel to watch (Channel Mode).
  - **Type:** Channel
**`/autoreact list`**
> List all auto-reactions in this server.


**`/autoreact remove <trigger>`**
> Remove an auto-reaction.

**Options for this subcommand:**
- **`trigger*`**
  - **Description:** The trigger to remove
  - **Type:** Text


