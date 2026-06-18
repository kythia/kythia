## Command Category: Core

### `/premium-server`

**Description:** Manage your Server Premium bindings

### Usage

`/premium-server bind [server_id]`
`/premium-server list`
`/premium-server unbind [server_id]`

### Subcommands

**`/premium-server bind [<server_id>]`**
> Bind your Premium tier to a server.

**Options for this subcommand:**
- **`server_id`**
  - **Description:** The ID of the server (leave empty to bind current server)
  - **Type:** Text
**`/premium-server list`**
> List all servers bound to your Premium tier.


**`/premium-server unbind [<server_id>]`**
> Unbind your Premium tier from a server.

**Options for this subcommand:**
- **`server_id`**
  - **Description:** The ID of the server (leave empty to unbind current server)
  - **Type:** Text


### `/set`

**Description:** Settings bot configuration

### Usage

`/set language set <lang>`
`/set view`
`/set features activity <status>`
`/set features server-stats <status>`
`/set features leveling <status>`
`/set features adventure <status>`
`/set features minecraft-stats <status>`
`/set features streak <status>`
`/set features invites <status>`
`/set features boost-log <status>`

### Subcommands

**`/set language set <lang>`**
> Set bot language

**Options for this subcommand:**
- **`lang*`**
  - **Description:** Choose language
  - **Type:** Text
  - **Choices:** `en-US` (`en-US`)
**`/set view`**
> View all bot settings


**`/set features activity <status>`**
> Enable or disable the Activity feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features server-stats <status>`**
> Enable or disable the Server Stats feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features leveling <status>`**
> Enable or disable the Leveling feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features adventure <status>`**
> Enable or disable the Adventure feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features minecraft-stats <status>`**
> Enable or disable the Minecraft Stats feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features streak <status>`**
> Enable or disable the Streak feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features invites <status>`**
> Enable or disable the Invites feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)
**`/set features boost-log <status>`**
> Enable or disable the Boost Log feature

**Options for this subcommand:**
- **`status*`**
  - **Description:** Select status
  - **Type:** Text
  - **Choices:** `Enable` (`enable`), `Disable` (`disable`)


### `/ascii`

**Description:** Generate ASCII art from your text using figlet.

### Details

- **Cooldown:** 15 seconds
### Usage

`/ascii <text> [font] [allfonts]`

### Options

- **`text*`**
  - **Description:** The text to convert to ASCII art
  - **Type:** Text
- **`font`**
  - **Description:** The figlet font to use (eg: Standard, Slant, Larry 3D, etc.)
  - **Type:** Text
- **`allfonts`**
  - **Description:** Generate ASCII art with ALL fonts
  - **Type:** Boolean


### `/avatar`

**Description:** Show user avatar.

### Usage

`/avatar [user]`

### Options

- **`user`**
  - **Description:** The user whose avatar you want to see.
  - **Type:** User


### `/banner`

**Description:** Show user banner.

### Usage

`/banner [user]`

### Options

- **`user`**
  - **Description:** The user whose banner you want to see.
  - **Type:** User


### `/crack-hash`

**Description:** Try to lookup a hash from public databases (MD5, SHA1, SHA256, SHA512).

### Usage

`/crack-hash <algorithm> <hash>`

### Options

- **`algorithm*`**
  - **Description:** The hash algorithm to lookup
  - **Type:** Text
  - **Choices:** `MD5` (`md5`), `SHA1` (`sha1`), `SHA256` (`sha256`), `SHA512` (`sha512`)
- **`hash*`**
  - **Description:** The hash to try to lookup
  - **Type:** Text


### `/decrypt`

**Description:** Decrypt data using the correct secret key.

### Usage

`/decrypt <encrypted-data> <secret-key>`

### Options

- **`encrypted-data*`**
  - **Description:** The full encrypted string from the /encrypt command
  - **Type:** Text
- **`secret-key*`**
  - **Description:** The 32-character secret key used for encryption
  - **Type:** Text


### `/encrypt`

**Description:** Encrypt a text with a secret key (two-way encryption).

### Usage

`/encrypt <text> <secret-key>`

### Options

- **`text*`**
  - **Description:** The text you want to encrypt
  - **Type:** Text
- **`secret-key*`**
  - **Description:** A 32-character secret key for encryption
  - **Type:** Text


### `/hash`

**Description:** Hash a text string using MD5, SHA, or other algorithms.

### Usage

`/hash <algorithm> <text>`

