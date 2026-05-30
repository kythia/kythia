## Command Category: Booster

### `/booster`

**Description:** 🚀 Configure the server booster system

### Details

- **User Permissions:** `ManageGuild`
### Usage

`/booster background <url>`
`/booster channel <channel>`
`/booster style <style>`
`/booster test [user]`
`/booster text <text>`

### Subcommands

**`/booster background <url>`**
> 🚀 Set booster banner background URL

**Options for this subcommand:**
- **`url*`**
  - **Description:** Direct URL to the background image (must start with http)
  - **Type:** Text
**`/booster channel <channel>`**
> 🚀 Set the booster channel

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Channel where booster messages are sent
  - **Type:** Channel
**`/booster style <style>`**
> 🚀 Set booster message style (banner card or plain text)

**Options for this subcommand:**
- **`style*`**
  - **Description:** Choose the message style
  - **Type:** Text
  - **Choices:** `🖼️ Components V2 card (default)` (`components-v2`), `💬 Plain text only` (`plain-text`)
**`/booster test [<user>]`**
> 👋 Test the booster message

**Options for this subcommand:**
- **`user`**
  - **Description:** User to test with (defaults to you)
  - **Type:** User
**`/booster text <text>`**
> 🚀 Set booster message text (supports placeholders)

**Options for this subcommand:**
- **`text*`**
  - **Description:** Booster text. Placeholders: {username}, {guildName}, {boosts}, {boostLevel}, etc.
  - **Type:** Text


