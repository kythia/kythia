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
  - **Description:** The number format to use.
  - **Type:** Text
  - **Choices:** `Normal Numbers (1, 2, 3...)` (`decimal`), `Roman Numerals (I, II, III, IV...)` (`roman`), `Binary / Hacker (1, 10, 11, 100...)` (`binary`), `Hexadecimal (1...9, A, B, C...)` (`hex`)
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
  - **Description:** The number format to use.
  - **Type:** Text
  - **Choices:** `Normal Numbers (1, 2, 3...)` (`decimal`), `Roman Numerals (I, II, III, IV...)` (`roman`), `Binary / Hacker (1, 10, 11, 100...)` (`binary`), `Hexadecimal (1...9, A, B, C...)` (`hex`)
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


