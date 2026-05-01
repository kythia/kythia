## 📁 Command Category: Streak

### 💾 `/streak`

**Description:** All commands related to the streak system.

### 💻 Usage

`/streak claim`
`/streak leaderboard`
`/streak reset`
`/streak setting emoji <emoji>`
`/streak setting minimum <minimum>`
`/streak setting nickname <status>`
`/streak setting rolereward <action> <streak> <role>`
`/streak user [target]`

### 🔧 Subcommands

**`/streak claim`**
> 🔥 Claim your streak for today, keep your streak continue!


**`/streak leaderboard`**
> 🥇 Streak leaderboard in this server


**`/streak reset`**
> Reset YOUR streak to 0 (be careful, can't be undone).


**`/streak setting emoji <emoji>`**
> 🔥 Set streak emoji
> _User Permissions: `ManageGuild`_

**Options for this subcommand:**
- **`emoji*`**
  - **Description:** Emoji
  - **Type:** Text
**`/streak setting minimum <minimum>`**
> 🔥 Set minimum streak
> _User Permissions: `ManageGuild`_

**Options for this subcommand:**
- **`minimum*`**
  - **Description:** Minimum streak
  - **Type:** Integer
**`/streak setting nickname <status>`**
> 🔥 Toggle auto-nickname for streak
> _User Permissions: `ManageGuild`_

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/streak setting rolereward <action> <streak> <role>`**
> 🔥 Set role reward for a specific streak
> _User Permissions: `ManageGuild`_

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
**`/streak user [<target>]`**
> Lihat streak user lain.

**Options for this subcommand:**
- **`target`**
  - **Description:** User yang ingin dicek streak-nya
  - **Type:** User


