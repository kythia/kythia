## Command Category: Modmail

### `/modmail`

**Description:** 📬 All commands related to the Modmail system.

### Details

- **User Permissions:** `ManageGuild`
### Usage

`/modmail areply <message>`
`/modmail block <user> [reason]`
`/modmail close [reason]`
`/modmail reply <message>`
`/modmail setup <inbox_channel> [staff_role] [logs_channel] [transcript_channel] [ping_staff] [greeting_message] [closing_message] [greeting_color] [greeting_image] [closing_color] [closing_image]`
`/modmail snippet add <name> <content>`
`/modmail snippet list`
`/modmail snippet remove <name>`
`/modmail snippet use <name>`
`/modmail unblock <user>`

### Subcommands

**`/modmail areply <message>`**
> Reply anonymously — the user will see "Staff" instead of your name.

**Options for this subcommand:**
- **`message*`**
  - **Description:** The anonymous message to send to the user.
  - **Type:** Text
**`/modmail block <user> [<reason>]`**
> Block a user from opening new modmail threads.

**Options for this subcommand:**
- **`user*`**
  - **Description:** The user to block.
  - **Type:** User
- **`reason`**
  - **Description:** Reason for blocking (for staff reference).
  - **Type:** Text
**`/modmail close [<reason>]`**
> Close this modmail thread and generate a transcript.

**Options for this subcommand:**
- **`reason`**
  - **Description:** Reason for closing this modmail (sent to transcript log).
  - **Type:** Text
**`/modmail reply <message>`**
> Reply to the user — your username will be visible.

**Options for this subcommand:**
- **`message*`**
  - **Description:** The message to send to the user.
  - **Type:** Text
**`/modmail setup <inbox_channel> [<staff_role>] [<logs_channel>] [<transcript_channel>] [<ping_staff>] [<greeting_message>] [<closing_message>] [<greeting_color>] [<greeting_image>] [<closing_color>] [<closing_image>]`**
> Configure the modmail system for this server.

**Options for this subcommand:**
- **`inbox_channel*`**
  - **Description:** The channel where modmail threads will be created.
  - **Type:** Channel
- **`staff_role`**
  - **Description:** Role that will be pinged for new modmail tickets.
  - **Type:** Role
- **`logs_channel`**
  - **Description:** Channel to post close/action logs.
  - **Type:** Channel
- **`transcript_channel`**
  - **Description:** Channel where transcripts are saved when a modmail is closed.
  - **Type:** Channel
- **`ping_staff`**
  - **Description:** Whether to ping the staff role when a new modmail opens. (default: true)
  - **Type:** Boolean
- **`greeting_message`**
  - **Description:** DM sent to users when they open a modmail. Leave blank for default.
  - **Type:** Text
- **`closing_message`**
  - **Description:** DM sent to users when their modmail is closed. Leave blank for default.
  - **Type:** Text
- **`greeting_color`**
  - **Description:** Accent color for the opening DM card (hex, e.g. #5865F2). Blank = bot default.
  - **Type:** Text
- **`greeting_image`**
  - **Description:** Banner image URL shown at the top of the opening DM card.
  - **Type:** Text
- **`closing_color`**
  - **Description:** Accent color for the closing DM card (hex, e.g. #FF5555). Blank = bot default.
  - **Type:** Text
- **`closing_image`**
  - **Description:** Banner image URL shown at the top of the closing DM card.
  - **Type:** Text
**`/modmail snippet add <name> <content>`**
> Add a new quick-reply snippet.

**Options for this subcommand:**
- **`name*`**
  - **Description:** Short name/trigger for the snippet (e.g. "hello", "scam").
  - **Type:** Text
- **`content*`**
  - **Description:** The snippet text content.
  - **Type:** Text
**`/modmail snippet list`**
> List all saved quick-reply snippets for this server.


**`/modmail snippet remove <name>`**
> Remove a quick-reply snippet.

**Options for this subcommand:**
- **`name*`**
  - **Description:** Name of the snippet to remove.
  - **Type:** Text
**`/modmail snippet use <name>`**
> Send a snippet as a named reply to the user in this modmail thread.

**Options for this subcommand:**
- **`name*`**
  - **Description:** Name of the snippet to send.
  - **Type:** Text
**`/modmail unblock <user>`**
> Remove a modmail block from a user.

**Options for this subcommand:**
- **`user*`**
  - **Description:** The user to unblock.
  - **Type:** User


