## 📁 Command Category: Setting

### 💾 `/set`

**Description:** ⚙️ Settings bot configuration

### 💻 Usage

`/set automod whitelist <action> <target>`
`/set automod badwords <action> <word>`
`/set automod badword-whitelist <action> <word>`
`/set automod exception-channel <action> <channel>`
`/set automod log-channel <channel>`
`/set automod badwords-list`
`/set automod badwords-whitelist-list`
`/set automod exception-channel-list`
`/set automod whitelist-list`
`/set stats add <format> [channel]`
`/set stats edit <stats> [channel] [format]`
`/set stats enable <stats>`
`/set stats disable <stats>`
`/set stats remove <stats>`
`/set admin edit <action> <target>`
`/set admin admin-list`
`/set welcome in-channel <channel>`
`/set welcome out-channel <channel>`
`/set welcome role <role>`
`/set welcome in-text <text>`
`/set welcome out-text <text>`
`/set welcome in-background <background>`
`/set welcome out-background <background>`
`/set cooldown daily <cooldown>`
`/set cooldown beg <cooldown>`
`/set cooldown lootbox <cooldown>`
`/set cooldown work <cooldown>`
`/set cooldown rob <cooldown>`
`/set cooldown hack <cooldown>`
`/set cooldown pet <cooldown>`
`/set cooldown gacha <cooldown>`
`/set leveling channel <channel>`
`/set leveling cooldown <cooldown>`
`/set leveling xp <xp>`
`/set leveling rolereward <action> <level> <role>`
`/set minecraft ip <ip>`
`/set minecraft port <port>`
`/set minecraft ip-channel <channel>`
`/set minecraft port-channel <channel>`
`/set minecraft status-channel <channel>`
`/set language <lang>`
`/set testimony testimony-channel <channel>`
`/set testimony feedback-channel <channel>`
`/set testimony count-channel <channel>`
`/set testimony count-format <format>`
`/set testimony reset-count`
`/set testimony count <count>`
`/set streak rolereward <action> <streak> <role>`
`/set view`
`/set features anti-invites <status>`
`/set features anti-links <status>`
`/set features anti-spam <status>`
`/set features anti-badwords <status>`
`/set features server-stats <status>`
`/set features leveling <status>`
`/set features economy <status>`
`/set features welcome-in <status>`
`/set features welcome-out <status>`
`/set features minecraft-stats <status>`
`/set features streak <status>`
`/set features pet <status>`
`/set features clan <status>`
`/set features adventure <status>`
`/set features nsfw <status>`
`/set features checklist <status>`

### 🔧 Subcommands

**`/set automod whitelist <action> <target>`**
> 🔄 Add or remove from whitelist

**Options for this subcommand:**
- **`action*`**
  - **Description:** Add or remove
  - **Type:** Text
  - **Choices:** `Add` (`add`), `Remove` (`remove`)
- **`target*`**
  - **Description:** User or role
  - **Type:** Mentionable
**`/set automod badwords <action> <word>`**
> 🔄 Add or remove bad words

**Options for this subcommand:**
- **`action*`**
  - **Description:** Add or remove
  - **Type:** Text
  - **Choices:** `Add` (`add`), `Remove` (`remove`)
- **`word*`**
  - **Description:** Word
  - **Type:** Text
**`/set automod badword-whitelist <action> <word>`**
> 🔄 Add or remove bad word whitelist

**Options for this subcommand:**
- **`action*`**
  - **Description:** Add or remove
  - **Type:** Text
  - **Choices:** `Add` (`add`), `Remove` (`remove`)
- **`word*`**
  - **Description:** Word
  - **Type:** Text
**`/set automod exception-channel <action> <channel>`**
> 🔄 Add or remove exception channel

**Options for this subcommand:**
- **`action*`**
  - **Description:** Add or remove
  - **Type:** Text
  - **Choices:** `Add` (`add`), `Remove` (`remove`)
- **`channel*`**
  - **Description:** Channel for exception
  - **Type:** Channel
**`/set automod log-channel <channel>`**
> 🔄 Channel to be used for automod logs

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Select channel for automod logs
  - **Type:** Channel
**`/set automod badwords-list`**
> View bad words list


**`/set automod badwords-whitelist-list`**
> View bad words whitelist list


**`/set automod exception-channel-list`**
> View exception channels


**`/set automod whitelist-list`**
> View whitelist


**`/set stats add <format> [<channel>]`**
> 📈 Add a new stat for a specific channel

**Options for this subcommand:**
- **`format*`**
  - **Description:** Stat format, e.g.: {memberstotal}
  - **Type:** Text
