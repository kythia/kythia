## Command Category: Activity

### `/activity`

**Description:** 📊 All commands related to activity statistics.

### Usage

`/activity leaderboard [type] [period]`
`/activity stats [user] [period]`

### Subcommands

**`/activity leaderboard [<type>] [<period>]`**
> 📊 Activity leaderboard for this server.

**Options for this subcommand:**
- **`type`**
  - **Description:** Sort by messages or voice time.
  - **Type:** Text
  - **Choices:** `📨 Messages` (`messages`), `🎙️ Voice Time` (`voice`)
- **`period`**
  - **Description:** Time period to show. Defaults to all time.
  - **Type:** Text
  - **Choices:** `🕰️ All Time` (`all`), `📅 Today` (`daily`), `📆 This Week` (`weekly`), `🗓️ This Month` (`monthly`)
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


