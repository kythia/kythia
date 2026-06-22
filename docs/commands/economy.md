## Command Category: Economy

### `/eco`

**Description:** Get your money and become rich

### Usage

`/eco account create <bank>`
`/eco account edit <bank>`
`/eco bank deposit <type> [amount]`
`/eco bank info`
`/eco bank loan <action> <amount>`
`/eco bank switch`
`/eco bank transfer <target> <amount>`
`/eco bank upgrade`
`/eco bank withdraw <amount>`
`/eco beg`
`/eco coin`
`/eco collect`
`/eco company fire <target>`
`/eco company hire <target>`
`/eco company resign`
`/eco crime arrest <target>`
`/eco crime blackmarket`
`/eco crime hack <target>`
`/eco crime rob <target>`
`/eco crime wanted [target]`
`/eco daily`
`/eco flea <action> [item] [price] [type]`
`/eco gamble coinflip <bet> <side>`
`/eco gamble slots <bet>`
`/eco give <target> <amount>`
`/eco guild_stock create <ticker> <initial_kyth> <initial_supply>`
`/eco guild_stock portfolio`
`/eco guild_stock swap <ticker> <action> <amount>`
`/eco guild_stock top`
`/eco guild_stock view [ticker]`
`/eco inventory`
`/eco job apply`
`/eco job work`
`/eco leaderboard`
`/eco lootbox`
`/eco market buy <asset> <amount>`
`/eco market cancel <order_id>`
`/eco market history`
`/eco market limit <side> <asset> <quantity> <price>`
`/eco market portfolio`
`/eco market sell <asset> <quantity>`
`/eco market stake <action> [amount]`
`/eco market stoploss <asset> <quantity> <price>`
`/eco market view [asset] [timeframe]`
`/eco marry divorce`
`/eco marry kiss`
`/eco marry profile`
`/eco marry propose <user>`
`/eco premium`
`/eco profile [user]`
`/eco shop`
`/eco use <item>`

### Subcommands

**`/eco account create <bank>`**
> Create an account and choose a bank type.

**Options for this subcommand:**
- **`bank*`**
  - **Description:** Each bank offers unique benefits for your playstyle!
  - **Type:** Text
  - **Choices:** `🏦 Apex Financial` (`apex_financial`), `🏛️ Titan Holdings` (`titan_holdings`), `🌐 Zenith Commerce` (`zenith_commerce`), `🗡️ Crimson Syndicate` (`crimson_syndicate`), `☀️ Solara Mutual` (`solara_mutual`)
**`/eco account edit <bank>`**
> Edit your account and choose a bank type.

**Options for this subcommand:**
- **`bank*`**
  - **Description:** Each bank offers unique benefits for your playstyle!
  - **Type:** Text
  - **Choices:** `🏦 Apex Financial` (`apex_financial`), `🏛️ Titan Holdings` (`titan_holdings`), `🌐 Zenith Commerce` (`zenith_commerce`), `🗡️ Crimson Syndicate` (`crimson_syndicate`), `☀️ Solara Mutual` (`solara_mutual`)
**`/eco bank deposit <type> [<amount>]`**
> Deposit your kythia coin into kythia bank.

**Options for this subcommand:**
- **`type*`**
  - **Description:** Choose deposit type: all or partial
  - **Type:** Text
  - **Choices:** `Deposit All` (`all`), `Deposit Partial` (`partial`)
- **`amount`**
  - **Description:** Amount to deposit
  - **Type:** Integer
**`/eco bank info`**
> Check your kythia bank balance and full bank info.


**`/eco bank loan <action> <amount>`**
> Borrow money from your bank or repay your loan.

**Options for this subcommand:**
- **`action*`**
  - **Description:** Borrow or Repay?
  - **Type:** Text
  - **Choices:** `Borrow` (`borrow`), `Repay` (`repay`)
- **`amount*`**
  - **Description:** Amount to borrow or repay
  - **Type:** Integer
**`/eco bank switch`**
> Switch to a different bank type (Costs money!).


**`/eco bank transfer <target> <amount>`**
> Transfer your money to another user.

**Options for this subcommand:**
- **`target*`**
  - **Description:** User to transfer money to
  - **Type:** User
- **`amount*`**
  - **Description:** Amount of money to transfer
  - **Type:** Integer
**`/eco bank upgrade`**
> Upgrade your maximum bank capacity.


**`/eco bank withdraw <amount>`**
> Withdraw your kythia coin from kythia bank.

