## Command Category: Economy

### `/eco`

**Description:** 💰 Get your money and become rich

### Usage

`/eco account create <bank>`
`/eco account edit <bank>`
`/eco bank`
`/eco beg`
`/eco coin`
`/eco coinflip <bet> <side>`
`/eco daily`
`/eco deposit <type> [amount]`
`/eco give <target> <amount>`
`/eco hack <target>`
`/eco inventory`
`/eco leaderboard`
`/eco lootbox`
`/eco market buy <asset> <amount>`
`/eco market cancel <order_id>`
`/eco market history`
`/eco market limit <side> <asset> <quantity> <price>`
`/eco market portfolio`
`/eco market sell <asset> <quantity>`
`/eco market stoploss <asset> <quantity> <price>`
`/eco market view [asset]`
`/eco profile [user]`
`/eco rob <target>`
`/eco shop`
`/eco slots <bet>`
`/eco transfer <target> <amount>`
`/eco withdraw <amount>`
`/eco work`

### Subcommands

**`/eco account create <bank>`**
> 👤 Create an account and choose a bank type.

**Options for this subcommand:**
- **`bank*`**
  - **Description:** Each bank offers unique benefits for your playstyle!
  - **Type:** Text
  - **Choices:** `🏦 Apex Financial` (`apex_financial`), `🏛️ Titan Holdings` (`titan_holdings`), `🌐 Zenith Commerce` (`zenith_commerce`), `🗡️ Crimson Syndicate` (`crimson_syndicate`), `☀️ Solara Mutual` (`solara_mutual`)
**`/eco account edit <bank>`**
> 👤 Edit your account and choose a bank type.

**Options for this subcommand:**
- **`bank*`**
  - **Description:** Each bank offers unique benefits for your playstyle!
  - **Type:** Text
  - **Choices:** `🏦 Apex Financial` (`apex_financial`), `🏛️ Titan Holdings` (`titan_holdings`), `🌐 Zenith Commerce` (`zenith_commerce`), `🗡️ Crimson Syndicate` (`crimson_syndicate`), `☀️ Solara Mutual` (`solara_mutual`)
**`/eco bank`**
> 💰 Check your kythia bank balance and full bank info.
> _Aliases: `bank`_


**`/eco beg`**
> 💰 Ask for money from server.


**`/eco coin`**
> 💰 Check your kythia coin balance.


**`/eco coinflip <bet> <side>`**
> 🪙 Flip a coin and test your luck.

**Options for this subcommand:**
- **`bet*`**
  - **Description:** Amount to bet
  - **Type:** Integer
- **`side*`**
  - **Description:** Heads or Tails
  - **Type:** Text
  - **Choices:** `Heads` (`heads`), `Tails` (`tails`)
**`/eco daily`**
> 💰 Collect your daily kythia coin.
> _Aliases: `daily`_


**`/eco deposit <type> [<amount>]`**
> 💰 Deposit your kythia coin into kythia bank.

**Options for this subcommand:**
- **`type*`**
  - **Description:** Choose deposit type: all or partial
  - **Type:** Text
  - **Choices:** `Deposit All` (`all`), `Deposit Partial` (`partial`)
- **`amount`**
  - **Description:** Amount to deposit
  - **Type:** Integer
**`/eco give <target> <amount>`**
> 💰 Give kythia coin to another user.

**Options for this subcommand:**
- **`target*`**
  - **Description:** User to give kythia coin to
  - **Type:** User
- **`amount*`**
  - **Description:** Amount of kythia coin to give
  - **Type:** Integer
**`/eco hack <target>`**
> 💵 Hack another user.

**Options for this subcommand:**
- **`target*`**
  - **Description:** User you want to hack
  - **Type:** User
**`/eco inventory`**
> 🛄 View all items in your inventory.


**`/eco leaderboard`**
> 🏆 View the global economy leaderboard.


**`/eco lootbox`**
> 🎁 Open a lootbox to get a random reward.
> _Aliases: `lootbox`_


**`/eco market buy <asset> <amount>`**
> 💸 Buy an asset from the global market.

**Options for this subcommand:**
- **`asset*`**
  - **Description:** The symbol of the asset you want to buy (e.g., BTC, ETH)
  - **Type:** Text
  - **Choices:** `BITCOIN` (`bitcoin`), `ETHEREUM` (`ethereum`), `SOLANA` (`solana`), `DOGECOIN` (`dogecoin`)