### Options

- **`algorithm*`**
  - **Description:** The hash algorithm to use
  - **Type:** Text
  - **Choices:** `MD5` (`md5`), `SHA1` (`sha1`), `SHA224` (`sha224`), `SHA256` (`sha256`), `SHA384` (`sha384`), `SHA512` (`sha512`), `SHA3-256` (`sha3-256`), `SHA3-512` (`sha3-512`), `RIPEMD160` (`ripemd160`)
- **`text*`**
  - **Description:** The text to hash
  - **Type:** Text


### `/instagram`

**Description:** Get and play an Instagram post/reel by link.

### Usage

`/instagram <link>`

### Options

- **`link*`**
  - **Description:** The Instagram post/reel link
  - **Type:** Text


### `/lastseen`

**Description:** Check when a user last sent a message in this server.

### Usage

`/lastseen <user>`

### Options

- **`user*`**
  - **Description:** The user to check
  - **Type:** User


### `/obfuscate`

**Description:** Obfuscate a Lua or JavaScript file and return it as an attachment.

### Usage

`/obfuscate <type> <file>`

### Options

- **`type*`**
  - **Description:** The type of script to obfuscate (lua/javascript)
  - **Type:** Text
  - **Choices:** `javascript` (`javascript`), `lua` (`lua`)
- **`file*`**
  - **Description:** The script file to obfuscate
  - **Type:** Attachment


### `/tiktok`

**Description:** Get and play a TikTok video by link.

### Usage

`/tiktok <link>`

### Options

- **`link*`**
  - **Description:** The TikTok video link
  - **Type:** Text


### `/nickprefix`

**Description:** Adds or removes a prefix from member nicknames.

### Usage

`/nickprefix add`
`/nickprefix remove`

### Subcommands

**`/nickprefix add`**
> Adds the highest role prefix to member nicknames.


**`/nickprefix remove`**
> Removes the prefix from member nicknames.




### `/sticky`

**Description:** Manage sticky messages in a channel.

### Usage

`/sticky list`
`/sticky remove`
`/sticky set <message>`

### Subcommands

**`/sticky list`**
> List all sticky messages in this server.


**`/sticky remove`**
> Removes the sticky message from this channel.


**`/sticky set <message>`**
> Sets a sticky message for this channel.

**Options for this subcommand:**
- **`message*`**
  - **Description:** The content of the sticky message.
  - **Type:** Text


### `/about`

**Description:** A brief introduction about kythia

### Details

- **Aliases:** `abt`, `🌸`
### Usage

`/about`



### `/afk`

**Description:** Set your Away From Keyboard (AFK) status.

### Usage

`/afk [reason]`

### Options

- **`reason`**
  - **Description:** The reason for being AFK.
  - **Type:** Text


### `/cache`

**Description:** Shows cache statistics.

### Usage

`/cache`



### `/grab`

**Description:** grab stickers or emojis from messages.

### Usage

`/grab sticker <sticker_id>`
`/grab emoji <emoji>`
`/grab image <message_id> [name]`

### Subcommands

**`/grab sticker <sticker_id>`**
> Grab a sticker from a message

**Options for this subcommand:**
- **`sticker_id*`**
  - **Description:** Sticker ID to grab
  - **Type:** Text
**`/grab emoji <emoji>`**
> Grab a custom emoji from a message

**Options for this subcommand:**
- **`emoji*`**
  - **Description:** Emoji to grab (custom emoji format)
  - **Type:** Text
**`/grab image <message_id> [<name>]`**
> Grab an image from a message and turn it into a sticker

**Options for this subcommand:**
- **`message_id*`**
  - **Description:** ID of the message containing the image
  - **Type:** Text
- **`name`**
  - **Description:** Name for the new sticker (max 30 chars)
  - **Type:** Text


### `/help`

**Description:** 💡 Displays a list of bot commands with complete details.

### Details

- **Aliases:** `h`, `ℹ️`
### Usage

`/help`



### `/legal`

**Description:** View the Terms of Service and Privacy Policy

### Usage

`/legal`



### `/ping`

**Description:** 🔍 Checks the bot's, Discord API's, database and cache/redis connection speed.

### Details

- **Aliases:** `p`, `pong`, `🏓`
### Usage

`/ping`



### `/report`

**Description:** Report a user to the moderators.

### Usage

`/report <user> <reason>`

### Options

- **`user*`**
  - **Description:** User to report
  - **Type:** User
