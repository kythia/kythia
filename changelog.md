# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### 0.9.9-beta-rc.2 (2025-10-09)


### 🔨 Fixed

* forEach is not a function on dashboard addon ([20f3ece](https://github.com/kythia/kythia/commit/20f3ecef6b8a707c6a8477048b431dc359fecd2a))
* safely resolve guild owner's username and update webhook description ([2cba2fb](https://github.com/kythia/kythia/commit/2cba2fba2d0249e1caa2057ba6b148e31a5c34c0))


### ✨ Added

* add Kythia CLI documentation and enhance server settings handling; normalize settings structure and improve error logging ([0c288fa](https://github.com/kythia/kythia/commit/0c288fa8fb656c1a6af8fbe15f57fe14120f91e1))
* add localization support for adventure commands; enhance command descriptions  and names in multiple languages in adventure addons ([42794e6](https://github.com/kythia/kythia/commit/42794e6711dbd5446e761dd33674221e8c417e5a))
* implement pagination for settings embed; enhance user interaction with navigation buttons for multi-page descriptions ([6245ce2](https://github.com/kythia/kythia/commit/6245ce242c1660413d194c879b26e78b9f649dd7))


### 🔧 Changed

* enhance Kythia initialization in Kythia.js and update intents in KythiaClient.js ([053fd3d](https://github.com/kythia/kythia/commit/053fd3d80095015ecd4fc05ef2568332eb103e3e))
* enhance various command structures and improve database models across multiple addons; streamline event handling and optimize performance; v0.9.9-beta-rc1 ([59f9140](https://github.com/kythia/kythia/commit/59f9140a82f301ce0fd7ed27221ab388ab137824))
* optimize KythiaClient configuration; streamline intents and partials setup, and enhance cache and sweeper settings ([5d9bbc2](https://github.com/kythia/kythia/commit/5d9bbc20bbf45a25b2bde0f64a1bd4245ee0eaa3))
* owner id now can more than 1 ([3b40662](https://github.com/kythia/kythia/commit/3b40662fecb5367a6d1a6b87775ebb4cc18fb2d0))
* streamline ping and stats commands; enhance Lavalink node ping handling and add Git commit ID to stats embed ([5660451](https://github.com/kythia/kythia/commit/566045105722249eb7d89900e022feebe21026b7))
* update bot owner configuration to support multiple IDs and names; enhance AI translation command with improved error handling and token management ([9c3ccd9](https://github.com/kythia/kythia/commit/9c3ccd9b08d841820b55d6e0ac677d4aab534008))

### 0.9.9-beta-rc.1 (2025-10-09)

This changelog outlines the new features and commands available in Kythia version 0.9.9-beta-rc.1.

### ✨ Added 

#### ⚔️ Adventure
- **battle:** Engage in battles with creatures.
- **inventory:** View your adventure inventory.
- **recall:** Recall your character.
- **shop:** Access the adventure shop.
- **start:** Begin your adventure.
- **stats:** Check your adventure statistics.

#### 🤖 AI
- **ai:** Interact with the AI.
- **translate:** Translate text to other languages.

#### ✅ Checklist
- **personal:** Manage your personal checklist.
- **server:** Manage the server's checklist.

#### ⚙️ CORE
- **autosetup:** Automatically configure server settings.
- **embed:** Create and manage embeds.
- **moderation:** Access moderation commands.
- **premium:** Manage premium features.
- **setting:** Configure bot settings.
- **tools:** Access various tools.
- **utils:** Access utility commands.

#### 💰 Economy
- **account:** Manage your economy account.
- **bank:** Interact with your bank account.
- **beg:** Beg for some cash.
- **cash:** Check your cash balance.
- **coinflip:** Gamble your cash in a coinflip.
- **daily:** Claim your daily reward.
- **deposit:** Deposit cash into your bank.
- **give:** Give cash to another user.
- **hack:** Attempt to hack for cash.
- **inventory:** View your economy inventory.
- **lootbox:** Open a lootbox.
- **profile:** View your economy profile.
- **rob:** Rob another user.
- **shop:** Access the economy shop.
- **slots:** Play the slot machine.
- **transfer:** Transfer cash to another user.
- **withdraw:** Withdraw cash from your bank.
- **work:** Work for some cash.

#### 🎉 Fun
- **8ball:** Ask the magic 8ball a question.
- **guessnumber:** Play a number guessing game.
- **uno:** Play a game of Uno.
- **tictactoe:** Play a game of Tic Tac Toe.
- **wordle:** Play a game of Wordle.

#### 🎁 Giveaway
- **giveaway:** Create and manage giveaways.

#### 💌 Invite
- **invite:** Get the bot's invite link.

#### 📈 Leveling
- **add:** Add experience to a user.
- **leaderboard:** View the leveling leaderboard.
- **profile:** View your leveling profile.
- **set:** Set a user's level.
- **xp-add:** Add experience points to a user.
- **xp-set:** Set a user's experience points.

#### 🎶 Music
- **music:** Control music playback.
- **reloadnode:** Reload the music node.

#### 🐾 Pet
- **admin:** Pet administration commands.
- **adopt:** Adopt a new pet.
- **editname:** Change your pet's name.
- **feed:** Feed your pet.
- **gacha:** Try your luck with the pet gacha.
- **info:** Get information about your pet.
- **leaderboard:** View the pet leaderboard.
- **play:** Play with your pet.
- **sell:** Sell your pet.
- **use:** Use a pet-related item.

#### ⚙️ Server
- **server:** Manage server settings.

#### 🔥 Streak
- **streak:** Manage your streaks.
