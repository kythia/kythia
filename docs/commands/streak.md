## Command Category: Streak

### `/streak`

**Description:** All commands related to the streak system.

### Usage

`/streak claim`
`/streak leaderboard`
`/streak reset`
`/streak restore`
`/streak setting emoji <emoji>`
`/streak setting minimum <minimum>`
`/streak setting nickname <status>`
`/streak setting quota <quota>`
`/streak setting rolereward <action> <streak> <role>`
`/streak setting timezone <timezone>`
`/streak user [target]`

### Subcommands

**`/streak claim`**
> Claim your streak for today, keep your streak continue!


**`/streak leaderboard`**
> Streak leaderboard in this server


**`/streak reset`**
> Reset YOUR streak to 0 (be careful, can't be undone).


**`/streak restore`**
> Restore your lost streak back to what it was before the reset.


**`/streak setting emoji <emoji>`**
> Set streak emoji
> _User Permissions: `ManageGuild`_

**Options for this subcommand:**
- **`emoji*`**
  - **Description:** Emoji
  - **Type:** Text
**`/streak setting minimum <minimum>`**
> Set minimum streak
> _User Permissions: `ManageGuild`_

**Options for this subcommand:**
- **`minimum*`**
  - **Description:** Minimum streak
  - **Type:** Integer
**`/streak setting nickname <status>`**
> Toggle auto-nickname for streak
> _User Permissions: `ManageGuild`_

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/streak setting quota <quota>`**
> Set monthly restore quota (how many times members can restore their streak per month)
> _User Permissions: `ManageGuild`_

**Options for this subcommand:**
- **`quota*`**
  - **Description:** Restores allowed per month (0–30, 0 = disabled)
  - **Type:** Integer
**`/streak setting rolereward <action> <streak> <role>`**
> Set role reward for a specific streak
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
**`/streak setting timezone <timezone>`**
> Set the timezone used for streak day resets
> _User Permissions: `ManageGuild`_

**Options for this subcommand:**
- **`timezone*`**
  - **Description:** Timezone for streak day calculations
  - **Type:** Text
  - **Choices:** `UTC+0 — UTC` (`UTC`), `UTC+7 — Asia/Jakarta (WIB)` (`Asia/Jakarta`), `UTC+8 — Asia/Singapore` (`Asia/Singapore`), `UTC+8 — Asia/Kuala_Lumpur` (`Asia/Kuala_Lumpur`), `UTC+8 — Asia/Manila` (`Asia/Manila`), `UTC+8 — Asia/Makassar (WITA)` (`Asia/Makassar`), `UTC+9 — Asia/Tokyo` (`Asia/Tokyo`), `UTC+9 — Asia/Seoul` (`Asia/Seoul`), `UTC+9 — Asia/Jayapura (WIT)` (`Asia/Jayapura`), `UTC+5:30 — Asia/Kolkata` (`Asia/Kolkata`), `UTC+5 — Asia/Karachi` (`Asia/Karachi`), `UTC+3 — Europe/Moscow` (`Europe/Moscow`), `UTC+1 — Europe/Paris` (`Europe/Paris`), `UTC+1 — Europe/Berlin` (`Europe/Berlin`), `UTC+0 — Europe/London` (`Europe/London`), `UTC-5 — America/New_York` (`America/New_York`), `UTC-6 — America/Chicago` (`America/Chicago`), `UTC-7 — America/Denver` (`America/Denver`), `UTC-8 — America/Los_Angeles` (`America/Los_Angeles`), `UTC+10 — Australia/Sydney` (`Australia/Sydney`), `UTC+12 — Pacific/Auckland` (`Pacific/Auckland`), `UTC-3 — America/Sao_Paulo` (`America/Sao_Paulo`), `UTC+2 — Africa/Cairo` (`Africa/Cairo`), `UTC+4 — Asia/Dubai` (`Asia/Dubai`), `UTC+5:45 — Asia/Kathmandu` (`Asia/Kathmandu`)
**`/streak user [<target>]`**
> Lihat streak user lain.

**Options for this subcommand:**
- **`target`**
  - **Description:** User yang ingin dicek streak-nya
  - **Type:** User