- **`reason*`**
  - **Description:** Reason for the report
  - **Type:** Text


### `/serverinfo`

**Description:** Displays detailed information about the server.

### Usage

`/serverinfo`



### `/stats`

**Description:** Displays kythia statistics.

### Details

- **Aliases:** `s`
### Usage

`/stats`



### `/testevent`

**Description:** Trigger a Discord event for testing purposes

### Usage

`/testevent <event> [type]`

### Options

- **`event*`**
  - **Description:** The event to trigger
  - **Type:** Text
- **`type`**
  - **Description:** The specific scenario to test
  - **Type:** Text


### `/userinfo`

**Description:** Displays information about a user.

### Usage

`/userinfo [user]`

### Options

- **`user`**
  - **Description:** User to get info about
  - **Type:** User


### `/vote-leaderboard`

**Description:** View top voters for Kythia!

### Usage

`/vote-leaderboard`



### `/vote`

**Description:** Vote for kythia on top.gg!

### Details

- **Aliases:** `v`
### Usage

`/vote`



### `/widget`

**Description:** Manage your Kythia Profile Widget on Discord.

### Details

- **Aliases:** `wdg`
### Usage

`/widget`



### `/convert`

**Description:** Convert between units, currencies, etc.

### Usage

`/convert area <from> <to> <value>`
`/convert currency <from> <to> <amount>`
`/convert data <from> <to> <value>`
`/convert length <from> <to> <value>`
`/convert mass <from> <to> <value>`
`/convert temperature <from> <to> <value>`
`/convert volume <from> <to> <value>`

### Subcommands

**`/convert area <from> <to> <value>`**
> Convert area units (e.g. m² to acre)

**Options for this subcommand:**
- **`from*`**
  - **Description:** From unit
  - **Type:** Text
  - **Choices:** `Square Meter (m²)` (`sqm`), `Square Kilometer (km²)` (`sqkm`), `Square Mile (mi²)` (`sqmi`), `Square Yard (yd²)` (`sqyd`), `Square Foot (ft²)` (`sqft`), `Square Inch (in²)` (`sqin`), `Hectare (ha)` (`ha`), `Acre (acre)` (`acre`)
- **`to*`**
  - **Description:** To unit
  - **Type:** Text
  - **Choices:** `Square Meter (m²)` (`sqm`), `Square Kilometer (km²)` (`sqkm`), `Square Mile (mi²)` (`sqmi`), `Square Yard (yd²)` (`sqyd`), `Square Foot (ft²)` (`sqft`), `Square Inch (in²)` (`sqin`), `Hectare (ha)` (`ha`), `Acre (acre)` (`acre`)
- **`value*`**
  - **Description:** Value to convert
  - **Type:** Number
**`/convert currency <from> <to> <amount>`**
> Convert currency (e.g. USD to IDR)

**Options for this subcommand:**
- **`from*`**
  - **Description:** Currency code (e.g. USD)
  - **Type:** Text
- **`to*`**
  - **Description:** Currency code to convert to (e.g. IDR)
  - **Type:** Text
- **`amount*`**
  - **Description:** Amount to convert
  - **Type:** Number
**`/convert data <from> <to> <value>`**
> Convert data storage units (e.g. MB to GB)

**Options for this subcommand:**
- **`from*`**
  - **Description:** From unit
  - **Type:** Text
  - **Choices:** `Byte (B)` (`b`), `Kilobyte (KB)` (`kb`), `Megabyte (MB)` (`mb`), `Gigabyte (GB)` (`gb`), `Terabyte (TB)` (`tb`), `Petabyte (PB)` (`pb`), `Exabyte (EB)` (`eb`), `Zettabyte (ZB)` (`zb`), `Yottabyte (YB)` (`yb`), `Bit (bit)` (`bit`)
- **`to*`**
  - **Description:** To unit
  - **Type:** Text
  - **Choices:** `Byte (B)` (`b`), `Kilobyte (KB)` (`kb`), `Megabyte (MB)` (`mb`), `Gigabyte (GB)` (`gb`), `Terabyte (TB)` (`tb`), `Petabyte (PB)` (`pb`), `Exabyte (EB)` (`eb`), `Zettabyte (ZB)` (`zb`), `Yottabyte (YB)` (`yb`), `Bit (bit)` (`bit`)
- **`value*`**
  - **Description:** Value to convert
  - **Type:** Number
**`/convert length <from> <to> <value>`**
> Convert length units (e.g. m to km)

