## Command Category: Reminder

### `/reminder`

**Description:** Manage your personal reminders across Kythia.

### Usage

`/reminder list`
`/reminder remove <id>`
`/reminder set <time> <reason> [channel] [repeat]`
`/reminder timezone <timezone>`

### Subcommands

**`/reminder list`**
> View your active reminders.


**`/reminder remove <id>`**
> Remove an active reminder.

**Options for this subcommand:**
- **`id*`**
  - **Description:** The ID of the reminder to remove
  - **Type:** Integer
**`/reminder set <time> <reason> [<channel>] [<repeat>]`**
> Set a new reminder.

**Options for this subcommand:**
- **`time*`**
  - **Description:** When to remind you (e.g. 10m, 2h, 1d, 12:00, 8:30pm)
  - **Type:** Text
- **`reason*`**
  - **Description:** What do you want to be reminded about?
  - **Type:** Text
- **`channel`**
  - **Description:** Target channel (leave blank for DM)
  - **Type:** Channel
- **`repeat`**
  - **Description:** Make this a repeating reminder
  - **Type:** Text
  - **Choices:** `Daily` (`daily`), `Weekly` (`weekly`), `Monthly` (`monthly`)
**`/reminder timezone <timezone>`**
> Set your preferred timezone for reminders.

**Options for this subcommand:**
- **`timezone*`**
  - **Description:** Your timezone (e.g. Asia/Jakarta, UTC)
  - **Type:** Text


