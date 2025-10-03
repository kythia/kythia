## 📁 Command Category: Music

### 💾 `/music`

**Description:** 🎵 Full music command suite using Lavalink

### 📋 Details

- **Cooldown:** 15 seconds
- **User Permissions:** `ViewChannel`, `SendMessages`, `Connect`, `Speak`
- **Bot Permissions:** `SendMessages`, `Connect`, `Speak`
### 💻 Usage

`/music play <search>`
`/music pause`
`/music resume`
`/music skip`
`/music stop`
`/music queue`
`/music nowplaying`
`/music shuffle`
`/music back`
`/music loop <mode>`
`/music volume <level>`
`/music autoplay`
`/music filter`
`/music remove <position>`
`/music move <from> <to>`
`/music lyrics`
`/music playlist save <name>`
`/music playlist load <name>`
`/music playlist append <name>`
`/music playlist list`
`/music playlist delete <name>`
`/music playlist rename <name> <new_name>`
`/music playlist track-remove <name> <position>`
`/music playlist track-list <name>`
`/music playlist track-add <name> <search>`
`/music playlist import <code>`
`/music playlist share <name>`
`/music clear`
`/music seek <time>`
`/music favorite play [append]`
`/music favorite list`
`/music favorite add <search>`
`/music favorite remove <name>`

### 🔧 Subcommands

**`/music play <search>`**
> 🎶 Play a song or add it to the queue

**Options for this subcommand:**
- **`search*`**
  - **Description:** Song title or URL (YouTube, Spotify (can be playlist link))
  - **Type:** Text
**`/music pause`**
> ⏸️ Pause the currently playing song


**`/music resume`**
> ▶️ Resume the paused song


**`/music skip`**
> ⏭️ Skip the current song


**`/music stop`**
> ⏹️ Stop music and clear the queue


**`/music queue`**
> 📜 Show the current song queue


**`/music nowplaying`**
> ℹ️ Show the currently playing song


**`/music shuffle`**
> 🔀 Shuffle the queue order


**`/music back`**
> ⏮️ Play the previous song


**`/music loop <mode>`**
> 🔁 Set repeat mode

**Options for this subcommand:**
- **`mode*`**
  - **Description:** Choose repeat mode
  - **Type:** Text
  - **Choices:** `❌ Off` (`none`), `🔂 Track` (`track`), `🔁 Queue` (`queue`)
**`/music volume <level>`**
> 🔊 Set music volume

**Options for this subcommand:**
- **`level*`**
  - **Description:** Volume level (1-1000)
  - **Type:** Integer
**`/music autoplay`**
> 🔄 Enable or disable autoplay


**`/music filter`**
> 🎧 Apply audio filter (equalizer)


**`/music remove <position>`**
> 🗑️ Remove a song from queue

**Options for this subcommand:**
- **`position*`**
  - **Description:** Position in queue to remove
  - **Type:** Integer
**`/music move <from> <to>`**
> 🔀 Move a song to different position

**Options for this subcommand:**
- **`from*`**
  - **Description:** Current position
  - **Type:** Integer
- **`to*`**
  - **Description:** New position
  - **Type:** Integer
**`/music lyrics`**
> 🎤 Show the lyrics of the currently playing song


**`/music playlist save <name>`**
> Saves the current queue as a new playlist.

**Options for this subcommand:**
- **`name*`**
  - **Description:** The name for your new playlist.
  - **Type:** Text
**`/music playlist load <name>`**
> Clears the queue and loads a playlist.

**Options for this subcommand:**
- **`name*`**
  - **Description:** The name of the playlist to load.
  - **Type:** Text
**`/music playlist append <name>`**
> Adds songs from a playlist to the current queue.

**Options for this subcommand:**
- **`name*`**
  - **Description:** The name of the playlist to append.
  - **Type:** Text
**`/music playlist list`**
> Shows all of your saved playlists.


**`/music playlist delete <name>`**
> Deletes one of your playlists.

**Options for this subcommand:**
- **`name*`**
  - **Description:** The name of the playlist to delete.
  - **Type:** Text
**`/music playlist rename <name> <new_name>`**
> Renames one of your playlists.

**Options for this subcommand:**
- **`name*`**
  - **Description:** The name of the playlist to rename.
  - **Type:** Text
- **`new_name*`**
  - **Description:** The new name of the playlist.
  - **Type:** Text
**`/music playlist track-remove <name> <position>`**
> Removes a track from one of your playlists.

**Options for this subcommand:**
- **`name*`**
  - **Description:** The name of the playlist to remove the track from.
  - **Type:** Text
- **`position*`**
  - **Description:** The position of the track to remove.
  - **Type:** Integer
**`/music playlist track-list <name>`**
> Shows the list of tracks in a playlist.

**Options for this subcommand:**
- **`name*`**
  - **Description:** The name of the playlist to show the list of tracks from.
  - **Type:** Text
**`/music playlist track-add <name> <search>`**
> Adds a single song to one of your playlists.

**Options for this subcommand:**
- **`name*`**
  - **Description:** The name of the playlist to add the song to.
  - **Type:** Text
- **`search*`**
  - **Description:** The song title or URL to add.
  - **Type:** Text
**`/music playlist import <code>`**
> Import Playlist from Kythia playlist code or external services like Spotify.

**Options for this subcommand:**
- **`code*`**
  - **Description:** Kythia playlist code or Spotify URL to import.
  - **Type:** Text
**`/music playlist share <name>`**
> Share Kythia playlist with others.

**Options for this subcommand:**
- **`name*`**
  - **Description:** The name of the Kythia playlist to share.
  - **Type:** Text
**`/music clear`**
> 🗑️ Clears the current queue.


**`/music seek <time>`**
> ⏩ Seeks to a specific time in the current song.

**Options for this subcommand:**
- **`time*`**
  - **Description:** The time to seek to in seconds. eg. 10 30
  - **Type:** Integer
**`/music favorite play [<append>]`**
> 🎶 Play all songs from your favorites.

**Options for this subcommand:**
- **`append`**
  - **Description:** Append the songs to the current queue.
  - **Type:** Boolean
**`/music favorite list`**
> 🌟 Show your favorite songs.


**`/music favorite add <search>`**
> 💖 Add a song to your favorites.

**Options for this subcommand:**
- **`search*`**
  - **Description:** The song title or URL to add.
  - **Type:** Text
**`/music favorite remove <name>`**
> 💖 Remove a song from your favorites.

**Options for this subcommand:**
- **`name*`**
  - **Description:** The name of the song to remove.
  - **Type:** Text


