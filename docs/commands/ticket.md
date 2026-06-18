## Command Category: Ticket

### `/ticket`

**Description:** All commands related to kythia ticket system.

### Details

- **User Permissions:** `ManageGuild`
### Usage

`/ticket add <user>`
`/ticket close`
`/ticket panel create`
`/ticket panel delete <panel_id>`
`/ticket panel reload <message_id>`
`/ticket remove <user>`
`/ticket transcript`
`/ticket type create`
`/ticket type delete <type_id>`

### Subcommands

**`/ticket add <user>`**
> Add a user to the ticket channel

**Options for this subcommand:**
- **`user*`**
  - **Description:** User to add
  - **Type:** User
**`/ticket close`**
> Close the ticket and delete the ticket channel.


**`/ticket panel create`**
> Creates a new ticket panel (interactive setup)


**`/ticket panel delete <panel_id>`**
> Deletes a ticket panel and all its types.

**Options for this subcommand:**
- **`panel_id*`**
  - **Description:** Select the panel to delete.
  - **Type:** Text
**`/ticket panel reload <message_id>`**
> Refreshes a ticket panel (updates buttons & menus).

**Options for this subcommand:**
- **`message_id*`**
  - **Description:** Select the panel to refresh.
  - **Type:** Text
**`/ticket remove <user>`**
> Remove a user from the ticket channel

**Options for this subcommand:**
- **`user*`**
  - **Description:** User to remove
  - **Type:** User
**`/ticket transcript`**
> Get the transcript of the ticket.


**`/ticket type create`**
> Creates a new ticket type (interactive setup)


**`/ticket type delete <type_id>`**
> Deletes a ticket type.

**Options for this subcommand:**
- **`type_id*`**
  - **Description:** Select the ticket type to delete.
  - **Type:** Text