**Options for this subcommand:**
- **`amount*`**
  - **Description:** Amount to withdraw
  - **Type:** Integer
**`/eco beg`**
> Ask for money from server.


**`/eco coin`**
> Check your kythia coin balance.


**`/eco collect`**
> Collect daily passive income from your assets


**`/eco company fire <target>`**
> (Company Owner) Fire an employee from your company.

**Options for this subcommand:**
- **`target*`**
  - **Description:** The employee you want to fire
  - **Type:** User
**`/eco company hire <target>`**
> (Company Owner) Hire a player to work for you.

**Options for this subcommand:**
- **`target*`**
  - **Description:** The player you want to hire
  - **Type:** User
**`/eco company resign`**
> ‍Resign from your current employer.


**`/eco crime arrest <target>`**
> (Police Only) Arrest a wanted criminal!

**Options for this subcommand:**
- **`target*`**
  - **Description:** The wanted criminal you want to arrest
  - **Type:** User
**`/eco crime blackmarket`**
> The underground Black Market. Accepts KYTH only.


**`/eco crime hack <target>`**
> Hack another user (Initiates a hacking sequence).

**Options for this subcommand:**
- **`target*`**
  - **Description:** User you want to hack
  - **Type:** User
**`/eco crime rob <target>`**
> Try to rob money from another user.

**Options for this subcommand:**
- **`target*`**
  - **Description:** The user you want to rob
  - **Type:** User
**`/eco crime wanted [<target>]`**
> View the most wanted criminals or claim a bounty.

**Options for this subcommand:**
- **`target`**
  - **Description:** The user you want to capture
  - **Type:** User
**`/eco daily`**
> Collect your daily kythia coin.
> _Aliases: `daily`_


**`/eco flea <action> [<item>] [<price>] [<type>]`**
> Advanced Player-to-player Grand Auction House.

**Options for this subcommand:**
- **`action*`**
  - **Description:** What do you want to do?
  - **Type:** Text
  - **Choices:** `View Market` (`view`), `List Item` (`list`), `My Listings` (`my_listings`), `Search` (`search`)
- **`item`**
  - **Description:** Item name to list or search
  - **Type:** Text
- **`price`**
  - **Description:** BIN price or Starting Bid (for list)
  - **Type:** Integer
- **`type`**
  - **Description:** Listing Type (BIN or Auction)
  - **Type:** Text
  - **Choices:** `Buy It Now (BIN)` (`bin`), `Auction (24h)` (`auction`)
**`/eco gamble coinflip <bet> <side>`**
> Flip a coin and test your luck.

**Options for this subcommand:**
- **`bet*`**
  - **Description:** Amount to bet
  - **Type:** Integer
- **`side*`**
  - **Description:** Heads or Tails
  - **Type:** Text
  - **Choices:** `Heads` (`heads`), `Tails` (`tails`)
**`/eco gamble slots <bet>`**
> 🎰 Play the Las Vegas Kythia slot machine! (Warning: Addictive!)

**Options for this subcommand:**
- **`bet*`**
  - **Description:** The amount of money to bet
  - **Type:** Integer
**`/eco give <target> <amount>`**
> Give kythia coin to another user.

**Options for this subcommand:**
- **`target*`**
  - **Description:** User to give kythia coin to
  - **Type:** User
- **`amount*`**
  - **Description:** Amount of kythia coin to give
  - **Type:** Integer
**`/eco guild_stock create <ticker> <initial_kyth> <initial_supply>`**
> (Owner) Launch your server's local stock market via ICO.

**Options for this subcommand:**
- **`ticker*`**
  - **Description:** Max 4-letter symbol for your stock (e.g. MEME)
  - **Type:** Text
- **`initial_kyth*`**
  - **Description:** Initial KYTH liquidity to deposit into the pool
  - **Type:** Number
- **`initial_supply*`**
  - **Description:** Initial supply of your Guild Token to deposit
  - **Type:** Number
**`/eco guild_stock portfolio`**
> View all the Guild Stocks you currently own.


**`/eco guild_stock swap <ticker> <action> <amount>`**
> Swap KYTH for Guild Tokens, or vice versa via AMM.

**Options for this subcommand:**
- **`ticker*`**
  - **Description:** The ticker of the stock to trade (e.g. MEME)
  - **Type:** Text
- **`action*`**
  - **Description:** Are you buying or selling the stock?
  - **Type:** Text
  - **Choices:** `Buy (Pay KYTH, Get Stock)` (`buy`), `Sell (Pay Stock, Get KYTH)` (`sell`)
