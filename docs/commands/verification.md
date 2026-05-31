## Command Category: Verification

### `/verification`

**Description:** 🛡️ Verification system management

### Usage

`/verification force <member>`
`/verification panel button <label>`
`/verification panel color <hex>`
`/verification panel send`
`/verification panel text <title> <description>`
`/verification reset <member>`
`/verification revoke <member>`
`/verification setup attempts <count>`
`/verification setup channel [channel]`
`/verification setup kick-on-fail <enabled>`
`/verification setup kick-on-timeout <enabled>`
`/verification setup log-channel <channel>`
`/verification setup role <role>`
`/verification setup timeout <seconds>`
`/verification setup type <type>`
`/verification setup unverified-role <role>`
`/verification setup welcome-message <message>`
`/verification status`

### Subcommands

**`/verification force <member>`**
> Manually verify a member (skip captcha)

**Options for this subcommand:**
- **`member*`**
  - **Description:** Target member
  - **Type:** User
**`/verification panel button <label>`**
> Set the text on the verification panel button

**Options for this subcommand:**
- **`label*`**
  - **Description:** Button text (e.g. Verify Me)
  - **Type:** Text
**`/verification panel color <hex>`**
> Set the color of the verification panel

**Options for this subcommand:**
- **`hex*`**
  - **Description:** HEX color code (e.g. #ff0000)
  - **Type:** Text
**`/verification panel send`**
> Send the interactive verification panel to the configured channel


**`/verification panel text <title> <description>`**
> Set the title and description for the verification panel

**Options for this subcommand:**
- **`title*`**
  - **Description:** Panel title
  - **Type:** Text
- **`description*`**
  - **Description:** Panel description
  - **Type:** Text
**`/verification reset <member>`**
> Re-send captcha to a member

**Options for this subcommand:**
- **`member*`**
  - **Description:** Target member
  - **Type:** User
**`/verification revoke <member>`**
> Remove verified role from a member

**Options for this subcommand:**
- **`member*`**
  - **Description:** Target member
  - **Type:** User
**`/verification setup attempts <count>`**
> Max wrong attempts before failing

**Options for this subcommand:**
- **`count*`**
  - **Description:** Max attempts (1-10)
  - **Type:** Integer
**`/verification setup channel [<channel>]`**
> Channel where captcha is sent (leave blank for DM only)

**Options for this subcommand:**
- **`channel`**
  - **Description:** Verification channel
  - **Type:** Channel
**`/verification setup kick-on-fail <enabled>`**
> Kick member if they exceed max attempts

**Options for this subcommand:**
- **`enabled*`**
  - **Description:** Enable?
  - **Type:** Boolean
**`/verification setup kick-on-timeout <enabled>`**
> Kick member if they time out

**Options for this subcommand:**
- **`enabled*`**
  - **Description:** Enable?
  - **Type:** Boolean
**`/verification setup log-channel <channel>`**
> Channel to log verification events

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Log channel
  - **Type:** Channel
**`/verification setup role <role>`**
> Set the role given to verified members

**Options for this subcommand:**
- **`role*`**
  - **Description:** Verified role
  - **Type:** Role
**`/verification setup timeout <seconds>`**
> How long members have to complete the captcha (seconds)

**Options for this subcommand:**
- **`seconds*`**
  - **Description:** Timeout in seconds (30-600)
  - **Type:** Integer
**`/verification setup type <type>`**
> Captcha challenge type

**Options for this subcommand:**
- **`type*`**
  - **Description:** Type of captcha
  - **Type:** Text
  - **Choices:** `Math (multiple choice buttons)` (`math`), `Emoji click (buttons)` (`emoji`), `Image text (type the code)` (`image`)
**`/verification setup unverified-role <role>`**
> Role assigned on join (restricts unverified members)

**Options for this subcommand:**
- **`role*`**
  - **Description:** Unverified role
  - **Type:** Role
**`/verification setup welcome-message <message>`**
> DM sent to members after they verify

**Options for this subcommand:**
- **`message*`**
  - **Description:** Welcome message text (or "none" to disable)
  - **Type:** Text
**`/verification status`**
> View current verification config




