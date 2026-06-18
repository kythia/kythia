## Command Category: Birthday

### `/birthday`

**Description:** Manage your birthday settings.

### Usage

`/birthday check [user]`
`/birthday list`
`/birthday remove`
`/birthday set <day> <month> [year]`
`/birthday setting edit [channel] [role] [ping_role] [show_age] [message] [color] [image]`
`/birthday setting view`

### Subcommands

**`/birthday check [<user>]`**
> Check your or another user's birthday.

**Options for this subcommand:**
- **`user`**
  - **Description:** The user to check (defaults to yourself).
  - **Type:** User
**`/birthday list`**
> See a list of upcoming birthdays.


**`/birthday remove`**
> Remove your birthday information.


**`/birthday set <day> <month> [<year>]`**
> Set your birthday.

**Options for this subcommand:**
- **`day*`**
  - **Description:** The day of your birthday (1-31).
  - **Type:** Integer
- **`month*`**
  - **Description:** The month of your birthday (1-12).
  - **Type:** Integer
- **`year`**
  - **Description:** The year of your birth (Optional - for age display).
  - **Type:** Integer
**`/birthday setting edit [<channel>] [<role>] [<ping_role>] [<show_age>] [<message>] [<color>] [<image>]`**
> Edit birthday settings.
> _User Permissions: `ManageGuild`_

**Options for this subcommand:**
- **`channel`**
  - **Description:** Channel for announcements.
  - **Type:** Channel
- **`role`**
  - **Description:** Role to give to the birthday user.
  - **Type:** Role
- **`ping_role`**
  - **Description:** Role to ping in the announcement.
  - **Type:** Role
- **`show_age`**
  - **Description:** Show age in announcements/list?
  - **Type:** Boolean
- **`message`**
  - **Description:** Custom message (Variables: {user}, {age}, {zodiac}).
  - **Type:** Text
- **`color`**
  - **Description:** Embed Hex Color (e.g. #FF00FF).
  - **Type:** Text
- **`image`**
  - **Description:** Background/Banner Image URL.
  - **Type:** Text
**`/birthday setting view`**
> View current birthday settings.
> _User Permissions: `ManageGuild`_