- **`channel`**
  - **Description:** 📈 Select a channel to use as stat (if not selected, the bot will create a new channel)
  - **Type:** Channel
**`/set stats edit <stats> [<channel>] [<format>]`**
> 📈 Edit the format of an existing stat channel

**Options for this subcommand:**
- **`stats*`**
  - **Description:** Select the stat to edit
  - **Type:** Text
- **`channel`**
  - **Description:** 📈 Edit stat channel
  - **Type:** Channel
- **`format`**
  - **Description:** 📈 Edit stat format, e.g.: {membersonline}
  - **Type:** Text
**`/set stats enable <stats>`**
> 📈 Enable stat channel

**Options for this subcommand:**
- **`stats*`**
  - **Description:** Select the stat to enable
  - **Type:** Text
**`/set stats disable <stats>`**
> 📈 Disable stat channel

**Options for this subcommand:**
- **`stats*`**
  - **Description:** Select the stat to disable
  - **Type:** Text
**`/set stats remove <stats>`**
> 📈 Delete the stat and its channel

**Options for this subcommand:**
- **`stats*`**
  - **Description:** Select the stat to delete
  - **Type:** Text
**`/set admin edit <action> <target>`**
> 🔒 Add or remove admin

**Options for this subcommand:**
- **`action*`**
  - **Description:** Add or remove
  - **Type:** Text
  - **Choices:** `Add` (`add`), `Remove` (`remove`)
- **`target*`**
  - **Description:** User or role admin
  - **Type:** Mentionable
**`/set admin admin-list`**
> View admin list


**`/set welcome in-channel <channel>`**
> 👋 Set welcome in channel

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Welcome in channel
  - **Type:** Channel
**`/set welcome out-channel <channel>`**
> 👋 Set welcome out channel

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Welcome out channel
  - **Type:** Channel
**`/set welcome role <role>`**
> 👋 Set welcome role

**Options for this subcommand:**
- **`role*`**
  - **Description:** Role for welcome
  - **Type:** Role
**`/set welcome in-text <text>`**
> 👋 Set welcome in text

**Options for this subcommand:**
- **`text*`**
  - **Description:** Text for welcome in
  - **Type:** Text
**`/set welcome out-text <text>`**
> 👋 Set welcome out text

**Options for this subcommand:**
- **`text*`**
  - **Description:** Text for welcome out
  - **Type:** Text
**`/set welcome in-background <background>`**
> 👋 Set welcome in background

**Options for this subcommand:**
- **`background*`**
  - **Description:** Background for welcome in
  - **Type:** Text
**`/set welcome out-background <background>`**
> 👋 Set welcome out background

**Options for this subcommand:**
- **`background*`**
  - **Description:** Background for welcome out
  - **Type:** Text
**`/set cooldown daily <cooldown>`**
> ⏳ Set daily cooldown

**Options for this subcommand:**
- **`cooldown*`**
  - **Description:** Cooldown in seconds
  - **Type:** Integer
**`/set cooldown beg <cooldown>`**
> ⏳ Set beg cooldown

**Options for this subcommand:**
- **`cooldown*`**
  - **Description:** Cooldown in seconds
  - **Type:** Integer
**`/set cooldown lootbox <cooldown>`**
> ⏳ Set lootbox cooldown

**Options for this subcommand:**
- **`cooldown*`**
  - **Description:** Cooldown in seconds
  - **Type:** Integer
**`/set cooldown work <cooldown>`**
> ⏳ Set work cooldown

**Options for this subcommand:**
- **`cooldown*`**
  - **Description:** Cooldown in seconds
  - **Type:** Integer
**`/set cooldown rob <cooldown>`**
> ⏳ Set rob cooldown

**Options for this subcommand:**
- **`cooldown*`**
  - **Description:** Cooldown in seconds
  - **Type:** Integer
**`/set cooldown hack <cooldown>`**
> ⏳Set hack cooldown

**Options for this subcommand:**
- **`cooldown*`**
  - **Description:** Cooldown in seconds
  - **Type:** Integer
**`/set cooldown pet <cooldown>`**
> ⏳ Set pet cooldown

**Options for this subcommand:**
- **`cooldown*`**
  - **Description:** Cooldown in seconds
  - **Type:** Integer
**`/set cooldown gacha <cooldown>`**
> ⏳ Set gacha cooldown

**Options for this subcommand:**
- **`cooldown*`**
  - **Description:** Cooldown in seconds
  - **Type:** Integer
