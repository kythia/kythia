## 📁 Command Category: Moderation

### 💾 `/announce`

**Description:** 📢 Send an announcement to a specified channel.

### 💻 Usage

`/announce <channel> <message>`

### ⚙️ Options

- **`channel*`**
  - **Description:** Channel to send the announcement
  - **Type:** Channel
- **`message*`**
  - **Description:** Announcement message
  - **Type:** Text


### 💾 `/ban`

**Description:** ⚠️ Ban a user from the server.

### 💻 Usage

`/ban <user> [reason]`

### ⚙️ Options

- **`user*`**
  - **Description:** User to ban
  - **Type:** User
- **`reason`**
  - **Description:** Reason for ban (optional)
  - **Type:** Text


### 💾 `/clear`

**Description:** 🗑️ Delete messages from a channel.

### 💻 Usage

`/clear <amount>`

### ⚙️ Options

- **`amount*`**
  - **Description:** Amount of messages to delete (0 = all)
  - **Type:** Integer


### 💾 `/automod-setup`

**Description:** Installs/re-installs a set of 6 core AutoMod rules.

### 💻 Usage

`/automod-setup`



### 💾 `/kick`

**Description:** ⚠️ Kick a user from the server.

### 💻 Usage

`/kick <user> [reason]`

### ⚙️ Options

- **`user*`**
  - **Description:** User to kick
  - **Type:** User
- **`reason`**
  - **Description:** Reason for kick (optional)
  - **Type:** Text


### 💾 `/lock`

**Description:** 🔒 Locks a channel to prevent messages.

### 💻 Usage

`/lock [channel]`

### ⚙️ Options

- **`channel`**
  - **Description:** Channel to lock
  - **Type:** Channel


### 💾 `/mute`

**Description:** 🔇 Mute a user in a voice channel.

### 💻 Usage

`/mute <user>`

### ⚙️ Options

- **`user*`**
  - **Description:** User to mute
  - **Type:** User


### 💾 `/pin`

**Description:** 📌 Pins a message in the channel.

### 💻 Usage

`/pin <message_id>`

### ⚙️ Options

- **`message_id*`**
  - **Description:** ID of the message to pin
  - **Type:** Text


### 💾 `/role`

**Description:** ⭕ Add or remove a role from a user.

### 💻 Usage

`/role <user> <role> <action>`

### ⚙️ Options

- **`user*`**
  - **Description:** The user to modify
  - **Type:** User
- **`role*`**
  - **Description:** The role to add or remove
  - **Type:** Role
- **`action*`**
  - **Description:** Choose whether to add or remove the role.
  - **Type:** Text
  - **Choices:** `Add` (`add`), `Remove` (`remove`)


### 💾 `/say`

**Description:** 💬 Make the bot send a message

### 💻 Usage

`/say <message>`

### ⚙️ Options

- **`message*`**
  - **Description:** Message to send
  - **Type:** Text


### 💾 `/slowmode`

**Description:** ⏳ Sets the slowmode for the channel.

### 💻 Usage

`/slowmode <duration>`

### ⚙️ Options

- **`duration*`**
  - **Description:** Duration in seconds
  - **Type:** Integer


### 💾 `/timeout`

**Description:** ⏰ Puts a user in timeout for a specified duration.

### 💻 Usage

`/timeout <user> <duration>`

### ⚙️ Options

- **`user*`**
  - **Description:** User to timeout
  - **Type:** User
- **`duration*`**
  - **Description:** Duration in seconds
  - **Type:** Integer


### 💾 `/unban`

**Description:** 🔓 Unbans a user from the server.

### 💻 Usage

`/unban <userid>`

### ⚙️ Options

- **`userid*`**
  - **Description:** User ID to unban
  - **Type:** Text


### 💾 `/unlock`

**Description:** 🔓 Unlocks a channel to allow messages.

### 💻 Usage

`/unlock [channel]`

### ⚙️ Options

- **`channel`**
  - **Description:** Channel to unlock
  - **Type:** Channel


### 💾 `/unmute`

**Description:** 🔊 Unmutes a user in a voice channel.

### 💻 Usage

`/unmute <user>`

### ⚙️ Options

- **`user*`**
  - **Description:** User to unmute
  - **Type:** User


### 💾 `/unpin`

**Description:** 📌 Unpins a message in the channel.

### 💻 Usage

`/unpin <message_id>`

### ⚙️ Options

- **`message_id*`**
  - **Description:** ID of the message to unpin
  - **Type:** Text


### 💾 `/warn`

**Description:** ⚠️ Warn a user.

### 💻 Usage

`/warn <user> <reason>`

### ⚙️ Options

- **`user*`**
  - **Description:** User to warn
  - **Type:** User
- **`reason*`**
  - **Description:** Reason for the warning
  - **Type:** Text


### 💾 `/warnings`

**Description:** 🔖 Show user warnings.

### 💻 Usage

`/warnings [user]`

### ⚙️ Options

- **`user`**
  - **Description:** User to check
  - **Type:** User


