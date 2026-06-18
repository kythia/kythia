## Command Category: Autoreply

### `/autoreply`

**Description:** Manage custom auto-replies for your server.

### Usage

`/autoreply add <trigger> [response] [media] [use_container]`
`/autoreply list`
`/autoreply remove <trigger>`

### Subcommands

**`/autoreply add <trigger> [<response>] [<media>] [<use_container>]`**
> Add a new auto-reply.

**Options for this subcommand:**
- **`trigger*`**
  - **Description:** The text that triggers the auto-reply.
  - **Type:** Text
- **`response`**
  - **Description:** The response text.
  - **Type:** Text
- **`media`**
  - **Description:** An image to attach to the response.
  - **Type:** Attachment
- **`use_container`**
  - **Description:** Use Advanced Components V2 Container style?
  - **Type:** Boolean
**`/autoreply list`**
> List all auto-replies in this server.


**`/autoreply remove <trigger>`**
> Remove an auto-reply.

**Options for this subcommand:**
- **`trigger*`**
  - **Description:** The trigger content to remove.
  - **Type:** Text


