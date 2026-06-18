## Command Category: Activity

### `/activity`

**Description:** All commands related to activity statistics.

### Usage

`/activity achievement list [category] [user]`
`/activity achievement profile [user]`
`/activity achievement setup [channel]`
`/activity leaderboard [type] [period]`
`/activity setup <enabled>`
`/activity stats [user] [period]`

### Subcommands

**`/activity achievement list [<category>] [<user>]`**
> Browse achievements by category.

**Options for this subcommand:**
- **`category`**
  - **Description:** Filter by category.
  - **Type:** Text
  - **Choices:** `💬 Messages (All-Time)` (`messages`), `📅 Messages (Daily Record)` (`messages_daily`), `📆 Messages (Weekly Record)` (`messages_weekly`), `🎙️ Voice Chat (Hours)` (`voice`), `🔔 Voice Chat (Joins)` (`voice_joins`), `😄 Reactions` (`reactions`), `📅 Server Membership` (`server_age`), `🏅 Achievement Collector` (`collector`), `⭐ Special` (`special`)
- **`user`**
  - **Description:** The user to check. Defaults to yourself.
  - **Type:** User
**`/activity achievement profile [<user>]`**
> View your achievement profile banner.

**Options for this subcommand:**
- **`user`**
  - **Description:** The user to view. Defaults to yourself.
  - **Type:** User
**`/activity achievement setup [<channel>]`**
> Setup the achievement notification channel.
> _User Permissions: `ManageGuild`_

**Options for this subcommand:**
- **`channel`**
  - **Description:** The channel to send notifications to (leave empty to disable).
  - **Type:** Channel
**`/activity leaderboard [<type>] [<period>]`**
> Activity leaderboard for this server.

**Options for this subcommand:**
- **`type`**
  - **Description:** Sort by messages or voice time.
  - **Type:** Text
  - **Choices:** `📨 Messages` (`messages`), `🎙️ Voice Time` (`voice`)
- **`period`**
  - **Description:** Time period to show. Defaults to all time.
  - **Type:** Text
  - **Choices:** `🕰️ All Time` (`all`), `📅 Today` (`daily`), `📆 This Week` (`weekly`), `🗓️ This Month` (`monthly`)
**`/activity setup <enabled>`**
> Enable or disable activity tracking for this server.
> _User Permissions: `ManageGuild`_

**Options for this subcommand:**
- **`enabled*`**
  - **Description:** Turn activity tracking on or off.
  - **Type:** Boolean
**`/activity stats [<user>] [<period>]`**
> Check your activity stats (total messages & voice time).

**Options for this subcommand:**
- **`user`**
  - **Description:** The user whose stats you want to see. Defaults to yourself.
  - **Type:** User
- **`period`**
  - **Description:** Time period to show. Defaults to all time.
  - **Type:** Text
  - **Choices:** `🕰️ All Time` (`all`), `📅 Today` (`daily`), `📆 This Week` (`weekly`), `🗓️ This Month` (`monthly`)


