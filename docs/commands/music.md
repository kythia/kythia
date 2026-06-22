## Command Category: Music

### `/music`

**Description:** Full music command suite using Lavalink

### Details

- **Aliases:** `m`
- **Cooldown:** 15 seconds
- **User Permissions:** `ViewChannel`, `SendMessages`, `Connect`, `Speak`
- **Bot Permissions:** `SendMessages`, `Connect`, `Speak`
### Usage

`/music favorite add <search>`
`/music favorite list`
`/music favorite play [append]`
`/music favorite remove <name>`
`/music manage clear`
`/music manage jump <position>`
`/music manage move <from> <to>`
`/music manage remove <position>`
`/music nowplaying`
`/music pause`
`/music play <search>`
`/music playback autoplay [status]`
`/music playback back`
`/music playback filter`
`/music playback loop <mode>`
`/music playback replay`
`/music playback seek <time>`
`/music playback shuffle`
`/music playback volume <level>`
`/music playlist append <name>`
`/music playlist delete <name>`
`/music playlist import <code>`
`/music playlist list`
`/music playlist load <name>`
`/music playlist rename <name> <new_name>`
`/music playlist save <name>`
`/music playlist share <name>`
`/music playlist track-add <name> <search>`
`/music playlist track-list <name>`
`/music playlist track-remove <name> <position>`
`/music queue`
`/music radio <search>`
`/music resume`
`/music skip`
`/music stop`
`/music utils 247 [lock]`
`/music utils download [query]`
`/music utils grab`
`/music utils history`
`/music utils join`
`/music utils karaoke`
`/music utils leave`
`/music utils lyrics`
`/music utils repair`

### Subcommands

**`/music favorite add <search>`**
> Add a song to your favorites.

**Options for this subcommand:**
- **`search*`**
  - **Description:** The song title or URL to add.
  - **Type:** Text
**`/music favorite list`**
> Show your favorite songs.


**`/music favorite play [<append>]`**
> Play all songs from your favorites.

**Options for this subcommand:**
- **`append`**
  - **Description:** Append the songs to the current queue.
  - **Type:** Boolean
**`/music favorite remove <name>`**
> Remove a song from your favorites.

**Options for this subcommand:**
- **`name*`**
  - **Description:** The name of the song to remove.
  - **Type:** Text
**`/music manage clear`**
> Clears the current queue.


**`/music manage jump <position>`**
> Jump to a specific song in the queue

**Options for this subcommand:**
- **`position*`**
  - **Description:** The position in the queue to jump to
  - **Type:** Integer
**`/music manage move <from> <to>`**
> Move a song to different position

**Options for this subcommand:**
- **`from*`**
  - **Description:** Current position
  - **Type:** Integer
- **`to*`**
  - **Description:** New position
  - **Type:** Integer
**`/music manage remove <position>`**
> Remove a song from queue

**Options for this subcommand:**
- **`position*`**
  - **Description:** Position in queue to remove
  - **Type:** Integer
**`/music nowplaying`**
> Show the currently playing song


**`/music pause`**
> Pause the currently playing song


**`/music play <search>`**
> Play a song or add it to the queue

**Options for this subcommand:**
- **`search*`**
  - **Description:** Song title or URL (YouTube, Spotify (can be playlist link))
  - **Type:** Text
**`/music playback autoplay [<status>]`**
> Enable or disable autoplay

**Options for this subcommand:**
- **`status`**
  - **Description:** Enable or disable autoplay
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/music playback back`**
> Play the previous song


**`/music playback filter`**
> Apply audio filter (equalizer)


**`/music playback loop <mode>`**
> Set repeat mode

**Options for this subcommand:**
- **`mode*`**
  - **Description:** Choose repeat mode
  - **Type:** Text
  - **Choices:** `❌ Off` (`none`), `🔂 Track` (`track`), `🔁 Queue` (`queue`)
**`/music playback replay`**
> Replay the current song


**`/music playback seek <time>`**
> Seeks to a specific time in the current song.

**Options for this subcommand:**
- **`time*`**
  - **Description:** The time to seek to. eg. 10, 2:30, 1:20:30
  - **Type:** Text
**`/music playback shuffle`**
> Shuffle the queue order


**`/music playback volume <level>`**
> Set music volume

**Options for this subcommand:**
- **`level*`**
  - **Description:** Volume level (1-1000)
  - **Type:** Integer
**`/music playlist append <name>`**
> Adds songs from a playlist to the current queue.

**Options for this subcommand:**
- **`name*`**
  - **Description:** The name of the playlist to append.
  - **Type:** Text
**`/music playlist delete <name>`**
> Deletes one of your playlists.

**Options for this subcommand:**
- **`name*`**
  - **Description:** The name of the playlist to delete.
  - **Type:** Text
**`/music playlist import <code>`**
> Import Playlist from Kythia playlist code or external services like Spotify.

**Options for this subcommand:**
- **`code*`**
  - **Description:** Kythia playlist code or Spotify URL to import.
  - **Type:** Text
**`/music playlist list`**
> Shows all of your saved playlists.


**`/music playlist load <name>`**
> Clears the queue and loads a playlist.

**Options for this subcommand:**
- **`name*`**
  - **Description:** The name of the playlist to load.
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
**`/music playlist save <name>`**
> Saves the current queue as a new playlist.

**Options for this subcommand:**
- **`name*`**
  - **Description:** The name for your new playlist.
  - **Type:** Text
**`/music playlist share <name>`**
> Share Kythia playlist with others.

**Options for this subcommand:**
- **`name*`**
  - **Description:** The name of the Kythia playlist to share.
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
**`/music playlist track-list <name>`**
> Shows the list of tracks in a playlist.

**Options for this subcommand:**
- **`name*`**
  - **Description:** The name of the playlist to show the list of tracks from.
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
**`/music queue`**
> Show the current song queue


**`/music radio <search>`**
> Search and play live radio stations worldwide

**Options for this subcommand:**
- **`search*`**
  - **Description:** Name of the radio station (e.g., Prambors, BBC, Lofi)
  - **Type:** Text
**`/music resume`**
> ▶️ Resume the paused song


**`/music skip`**
> ⏭️ Skip the current song


**`/music stop`**
> Stop music and clear the queue


**`/music utils 247 [<lock>]`**
> Enable or disable 24/7 mode to keep the bot in the voice channel.

**Options for this subcommand:**
- **`lock`**
  - **Description:** Lock the bot to this channel so it cannot be moved.
  - **Type:** Boolean
**`/music utils download [<query>]`**
> Download the current song

**Options for this subcommand:**
- **`query`**
  - **Description:** The song to download (optional, if not specified, the current song will be downloaded)
  - **Type:** Text
**`/music utils grab`**
> Grab the current song to your DMs


**`/music utils history`**
> Show the history of played songs


**`/music utils join`**
> Make Kythia Join the voice channel
> _Aliases: `join`_


**`/music utils karaoke`**
> Toggle live synced karaoke lyrics


**`/music utils leave`**
> Make Kythia Leave the voice channel
> _Aliases: `leave`_


**`/music utils lyrics`**
> Show the lyrics of the currently playing song


**`/music utils repair`**
> Repair a stuck or broken music session




