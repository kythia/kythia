## Command Category: Automod

### `/mod`

**Description:** Moderation action

### Usage

`/mod announce <message> [title]`
`/mod autosetup`
`/mod ban <user> [reason]`
`/mod clear <amount>`
`/mod kick <user> [reason]`
`/mod lock [reason]`
`/mod mute <user> [reason]`
`/mod pin <message_id>`
`/mod role <user> <role>`
`/mod say <message>`
`/mod slowmode <seconds> [reason]`
`/mod snipe [index]`
`/mod timeout <user> <duration> [reason]`
`/mod unban <user_id>`
`/mod unlock [reason]`
`/mod unmute <user>`
`/mod unpin <message_id>`
`/mod warn <user> [reason]`
`/mod warnings <user>`

### Subcommands

**`/mod announce <message> [<title>]`**
> 📢 Sends an announcement to the current channel.

**Options for this subcommand:**
- **`message*`**
  - **Description:** The message to announce
  - **Type:** Text
- **`title`**
  - **Description:** Title for the announcement
  - **Type:** Text
**`/mod autosetup`**
> 🤖 Automatically setup moderation channels and roles.


**`/mod ban <user> [<reason>]`**
> 🔨 Bans a user from the server.

**Options for this subcommand:**
- **`user*`**
  - **Description:** The user to ban
  - **Type:** User
- **`reason`**
  - **Description:** Reason for the ban
  - **Type:** Text
**`/mod clear <amount>`**
> 🗑️ Delete messages from a channel.

**Options for this subcommand:**
- **`amount*`**
  - **Description:** Amount of messages to delete (0 = all)
  - **Type:** Integer
**`/mod kick <user> [<reason>]`**
> 👢 Kicks a user from the server.

**Options for this subcommand:**
- **`user*`**
  - **Description:** The user to kick
  - **Type:** User
- **`reason`**
  - **Description:** Reason for the kick
  - **Type:** Text
**`/mod lock [<reason>]`**
> 🔒 Locks the current channel.

**Options for this subcommand:**
- **`reason`**
  - **Description:** Reason for locking the channel
  - **Type:** Text
**`/mod mute <user> [<reason>]`**
> 🔇 Mutes a user in voice channels.

**Options for this subcommand:**
- **`user*`**
  - **Description:** The user to mute
  - **Type:** User
- **`reason`**
  - **Description:** Reason for the mute
  - **Type:** Text
**`/mod pin <message_id>`**
> 📌 Pins a message in the channel.

**Options for this subcommand:**
- **`message_id*`**
  - **Description:** The ID of the message to pin
  - **Type:** Text
**`/mod role <user> <role>`**
> 🎭 Manage roles for a user.

**Options for this subcommand:**
- **`user*`**
  - **Description:** The user to modify roles for
  - **Type:** User
- **`role*`**
  - **Description:** The role to add or remove
  - **Type:** Role
**`/mod say <message>`**
> 🗣️ Makes the bot say something.

**Options for this subcommand:**
- **`message*`**
  - **Description:** The message to say
  - **Type:** Text
**`/mod slowmode <seconds> [<reason>]`**
> 🐢 Sets the slowmode for the current channel.

**Options for this subcommand:**
- **`seconds*`**
  - **Description:** Slowmode duration in seconds (0 to disable)
  - **Type:** Integer
- **`reason`**
  - **Description:** Reason for changing slowmode
  - **Type:** Text
**`/mod snipe [<index>]`**
> 👀 Snipe deleted messages in this channel.

**Options for this subcommand:**
- **`index`**
  - **Description:** The index of the deleted message to snipe (1 = most recent)
  - **Type:** Integer
**`/mod timeout <user> <duration> [<reason>]`**
> ⏳ Timeouts a user.

**Options for this subcommand:**
- **`user*`**
  - **Description:** The user to timeout
  - **Type:** User
- **`duration*`**
  - **Description:** Duration in minutes
  - **Type:** Integer
- **`reason`**
  - **Description:** Reason for the timeout
  - **Type:** Text
