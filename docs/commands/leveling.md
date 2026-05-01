## 📁 Command Category: Leveling

### 💾 `/level`

**Description:** 🏅 All commands related to the leveling system.

### 💻 Usage

`/level add <user> <level>`
`/level leaderboard`
`/level profile [user]`
`/level set <user> <level>`
`/level setting channel <channel>`
`/level setting cooldown <cooldown>`
`/level setting rolereward <action> <level> <role>`
`/level setting xp <xp>`
`/level xp-add <user> <xp>`
`/level xp-set <user> <xp>`

### 🔧 Subcommands

**`/level add <user> <level>`**
> Add levels to a user.
> _User Permissions: `ManageGuild`_

**Options for this subcommand:**
- **`user*`**
  - **Description:** The user to add levels to.
  - **Type:** User
- **`level*`**
  - **Description:** The amount of levels to add.
  - **Type:** Integer
**`/level leaderboard`**
> See the server's level leaderboard.


**`/level profile [<user>]`**
> Check your or another user's level profile.

**Options for this subcommand:**
- **`user`**
  - **Description:** The user whose profile you want to see.
  - **Type:** User
**`/level set <user> <level>`**
> Set a user's level to a specific value.
> _User Permissions: `ManageGuild`_

**Options for this subcommand:**
- **`user*`**
  - **Description:** The user to set the level for.
  - **Type:** User
- **`level*`**
  - **Description:** The level to set.
  - **Type:** Integer
**`/level setting channel <channel>`**
> 🎮 Set channel for level up messages
> _User Permissions: `ManageGuild`_

**Options for this subcommand:**
- **`channel*`**
  - **Description:** Channel for level up messages
  - **Type:** Channel
**`/level setting cooldown <cooldown>`**
> 🎮 Set XP gain cooldown
> _User Permissions: `ManageGuild`_

**Options for this subcommand:**
- **`cooldown*`**
  - **Description:** Cooldown in seconds
  - **Type:** Integer
**`/level setting rolereward <action> <level> <role>`**
> 🎮 Set role reward for a specific level
> _User Permissions: `ManageGuild`_

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
**`/level setting xp <xp>`**
> 🎮 Set XP amount per message
> _User Permissions: `ManageGuild`_

**Options for this subcommand:**
- **`xp*`**
  - **Description:** XP gained per message
  - **Type:** Integer
**`/level xp-add <user> <xp>`**
> Add XP to a user.
> _User Permissions: `ManageGuild`_

**Options for this subcommand:**
- **`user*`**
  - **Description:** The user to add XP to.
  - **Type:** User
- **`xp*`**
  - **Description:** The amount of XP to add.
  - **Type:** Integer
**`/level xp-set <user> <xp>`**
> Set a user's total XP to a specific value.
> _User Permissions: `ManageGuild`_

**Options for this subcommand:**
- **`user*`**
  - **Description:** The user to set the XP for.
  - **Type:** User
- **`xp*`**
  - **Description:** The total XP to set.
  - **Type:** Integer