**`/set leveling channel <channel>`**
> 🎮 Set channel for level up messages

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Channel for level up messages
  - **Type:** Channel
**`/set leveling cooldown <cooldown>`**
> 🎮 Set XP gain cooldown

**Options for this subcommand:**
- **`cooldown*`**
  - **Description:** Cooldown in seconds
  - **Type:** Integer
**`/set leveling xp <xp>`**
> 🎮 Set XP amount per message

**Options for this subcommand:**
- **`xp*`**
  - **Description:** XP gained per message
  - **Type:** Integer
**`/set leveling rolereward <action> <level> <role>`**
> 🎮 Set role reward for a specific level

**Options for this subcommand:**
- **`action*`**
  - **Description:** Add or remove role reward
  - **Type:** Text
  - **Choices:** `Add` (`add`), `Remove` (`remove`)
- **`level*`**
  - **Description:** Required level
  - **Type:** Integer
- **`role*`**
  - **Description:** Role to be given
  - **Type:** Role
**`/set minecraft ip <ip>`**
> 🎮 Set Minecraft server IP

**Options for this subcommand:**
- **`ip*`**
  - **Description:** Minecraft server IP
  - **Type:** Text
**`/set minecraft port <port>`**
> 🎮 Set Minecraft server port

**Options for this subcommand:**
- **`port*`**
  - **Description:** Minecraft server port
  - **Type:** Integer
**`/set minecraft ip-channel <channel>`**
> 🎮 Set channel to display Minecraft server IP

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Channel for Minecraft IP
  - **Type:** Channel
**`/set minecraft port-channel <channel>`**
> 🎮 Set channel to display Minecraft server port

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Channel for Minecraft port
  - **Type:** Channel
**`/set minecraft status-channel <channel>`**
> 🎮 Set channel for Minecraft server status

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Channel for Minecraft status
  - **Type:** Channel
**`/set language <lang>`**
> 🌐 Set bot language

**Options for this subcommand:**
- **`lang*`**
  - **Description:** Choose language
  - **Type:** Text
**`/set testimony testimony-channel <channel>`**
> 💬 Set channel to send testimonies

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Testimony channel
  - **Type:** Channel
**`/set testimony feedback-channel <channel>`**
> 💬 Set channel for testimony feedback

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Testimony feedback channel
  - **Type:** Channel
**`/set testimony count-channel <channel>`**
> 💬 Set channel to display testimony count (name will be changed automatically)

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Testimony counter channel
  - **Type:** Channel
**`/set testimony count-format <format>`**
> 💬 Set channel name format for testimony counter

**Options for this subcommand:**
- **`format*`**
  - **Description:** Channel name format, use {count} for the number. Example: testimony-{count}
  - **Type:** Text
**`/set testimony reset-count`**
> 💬 Reset testimony count to 0


**`/set testimony count <count>`**
> 💬 Change testimony count

**Options for this subcommand:**
- **`count*`**
  - **Description:** New testimony count
  - **Type:** Integer
**`/set streak rolereward <action> <streak> <role>`**
> 🔥 Set role reward for a specific streak

**Options for this subcommand:**
- **`action*`**
  - **Description:** Add or remove role reward
  - **Type:** Text
  - **Choices:** `Add` (`add`), `Remove` (`remove`)
- **`streak*`**
  - **Description:** Required streak
  - **Type:** Integer
- **`role*`**
  - **Description:** Role to be given
  - **Type:** Role
**`/set view`**
> 🔍 View all bot settings


**`/set features anti-invites <status>`**
> Enable or disable the Anti-Invites feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features anti-links <status>`**
> Enable or disable the Anti-Links feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features anti-spam <status>`**
> Enable or disable the Anti-Spam feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features anti-badwords <status>`**
> Enable or disable the Anti-Badwords feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features server-stats <status>`**
> Enable or disable the Server Stats feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features leveling <status>`**
> Enable or disable the Leveling feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features economy <status>`**
> Enable or disable the Economy feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features welcome-in <status>`**
> Enable or disable the Welcome In feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features welcome-out <status>`**
> Enable or disable the Welcome Out feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features minecraft-stats <status>`**
> Enable or disable the Minecraft Stats feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features streak <status>`**
> Enable or disable the Streak feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features pet <status>`**
> Enable or disable the Pet feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features clan <status>`**
> Enable or disable the Clan feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features adventure <status>`**
> Enable or disable the Adventure feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features nsfw <status>`**
> Enable or disable the NSFW feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features checklist <status>`**
> Enable or disable the Checklist feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)


