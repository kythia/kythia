## Command Category: Counting

### `/counting`

**Description:** 🔢 Manage the counting channel.

### Usage

`/counting config [mode] [success_reaction] [fail_reaction] [math] [strict]`
`/counting disable`
`/counting leaderboard`
`/counting reset`
`/counting setup <channel> [mode] [success_reaction] [fail_reaction] [math] [strict]`
`/counting stats [user]`

### Subcommands

**`/counting config [<mode>] [<success_reaction>] [<fail_reaction>] [<math>] [<strict>]`**
> Configure counting settings.

**Options for this subcommand:**
- **`mode`**
  - **Description:** Counting mode (base).
  - **Type:** Text
  - **Choices:** `Decimal (Base 10)` (`decimal`), `Binary (Base 2)` (`binary`), `Hexadecimal (Base 16)` (`hex`), `Roman Numerals` (`roman`)
- **`success_reaction`**
  - **Description:** Emoji to react with when the number is correct.
  - **Type:** Text
- **`fail_reaction`**
  - **Description:** Emoji to react with when the number is wrong.
  - **Type:** Text
- **`math`**
  - **Description:** Allow math expressions (decimal mode only).
  - **Type:** Boolean
- **`strict`**
  - **Description:** Reset the count to 0 when a mistake is made.
  - **Type:** Boolean
**`/counting disable`**
> Disable the counting channel.


**`/counting leaderboard`**
> View the top counters in the server.


**`/counting reset`**
> Reset the counting channel.


**`/counting setup <channel> [<mode>] [<success_reaction>] [<fail_reaction>] [<math>] [<strict>]`**
> Configure the counting channel.

**Options for this subcommand:**
- **`channel*`**
  - **Description:** The channel to use for counting.
  - **Type:** Channel
- **`mode`**
  - **Description:** Counting mode (base).
  - **Type:** Text
  - **Choices:** `Decimal (Base 10)` (`decimal`), `Binary (Base 2)` (`binary`), `Hexadecimal (Base 16)` (`hex`), `Roman Numerals` (`roman`)
- **`success_reaction`**
  - **Description:** Emoji to react with when the number is correct.
  - **Type:** Text
- **`fail_reaction`**
  - **Description:** Emoji to react with when the number is wrong.
  - **Type:** Text
- **`math`**
  - **Description:** Allow math expressions (decimal mode only).
  - **Type:** Boolean
- **`strict`**
  - **Description:** Enable strict counting. if 1 user false, count will reset to 0.
  - **Type:** Boolean
**`/counting stats [<user>]`**
> View a user's counting statistics.

**Options for this subcommand:**
- **`user`**
  - **Description:** The user to view stats for.
  - **Type:** User