**`/mod unban <user_id>`**
> 🔓 Unbans a user from the server.

**Options for this subcommand:**
- **`user_id*`**
  - **Description:** The ID of the user to unban
  - **Type:** Text
**`/mod unlock [<reason>]`**
> 🔓 Unlocks the current channel.

**Options for this subcommand:**
- **`reason`**
  - **Description:** Reason for unlocking the channel
  - **Type:** Text
**`/mod unmute <user>`**
> 🔊 Unmutes a user in voice channels.

**Options for this subcommand:**
- **`user*`**
  - **Description:** The user to unmute
  - **Type:** User
**`/mod unpin <message_id>`**
> 📌 Unpins a message from the channel.

**Options for this subcommand:**
- **`message_id*`**
  - **Description:** The ID of the message to unpin
  - **Type:** Text
**`/mod warn <user> [<reason>]`**
> ⚠️ Warns a user.

**Options for this subcommand:**
- **`user*`**
  - **Description:** The user to warn
  - **Type:** User
- **`reason`**
  - **Description:** Reason for the warning
  - **Type:** Text
**`/mod warnings <user>`**
> ⚠️ View warnings for a user.

**Options for this subcommand:**
- **`user*`**
  - **Description:** The user to view warnings for
  - **Type:** User


### `/automod`

**Description:** 🛡️ Automod settings

### Usage

`/automod whitelist add <target>`
`/automod whitelist remove <target>`
`/automod whitelist list`
`/automod badwords add <word>`
`/automod badwords remove <word>`
`/automod badwords list`
`/automod badword-whitelist add <word>`
`/automod badword-whitelist remove <word>`
`/automod badword-whitelist list`
`/automod ignored-channels add <channel>`
`/automod ignored-channels remove <channel>`
`/automod ignored-channels list`
`/automod logs mod-log <channel>`
`/automod logs audit-log <channel>`
`/automod toggle anti-invites <status>`
`/automod toggle anti-links <status>`
`/automod toggle anti-spam <status>`
`/automod toggle anti-badwords <status>`
`/automod toggle anti-mention <status>`
`/automod toggle anti-all-caps <status>`
`/automod toggle anti-emoji-spam <status>`
`/automod toggle anti-zalgo <status>`
`/automod antinuke toggle <status>`
`/automod antinuke module <module> <status>`
`/automod antinuke threshold <module> <count> <seconds>`
`/automod antinuke action <module> <action>`
`/automod antinuke whitelist <action> <target>`
`/automod antinuke log-channel <channel>`
`/automod antinuke status`

### Subcommands

**`/automod whitelist add <target>`**
> Add a user or role to the whitelist

**Options for this subcommand:**
- **`target*`**
  - **Description:** User or role
  - **Type:** Mentionable
**`/automod whitelist remove <target>`**
> Remove a user or role from the whitelist

**Options for this subcommand:**
- **`target*`**
  - **Description:** User or role
  - **Type:** Mentionable
**`/automod whitelist list`**
> View the current whitelist


**`/automod badwords add <word>`**
> Add a word to the blocklist

**Options for this subcommand:**
- **`word*`**
  - **Description:** Word to block
  - **Type:** Text
**`/automod badwords remove <word>`**
> Remove a word from the blocklist

**Options for this subcommand:**
- **`word*`**
  - **Description:** Word to unblock
  - **Type:** Text
**`/automod badwords list`**
> View the blocked words list


**`/automod badword-whitelist add <word>`**
> Whitelist a word (allow even if it contains badwords)

**Options for this subcommand:**
- **`word*`**
  - **Description:** Word to allow
  - **Type:** Text
**`/automod badword-whitelist remove <word>`**
> Remove a word from the badword whitelist

**Options for this subcommand:**
- **`word*`**
  - **Description:** Word to remove
  - **Type:** Text
**`/automod badword-whitelist list`**
> View the badword whitelist


**`/automod ignored-channels add <channel>`**
> Add a channel to the exception list

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Channel to ignore
  - **Type:** Channel
