## Command Category: Welcomer

### `/welcomer`

**Description:** 👋 Configure the welcome & farewell system

### Details

- **User Permissions:** `ManageGuild`
### Usage

`/welcomer dm-text <text>`
`/welcomer in-background <url>`
`/welcomer in-channel <channel>`
`/welcomer in-style <style>`
`/welcomer in-text <text>`
`/welcomer out-background <url>`
`/welcomer out-channel <channel>`
`/welcomer out-style <style>`
`/welcomer out-text <text>`
`/welcomer role <role>`
`/welcomer test <type> [user]`

### Subcommands

**`/welcomer dm-text <text>`**
> ✉️ Set DM message sent to new members on join

**Options for this subcommand:**
- **`text*`**
  - **Description:** DM text. Supports placeholders like {username}, {guildName}.
  - **Type:** Text
**`/welcomer in-background <url>`**
> 👋 Set welcome banner background URL

**Options for this subcommand:**
- **`url*`**
  - **Description:** Direct URL to the background image (must start with http)
  - **Type:** Text
**`/welcomer in-channel <channel>`**
> 👋 Set the welcome channel

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Channel where welcome messages are sent
  - **Type:** Channel
**`/welcomer in-style <style>`**
> 👋 Set welcome message style (banner card or plain text)

**Options for this subcommand:**
- **`style*`**
  - **Description:** Choose the message style
  - **Type:** Text
  - **Choices:** `🖼️ Components V2 card (default)` (`components-v2`), `💬 Plain text only` (`plain-text`)
**`/welcomer in-text <text>`**
> 👋 Set welcome message text (supports placeholders)

**Options for this subcommand:**
- **`text*`**
  - **Description:** Welcome text. Placeholders: {username}, {guildName}, {memberCount}, etc.
  - **Type:** Text
**`/welcomer out-background <url>`**
> 👋 Set farewell banner background URL

**Options for this subcommand:**
- **`url*`**
  - **Description:** Direct URL to the background image (must start with http)
  - **Type:** Text
**`/welcomer out-channel <channel>`**
> 👋 Set the farewell channel

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Channel where farewell messages are sent
  - **Type:** Channel
**`/welcomer out-style <style>`**
> 👋 Set farewell message style (banner card or plain text)

**Options for this subcommand:**
- **`style*`**
  - **Description:** Choose the message style
  - **Type:** Text
  - **Choices:** `🖼️ Components V2 card (default)` (`components-v2`), `💬 Plain text only` (`plain-text`)
**`/welcomer out-text <text>`**
> 👋 Set farewell message text (supports placeholders)

**Options for this subcommand:**
- **`text*`**
  - **Description:** Farewell text. Placeholders: {username}, {guildName}, etc.
  - **Type:** Text
**`/welcomer role <role>`**
> 👋 Set auto-role given to new members on join

**Options for this subcommand:**
- **`role*`**
  - **Description:** Role to assign on join
  - **Type:** Role
**`/welcomer test <type> [<user>]`**
> 👋 Test the welcome or farewell messages

**Options for this subcommand:**
- **`type*`**
  - **Description:** Which event to test
  - **Type:** Text
  - **Choices:** `Welcome` (`in`), `Farewell` (`out`)
- **`user`**
  - **Description:** User to test with (defaults to you)
  - **Type:** User


