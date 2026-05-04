## Command Category: Reaction-role

### `/reaction-role`

**Description:** 🎭 Manage reaction roles for your server.

### Usage

`/reaction-role add <message_id> <emoji> <role> [channel]`
`/reaction-role edit <message_id> <emoji> [new_role] [new_emoji] [channel]`
`/reaction-role list`
`/reaction-role panel create`
`/reaction-role panel delete <panel_id>`
`/reaction-role panel list`
`/reaction-role remove <message_id> <emoji> [channel]`

### Subcommands

**`/reaction-role add <message_id> <emoji> <role> [<channel>]`**
> ➕ Add a reaction role to a message.

**Options for this subcommand:**
- **`message_id*`**
  - **Description:** The ID of the message.
  - **Type:** Text
- **`emoji*`**
  - **Description:** The emoji to react with.
  - **Type:** Text
- **`role*`**
  - **Description:** The role to assign.
  - **Type:** Role
- **`channel`**
  - **Description:** The channel where the message is (defaults to current).
  - **Type:** Channel
**`/reaction-role edit <message_id> <emoji> [<new_role>] [<new_emoji>] [<channel>]`**
> ✏️ Edit an existing reaction role on a message.

**Options for this subcommand:**
- **`message_id*`**
  - **Description:** The ID of the message with the reaction role.
  - **Type:** Text
- **`emoji*`**
  - **Description:** The current emoji of the reaction role to edit.
  - **Type:** Text
- **`new_role`**
  - **Description:** The new role to assign for this reaction.
  - **Type:** Role
- **`new_emoji`**
  - **Description:** The new emoji to replace the current one.
  - **Type:** Text
- **`channel`**
  - **Description:** The channel where the message is (defaults to current).
  - **Type:** Channel
**`/reaction-role list`**
> 📜 List all reaction roles in this server.


**`/reaction-role panel create`**
> ➕ Create a new reaction role panel (interactive setup).


**`/reaction-role panel delete <panel_id>`**
> 🗑️ Delete a reaction role panel and all its bindings.

**Options for this subcommand:**
- **`panel_id*`**
  - **Description:** The ID of the panel to delete (from /rr panel list).
  - **Type:** Integer
**`/reaction-role panel list`**
> 📜 List all reaction role panels in this server.


**`/reaction-role remove <message_id> <emoji> [<channel>]`**
> ➖ Remove a reaction role from a message.

**Options for this subcommand:**
- **`message_id*`**
  - **Description:** The ID of the message.
  - **Type:** Text
- **`emoji*`**
  - **Description:** The emoji to remove.
  - **Type:** Text
- **`channel`**
  - **Description:** The channel where the message is (defaults to current).
  - **Type:** Channel


