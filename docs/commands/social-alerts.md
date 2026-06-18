## Command Category: Social-alerts

### `/social-alert`

**Description:** Manage YouTube social alerts for this server.

### Usage

`/social-alert add <platform> <channel> <discord_channel> [message]`
`/social-alert list`
`/social-alert remove <subscription>`
`/social-alert setting edit [mention_role]`
`/social-alert setting view`

### Subcommands

**`/social-alert add <platform> <channel> <discord_channel> [<message>]`**
> Subscribe to a social media creator and get notified on new posts.
> _User Permissions: `ManageGuild`_

**Options for this subcommand:**
- **`platform*`**
  - **Description:** The platform to track.
  - **Type:** Text
  - **Choices:** `📺 YouTube` (`youtube`), `🎵 TikTok` (`tiktok`), `📸 Instagram` (`instagram`)
- **`channel*`**
  - **Description:** YouTube: search by name. TikTok: enter @username.
  - **Type:** Text
- **`discord_channel*`**
  - **Description:** Discord channel where alerts will be posted.
  - **Type:** Channel
- **`message`**
  - **Description:** Custom alert message. Variables: {title}, {url}, {channel}
  - **Type:** Text
**`/social-alert list`**
> View all active social alert subscriptions for this server.


**`/social-alert remove <subscription>`**
> Unsubscribe from a social media creator alert.
> _User Permissions: `ManageGuild`_

**Options for this subcommand:**
- **`subscription*`**
  - **Description:** Select the subscription to remove.
  - **Type:** Text
**`/social-alert setting edit [<mention_role>]`**
> Edit Social Alerts settings.
> _User Permissions: `ManageGuild`_

**Options for this subcommand:**
- **`mention_role`**
  - **Description:** Role to mention in every alert. Leave empty to skip changes.
  - **Type:** Role
**`/social-alert setting view`**
> View current Social Alerts settings for this server.




