## 📁 Command Category: Ticket

### 💾 `/ticket`

**Description:** 🎟️ Manage ticket system in your discord server

### 💻 Usage

`/ticket setup <channel> <staff-role> <logs> <transcript> <title> <description> <name> <format> [button] [buttoncolor] [image] [thumbnail] [footer-text] [footer-icon] [ticket-category] [ticket-description] [ticket-image] [ticket-thumbnail] [ticket-footer-text] [ticket-footer-icon]`
`/ticket remove <user>`
`/ticket add <user>`
`/ticket close`
`/ticket transcript`

### 🔧 Subcommands

**`/ticket setup <channel> <staff-role> <logs> <transcript> <title> <description> <name> <format> [<button>] [<buttoncolor>] [<image>] [<thumbnail>] [<footer-text>] [<footer-icon>] [<ticket-category>] [<ticket-description>] [<ticket-image>] [<ticket-thumbnail>] [<ticket-footer-text>] [<ticket-footer-icon>]`**
> Setup the ticket system

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Channel for ticket creation
  - **Type:** Channel
- **`staff-role*`**
  - **Description:** Role for staff
  - **Type:** Role
- **`logs*`**
  - **Description:** Log channel for tickets
  - **Type:** Channel
- **`transcript*`**
  - **Description:** Channel for transcripts
  - **Type:** Channel
- **`title*`**
  - **Description:** Title for the ticket message
  - **Type:** Text
- **`description*`**
  - **Description:** Description for the ticket message
  - **Type:** Text
- **`name*`**
  - **Description:** Name for the ticket
  - **Type:** Text
- **`format*`**
  - **Description:** Format for the ticket (e.g. {username}-support)[{username}, {guildname}, {date}, {timestamp}]
  - **Type:** Text
- **`button`**
  - **Description:** Button name for the ticket message (e.g. Create Ticket, Support, etc)
  - **Type:** Text
- **`buttoncolor`**
  - **Description:** Button color for the ticket message (e.g. Primary, Secondary, Success, Danger, Link)
  - **Type:** Text
  - **Choices:** `Primary` (`Primary`), `Secondary` (`Secondary`), `Success` (`Success`), `Danger` (`Danger`), `Link` (`Link`)
- **`image`**
  - **Description:** Image for the ticket message (if not set, will use bot avatar)
  - **Type:** Text
- **`thumbnail`**
  - **Description:** Thumbnail for the ticket message (if not set, will use bot avatar)
  - **Type:** Text
- **`footer-text`**
  - **Description:** Text for the footer
  - **Type:** Text
- **`footer-icon`**
  - **Description:** Icon for the footer
  - **Type:** Text
- **`ticket-category`**
  - **Description:** Create ticket channel in the specified category
  - **Type:** Text
- **`ticket-description`**
  - **Description:** Description for the ticket message
  - **Type:** Text
- **`ticket-image`**
  - **Description:** Image for the ticket message
  - **Type:** Text
- **`ticket-thumbnail`**
  - **Description:** Thumbnail for the ticket message
  - **Type:** Text
- **`ticket-footer-text`**
  - **Description:** Text for the footer
  - **Type:** Text
- **`ticket-footer-icon`**
  - **Description:** Icon for the footer
  - **Type:** Text
**`/ticket remove <user>`**
> Remove a user from the ticket channel

**Options for this subcommand:**
- **`user*`**
  - **Description:** User to remove
  - **Type:** User
**`/ticket add <user>`**
> Add a user to the ticket channel

**Options for this subcommand:**
- **`user*`**
  - **Description:** User to add
  - **Type:** User
**`/ticket close`**
> Close the ticket and delete the ticket channel.


**`/ticket transcript`**
> Get the transcript of the ticket.