**`/automod ignored-channels remove <channel>`**
> Remove a channel from the exception list

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Channel to remove
  - **Type:** Channel
**`/automod ignored-channels list`**
> View all automod-ignored channels


**`/automod logs mod-log <channel>`**
> Set the mod log channel (automod warnings)

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Channel for mod logs
  - **Type:** Channel
**`/automod logs audit-log <channel>`**
> Set the audit log channel (message edits/deletes)

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Channel for audit logs
  - **Type:** Channel
**`/automod toggle anti-invites <status>`**
> Enable or disable Anti-Invites

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/automod toggle anti-links <status>`**
> Enable or disable Anti-Links

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/automod toggle anti-spam <status>`**
> Enable or disable Anti-Spam

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/automod toggle anti-badwords <status>`**
> Enable or disable Anti-Badwords

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/automod toggle anti-mention <status>`**
> Enable or disable Anti-Mention

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/automod toggle anti-all-caps <status>`**
> Enable or disable Anti-All Caps

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/automod toggle anti-emoji-spam <status>`**
> Enable or disable Anti-Emoji Spam

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/automod toggle anti-zalgo <status>`**
> Enable or disable Anti-Zalgo

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/automod antinuke toggle <status>`**
> Enable or disable the entire AntiNuke system

**Options for this subcommand:**
- **`status*`**
  - **Description:** Enable or disable
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/automod antinuke module <module> <status>`**
> Enable or disable a specific AntiNuke module

**Options for this subcommand:**
- **`module*`**
  - **Description:** Which module
  - **Type:** Text
  - **Choices:** `Mass Ban` (`massBan`), `Mass Kick` (`massKick`), `Channel Create` (`channelCreate`), `Channel Delete` (`channelDelete`), `Role Delete` (`roleDelete`), `Webhook Create` (`webhookCreate`), `Admin Grant` (`adminGrant`)
- **`status*`**
  - **Description:** Enable or disable this module
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/automod antinuke threshold <module> <count> <seconds>`**
> Set threshold (count + window) for a module

**Options for this subcommand:**
- **`module*`**
  - **Description:** Which module
  - **Type:** Text
  - **Choices:** `Mass Ban` (`massBan`), `Mass Kick` (`massKick`), `Channel Create` (`channelCreate`), `Channel Delete` (`channelDelete`), `Role Delete` (`roleDelete`), `Webhook Create` (`webhookCreate`)
- **`count*`**
  - **Description:** Number of actions before triggering (e.g. 3)
  - **Type:** Integer
- **`seconds*`**
  - **Description:** Time window in seconds (e.g. 10)
  - **Type:** Integer
**`/automod antinuke action <module> <action>`**
> Set the punishment action for a module

**Options for this subcommand:**
- **`module*`**
  - **Description:** Which module
  - **Type:** Text
  - **Choices:** `Mass Ban` (`massBan`), `Mass Kick` (`massKick`), `Channel Create` (`channelCreate`), `Channel Delete` (`channelDelete`), `Role Delete` (`roleDelete`), `Webhook Create` (`webhookCreate`), `Admin Grant` (`adminGrant`)
- **`action*`**
  - **Description:** Action to take
  - **Type:** Text
  - **Choices:** `Kick` (`kick`), `Ban` (`ban`), `Strip All Roles` (`dehoistRole`), `Log Only (no action)` (`none`)
**`/automod antinuke whitelist <action> <target>`**
> Add or remove a user/role from antinuke immunity

**Options for this subcommand:**
- **`action*`**
  - **Description:** Add or remove
  - **Type:** Text
  - **Choices:** `Add` (`add`), `Remove` (`remove`)
- **`target*`**
  - **Description:** User or role
  - **Type:** Mentionable
**`/automod antinuke log-channel <channel>`**
> Set a dedicated channel for AntiNuke alerts

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Log channel
  - **Type:** Channel
**`/automod antinuke status`**
> View current AntiNuke configuration