- **`amount*`**
  - **Description:** The amount of KythiaCoin you want to spend
  - **Type:** Number
**`/eco market cancel <order_id>`**
> Cancel an open order.

**Options for this subcommand:**
- **`order_id*`**
  - **Description:** The ID of the order to cancel
  - **Type:** Text
**`/eco market history`**
> View your transaction history.


**`/eco market limit <side> <asset> <quantity> <price>`**
> Set a limit order to buy or sell an asset at a specific price.

**Options for this subcommand:**
- **`side*`**
  - **Description:** Whether to buy or sell the asset
  - **Type:** Text
  - **Choices:** `Buy` (`buy`), `Sell` (`sell`)
- **`asset*`**
  - **Description:** The symbol of the asset
  - **Type:** Text
  - **Choices:** `BITCOIN` (`bitcoin`), `ETHEREUM` (`ethereum`), `SOLANA` (`solana`), `DOGECOIN` (`dogecoin`)
- **`quantity*`**
  - **Description:** The amount of the asset to buy or sell
  - **Type:** Number
- **`price*`**
  - **Description:** The price at which to place the order
  - **Type:** Number
**`/eco market portfolio`**
> 💼 View your personal asset portfolio.


**`/eco market sell <asset> <quantity>`**
> 💰 Sell an asset to the global market.

**Options for this subcommand:**
- **`asset*`**
  - **Description:** The symbol of the asset you want to sell (e.g., BTC, ETH)
  - **Type:** Text
  - **Choices:** `BITCOIN` (`bitcoin`), `ETHEREUM` (`ethereum`), `SOLANA` (`solana`), `DOGECOIN` (`dogecoin`)
- **`quantity*`**
  - **Description:** The amount of the asset you want to sell (e.g., 0.5)
  - **Type:** Number
**`/eco market stoploss <asset> <quantity> <price>`**
> Set a stop-loss order to sell an asset if it reaches a certain price.

**Options for this subcommand:**
- **`asset*`**
  - **Description:** The symbol of the asset
  - **Type:** Text
  - **Choices:** `BITCOIN` (`bitcoin`), `ETHEREUM` (`ethereum`), `SOLANA` (`solana`), `DOGECOIN` (`dogecoin`)
- **`quantity*`**
  - **Description:** The amount of the asset to sell
  - **Type:** Number
- **`price*`**
  - **Description:** The price at which to trigger the sell order
  - **Type:** Number
**`/eco market view [<asset>]`**
> 📈 View real-time crypto prices from the global market.

**Options for this subcommand:**
- **`asset`**
  - **Description:** The symbol of the asset to view, or leave empty for all
  - **Type:** Text
  - **Choices:** `BITCOIN` (`bitcoin`), `ETHEREUM` (`ethereum`), `SOLANA` (`solana`), `DOGECOIN` (`dogecoin`)
**`/eco profile [<user>]`**
> 🗃️ View a user's full profile, including level, bank, cash, and more.

**Options for this subcommand:**
- **`user`**
  - **Description:** The user whose profile you want to view
  - **Type:** User
**`/eco rob <target>`**
> 💵 Try to rob money from another user.

**Options for this subcommand:**
- **`target*`**
  - **Description:** The user you want to rob
  - **Type:** User
**`/eco shop`**
> 🛒 Look and buy items from the shop.


**`/eco slots <bet>`**
> 🎰 Play the Las Vegas Kythia slot machine! (Warning: Addictive!)
> _Cooldown: 20 seconds_

**Options for this subcommand:**
- **`bet*`**
  - **Description:** The amount of money to bet
  - **Type:** Integer
**`/eco transfer <target> <amount>`**
> Transfer your money to another user.

**Options for this subcommand:**
- **`target*`**
  - **Description:** User to transfer money to
  - **Type:** User
- **`amount*`**
  - **Description:** Amount of money to transfer
  - **Type:** Integer
**`/eco withdraw <amount>`**
> Withdraw your kythia coin from kythia bank.

**Options for this subcommand:**
- **`amount*`**
  - **Description:** Amount to withdraw
  - **Type:** Integer
**`/eco work`**
> ⚒️ Work to earn money with various scenarios!
> _Aliases: `work`_