- **`amount*`**
  - **Description:** Amount of stock to buy/sell
  - **Type:** Number
**`/eco guild_stock top`**
> View the top Guild Stocks by Market Cap (The Kythia S&P 500).


**`/eco guild_stock view [<ticker>]`**
> View the live market data for a server's stock.

**Options for this subcommand:**
- **`ticker`**
  - **Description:** The 2-4 letter stock ticker (leave blank for this server's stock)
  - **Type:** Text
**`/eco inventory`**
> View all items in your inventory.


**`/eco job apply`**
> Apply for a specific profession to focus your work.


**`/eco job work`**
> Work to earn money with various scenarios!
> _Aliases: `work`_


**`/eco leaderboard`**
> View the global economy leaderboard.


**`/eco lootbox`**
> Open a lootbox to get a random reward.
> _Aliases: `lootbox`_


**`/eco market buy <asset> <amount>`**
> Buy an asset from the global market.

**Options for this subcommand:**
- **`asset*`**
  - **Description:** The symbol of the asset you want to buy (e.g., BTC, ETH, AAPL)
  - **Type:** Text
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
- **`quantity*`**
  - **Description:** The amount of the asset to buy or sell
  - **Type:** Number
- **`price*`**
  - **Description:** The price at which to place the order
  - **Type:** Number
**`/eco market portfolio`**
> View your personal asset portfolio.


**`/eco market sell <asset> <quantity>`**
> Sell an asset to the global market.

**Options for this subcommand:**
- **`asset*`**
  - **Description:** The symbol of the asset you want to sell (e.g., BTC, ETH, AAPL)
  - **Type:** Text
- **`quantity*`**
  - **Description:** The amount of the asset you want to sell (e.g., 0.5 KYTH)
  - **Type:** Number
**`/eco market stake <action> [<amount>]`**
> Stake or unstake KYTH tokens with Solara Mutual for daily dividends.

**Options for this subcommand:**
- **`action*`**
  - **Description:** Stake or Unstake?
  - **Type:** Text
  - **Choices:** `Stake KYTH` (`stake`), `Unstake KYTH` (`unstake`), `View Status` (`status`)
- **`amount`**
  - **Description:** Amount of KYTH to stake/unstake (not needed for status)
  - **Type:** Number
**`/eco market stoploss <asset> <quantity> <price>`**
> Set a stop-loss order to sell an asset if it reaches a certain price.

**Options for this subcommand:**
- **`asset*`**
  - **Description:** The symbol of the asset
  - **Type:** Text
- **`quantity*`**
  - **Description:** The amount of the asset to sell
  - **Type:** Number
- **`price*`**
  - **Description:** The price at which to trigger the sell order
  - **Type:** Number
**`/eco market view [<asset>] [<timeframe>]`**
> View real-time crypto prices from the global market.

**Options for this subcommand:**
- **`asset`**
  - **Description:** Symbol of the asset to view (e.g. bitcoin, AAPL), or leave empty for all
  - **Type:** Text
- **`timeframe`**
  - **Description:** The time range for the chart (default: 7 Days)
  - **Type:** Text
  - **Choices:** `1 Day` (`1`), `7 Days` (`7`), `14 Days` (`14`), `30 Days` (`30`), `90 Days` (`90`), `365 Days` (`365`)
**`/eco marry divorce`**
> End your current marriage


**`/eco marry kiss`**
> Kiss your partner


**`/eco marry profile`**
> View your marriage profile


**`/eco marry propose <user>`**
> Propose to another user

**Options for this subcommand:**
- **`user*`**
  - **Description:** The user you want to propose to
  - **Type:** User
**`/eco premium`**
> Enter the Premium Shop to buy Kythia Tiers.


**`/eco profile [<user>]`**
> View a user's full profile, including level, bank, cash, and more.

**Options for this subcommand:**
- **`user`**
  - **Description:** The user whose profile you want to view
  - **Type:** User
**`/eco shop`**
> Look and buy items from the shop.


**`/eco use <item>`**
> Use a consumable item from your inventory.

**Options for this subcommand:**
- **`item*`**
  - **Description:** The item you want to use
  - **Type:** Text
  - **Choices:** `☕ Coffee` (`coffee_item`), `🥫 Energy Drink` (`energydrink_item`), `🎫 Lottery Ticket` (`lotteryticket_item`)