**Options for this subcommand:**
- **`from*`**
  - **Description:** From unit
  - **Type:** Text
  - **Choices:** `Meter (m)` (`m`), `Kilometer (km)` (`km`), `Centimeter (cm)` (`cm`), `Millimeter (mm)` (`mm`), `Mile (mi)` (`mi`), `Yard (yd)` (`yd`), `Foot (ft)` (`ft`), `Inch (in)` (`in`), `Nautical Mile (nm)` (`nm`), `Astronomical Unit (au)` (`au`), `Light Year (ly)` (`ly`)
- **`to*`**
  - **Description:** To unit
  - **Type:** Text
  - **Choices:** `Meter (m)` (`m`), `Kilometer (km)` (`km`), `Centimeter (cm)` (`cm`), `Millimeter (mm)` (`mm`), `Mile (mi)` (`mi`), `Yard (yd)` (`yd`), `Foot (ft)` (`ft`), `Inch (in)` (`in`), `Nautical Mile (nm)` (`nm`), `Astronomical Unit (au)` (`au`), `Light Year (ly)` (`ly`)
- **`value*`**
  - **Description:** Value to convert
  - **Type:** Number
**`/convert mass <from> <to> <value>`**
> Convert mass units (e.g. kg to lb)

**Options for this subcommand:**
- **`from*`**
  - **Description:** From unit
  - **Type:** Text
  - **Choices:** `Kilogram (kg)` (`kg`), `Gram (g)` (`g`), `Milligram (mg)` (`mg`), `Ton (ton)` (`ton`), `Pound (lb)` (`lb`), `Ounce (oz)` (`oz`), `Stone (st)` (`st`), `Carat (ct)` (`ct`), `Slug (slug)` (`slug`)
- **`to*`**
  - **Description:** To unit
  - **Type:** Text
  - **Choices:** `Kilogram (kg)` (`kg`), `Gram (g)` (`g`), `Milligram (mg)` (`mg`), `Ton (ton)` (`ton`), `Pound (lb)` (`lb`), `Ounce (oz)` (`oz`), `Stone (st)` (`st`), `Carat (ct)` (`ct`), `Slug (slug)` (`slug`)
- **`value*`**
  - **Description:** Value to convert
  - **Type:** Number
**`/convert temperature <from> <to> <value>`**
> Convert temperature (C, F, K, R, Re)

**Options for this subcommand:**
- **`from*`**
  - **Description:** From unit
  - **Type:** Text
  - **Choices:** `Celsius (C)` (`c`), `Fahrenheit (F)` (`f`), `Kelvin (K)` (`k`), `Rankine (R)` (`r`), `Réaumur (Re)` (`re`)
- **`to*`**
  - **Description:** To unit
  - **Type:** Text
  - **Choices:** `Celsius (C)` (`c`), `Fahrenheit (F)` (`f`), `Kelvin (K)` (`k`), `Rankine (R)` (`r`), `Réaumur (Re)` (`re`)
- **`value*`**
  - **Description:** Value to convert
  - **Type:** Number
**`/convert volume <from> <to> <value>`**
> Convert volume units (e.g. L to gal)

**Options for this subcommand:**
- **`from*`**
  - **Description:** From unit
  - **Type:** Text
  - **Choices:** `Liter (L)` (`l`), `Milliliter (mL)` (`ml`), `Cubic Meter (m³)` (`m3`), `Cubic Centimeter (cm³)` (`cm3`), `Gallon (gal)` (`gal`), `Quart (qt)` (`qt`), `Pint (pt)` (`pt`), `Cup (cup)` (`cup`), `Fluid Ounce (fl oz)` (`floz`), `Tablespoon (tbsp)` (`tbsp`), `Teaspoon (tsp)` (`tsp`)
- **`to*`**
  - **Description:** To unit
  - **Type:** Text
  - **Choices:** `Liter (L)` (`l`), `Milliliter (mL)` (`ml`), `Cubic Meter (m³)` (`m3`), `Cubic Centimeter (cm³)` (`cm3`), `Gallon (gal)` (`gal`), `Quart (qt)` (`qt`), `Pint (pt)` (`pt`), `Cup (cup)` (`cup`), `Fluid Ounce (fl oz)` (`floz`), `Tablespoon (tbsp)` (`tbsp`), `Teaspoon (tsp)` (`tsp`)
- **`value*`**
  - **Description:** Value to convert
  - **Type:** Number


