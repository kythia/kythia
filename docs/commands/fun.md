## Command Category: Fun

### `/8ball`

**Description:** 🔮 Ask the magic 8 ball anything

### Usage

`/8ball <question>`

### Options

- **`question*`**
  - **Description:** What do you want to ask?
  - **Type:** Text


### `/act`

**Description:** 🤗 Perform an anime action with a user

### Usage

`/act <action> [user]`

### Options

- **`action*`**
  - **Description:** The action to perform
  - **Type:** Text
  - **Choices:** `Hug` (`hug`), `Kiss` (`kiss`), `Pat` (`pat`), `Slap` (`slap`), `Cuddle` (`cuddle`), `Wave` (`wave`), `High Five` (`highfive`), `Handhold` (`handhold`), `Bite` (`bite`), `Bonk` (`bonk`), `Yeet` (`yeet`), `Dance` (`dance`), `Poke` (`poke`), `Wink` (`wink`), `Smile` (`smile`), `Blush` (`blush`), `Happy` (`happy`), `Cry` (`cry`), `Nom` (`nom`), `Kick` (`kick`), `Smug` (`smug`)
- **`user`**
  - **Description:** The user to perform the action on
  - **Type:** User


### `/fact`

**Description:** 🧠 Get a random useless (but interesting) fact

### Usage

`/fact`



### `/joke`

**Description:** 😂 Get a random joke with a hidden punchline

### Usage

`/joke [category]`

### Options

- **`category`**
  - **Description:** Choose a joke category
  - **Type:** Text
  - **Choices:** `🌍 General` (`general`), `🔨 Knock Knock` (`knock-knock`), `💻 Programming` (`programming`), `🌚 Dark` (`dark`), `😬 Pun` (`pun`), `🤪 Misc` (`misc`), `🎭 Spooky` (`spooky`), `🎄 Christmas` (`christmas`)


### `/math`

**Description:** 🔢 Speed math quiz — answer streaks build your leaderboard score!

### Usage

`/math play`
`/math leaderboard`

### Subcommands

**`/math play`**
> ▶️ Start a math quiz


**`/math leaderboard`**
> 🏆 View the global math leaderboard




### `/meme`

**Description:** 😂 Get a random meme from Reddit

### Usage

`/meme [subreddit]`

### Options

- **`subreddit`**
  - **Description:** Choose a subreddit to pull the meme from
  - **Type:** Text
  - **Choices:** `😂 Memes` (`memes`), `🔥 Dank Memes` (`dankmemes`), `🪞 Me IRL` (`me_irl`), `🐸 Advice Animals` (`AdviceAnimals`), `😄 Funny` (`funny`), `💻 Programmer Humor` (`ProgrammerHumor`)


### `/quote`

**Description:** ✨ Get a random inspirational quote

### Usage

`/quote`



### `/roast`

**Description:** 🔥 Roast someone with a savage insult

### Usage

`/roast [user]`

### Options

- **`user`**
  - **Description:** The user to roast
  - **Type:** User


### `/rps`

**Description:** ✂️ Play Rock Paper Scissors — against the bot or a friend!

### Usage

`/rps [opponent]`

### Options

- **`opponent`**
  - **Description:** Challenge a friend (leave empty to play vs bot)
  - **Type:** User


### `/summon`

**Description:** 🔔 Summon a friend to your current channel

### Usage

`/summon <user>`

### Options

- **`user*`**
  - **Description:** The friend you want to summon
  - **Type:** User


### `/tictactoe`

**Description:** ⭕ Play Tic Tac Toe with a friend or bot.

### Usage

`/tictactoe <opponent> [difficulty]`

### Options

- **`opponent*`**
  - **Description:** Select an opponent to play with. you can play with me too!
  - **Type:** User
- **`difficulty`**
  - **Description:** Select the difficulty level of the bot (if playing against a bot).
  - **Type:** Text
  - **Choices:** `Easy` (`bot_easy`), `Medium` (`bot_medium`), `Hard (Unbeatable)` (`bot_hard`)


### `/wordle`

**Description:** 🔡 Play Wordle! Guess the 5-letter word in 6 tries.

### Usage

`/wordle`



### `/friend`

**Description:** 🤝 Friendship system commands

### Usage

`/friend add <user>`
`/friend list`
`/friend remove <user>`

### Subcommands

**`/friend add <user>`**
> 🤝 Add someone as a friend

**Options for this subcommand:**
- **`user*`**
  - **Description:** The user you want to add as a friend
  - **Type:** User
**`/friend list`**
> 🤝 List your friends


**`/friend remove <user>`**
> 💔 Remove someone from your friends list

**Options for this subcommand:**
- **`user*`**
  - **Description:** The user you want to remove from your friends
  - **Type:** User


