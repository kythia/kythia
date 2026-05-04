## Command Category: Verification

### `/verify`

**Description:** 🛡️ Verification system management

### Usage

`/verify force <member>`
`/verify panel button <label>`
`/verify panel color <hex>`
`/verify panel send`
`/verify panel text <title> <description>`
`/verify reset <member>`
`/verify revoke <member>`
`/verify setup attempts <count>`
`/verify setup channel [channel]`
`/verify setup kick-on-fail <enabled>`
`/verify setup kick-on-timeout <enabled>`
`/verify setup log-channel <channel>`
`/verify setup role <role>`
`/verify setup timeout <seconds>`
`/verify setup type <type>`
`/verify setup unverified-role <role>`
`/verify setup welcome-message <message>`
`/verify status`

### Subcommands

**`/verify force <member>`**
> Manually verify a member (skip captcha)

**Options for this subcommand:**
- **`member*`**
  - **Description:** Target member
  - **Type:** User
**`/verify panel button <label>`**
> Set the text on the verification panel button

**Options for this subcommand:**
- **`label*`**
  - **Description:** Button text (e.g. Verify Me)
  - **Type:** Text
**`/verify panel color <hex>`**
> Set the color of the verification panel

**Options for this subcommand:**
- **`hex*`**
  - **Description:** HEX color code (e.g. #ff0000)
  - **Type:** Text
**`/verify panel send`**
> Send the interactive verification panel to the configured channel


**`/verify panel text <title> <description>`**
> Set the title and description for the verification panel

**Options for this subcommand:**
- **`title*`**
  - **Description:** Panel title
  - **Type:** Text
- **`description*`**
  - **Description:** Panel description
  - **Type:** Text
**`/verify reset <member>`**
> Re-send captcha to a member

**Options for this subcommand:**
- **`member*`**
  - **Description:** Target member
  - **Type:** User
**`/verify revoke <member>`**
> Remove verified role from a member

**Options for this subcommand:**
- **`member*`**
  - **Description:** Target member
  - **Type:** User
**`/verify setup attempts <count>`**
> Max wrong attempts before failing

**Options for this subcommand:**
- **`count*`**
  - **Description:** Max attempts (1-10)
  - **Type:** Integer
**`/verify setup channel [<channel>]`**
> Channel where captcha is sent (leave blank for DM only)

**Options for this subcommand:**
- **`channel`**
  - **Description:** Verification channel
  - **Type:** Channel
**`/verify setup kick-on-fail <enabled>`**
> Kick member if they exceed max attempts

**Options for this subcommand:**
- **`enabled*`**
  - **Description:** Enable?
  - **Type:** Boolean
**`/verify setup kick-on-timeout <enabled>`**
> Kick member if they time out

**Options for this subcommand:**
- **`enabled*`**
  - **Description:** Enable?
  - **Type:** Boolean
**`/verify setup log-channel <channel>`**
> Channel to log verification events

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Log channel
  - **Type:** Channel
**`/verify setup role <role>`**
> Set the role given to verified members

**Options for this subcommand:**
- **`role*`**
  - **Description:** Verified role
  - **Type:** Role
**`/verify setup timeout <seconds>`**
> How long members have to complete the captcha (seconds)

**Options for this subcommand:**
- **`seconds*`**
  - **Description:** Timeout in seconds (30-600)
  - **Type:** Integer
**`/verify setup type <type>`**
> Captcha challenge type

**Options for this subcommand:**
- **`type*`**
  - **Description:** Type of captcha
  - **Type:** Text
  - **Choices:** `Math (multiple choice buttons)` (`math`), `Emoji click (buttons)` (`emoji`), `Image text (type the code)` (`image`)
**`/verify setup unverified-role <role>`**
> Role assigned on join (restricts unverified members)

**Options for this subcommand:**
- **`role*`**
  - **Description:** Unverified role
  - **Type:** Role
**`/verify setup welcome-message <message>`**
> DM sent to members after they verify

**Options for this subcommand:**
- **`message*`**
  - **Description:** Welcome message text (or "none" to disable)
  - **Type:** Text
**`/verify status`**
> View current verification config




