<p align="center">
  <a href="https://kythia.xyz">
    <img src="https://github.com/kythia.png" alt="Kythia Logo" height="150">
  </a>
</p>

<h1 align="center">
  Kythia - Your Cutest Discord Companion
</h1>

<p align="center">
  <strong>Kythia Hye-Jin is more than just a bot; she's your sweet, cute, and beautiful companion, designed to bring life and order to your Discord server!</strong>
</p>

<p align="center">
  <a href="https://github.com/kythia/kythia" target="_blank"><img src="https://img.shields.io/github/stars/kythia/kythia" alt="Kythia" /></a>
  <a href="https://top.gg/bots/1379246675171999826" target="_blank"><img src="https://top.gg/api/widget/upvotes/1379246675171999826.svg" alt="Kythia bot" /></a>
  <a href="https://www.npmjs.com/package/kythia-core" target="_blank"><img src="https://img.shields.io/npm/v/kythia-core?label=kythia-core" alt="kythia-core" /></a>
</p>

<p align="center">
  <a href="https://github.com/kythia/kythia/issues">Report a Bug</a>
  ·
  <a href="https://github.com/kythia/kythia/issues">Request a Feature</a>
</p>

<div align="center">
  <p><em>Powered by the following technologies:</em></p>
  <img alt="Discord" src="https://img.shields.io/badge/Discord-5865F2.svg?style=flat&logo=Discord&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat&logo=JavaScript&logoColor=black">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933.svg?style=flat&logo=nodedotjs&logoColor=white">
  <img alt="Sequelize" src="https://img.shields.io/badge/Sequelize-52B0E7.svg?style=flat&logo=Sequelize&logoColor=white">
  <img alt="Express.js" src="https://img.shields.io/badge/Express.js-000000.svg?style=flat&logo=express&logoColor=white">
  <img alt="Gemini" src="https://img.shields.io/badge/Gemini-4285F4.svg?style=flat&logo=Google&logoColor=white">
</div>

---

## 🌟 Features

Kythia is packed with a massive amount of features, all organized into a clean, modular addon system. This means you can easily enable or disable features to tailor the bot to your server's specific needs.

Here's a glimpse of what Kythia has to offer:

### 🛡️ Core & Moderation

- **Core Systems (`core`):** Essential tools, settings, advanced moderation commands (`ban`, `kick`, `mute`, `warn`, `clear`), currency conversion, and maintenance mode.
- **Automod (`automod`):** Automatically detect and manage spam, duplicate messages, zalgo, fast messages, and bad words.
- **Verification (`verification`):** Secure your server with a robust verification system.
- **Welcomer (`welcomer`):** Welcome new members with customizable cards featuring avatar decorations and badges!
- **Logging:** Comprehensive logging for errors, votes, and events.

### 🎉 Engagement & Fun

- **Economy (`economy`):** Earn virtual currency, work, daily rewards, rob your friends, and gamble your way to riches.
- **Adventure Game (`adventure`):** Embark on an epic text-based RPG adventure, fight monsters, and collect loot!
- **Pets (`pet`):** Adopt, raise, and gacha your own virtual pets.
- **Music (`music`):** Listen to your favorite tunes with a feature-rich, Lavalink-powered music player with Spotify support.
- **Leveling (`leveling`):** Reward your users for their activity with a customizable leveling system and profile cards.
- **Fun & Games (`fun`):** Enjoy interactive games like Wordle.
- **Global Chat (`globalchat`):** Connect and chat with users across different servers!

### 🚀 Server Management & Utility

- **Ticket System (`ticket`):** A complete ticket system and `modmail` to help you manage user support requests.
- **Suggestions (`suggestion`):** Allow users to submit suggestions and vote on their favorites.
- **Social Alerts (`social-alerts`):** Get notified for new content from YouTube and TikTok.
- **Temporary Voice (`tempvoice`):** Allow users to create and manage their own temporary voice channels.
- **Giveaways (`giveaway`):** Host and manage giveaways easily.
- **Reaction Roles (`reaction-role`):** Allow members to self-assign roles using interactive emoji buttons or sleek Discord **Dropdown Menus** with custom labels.

### ✨ And Many More Addons!

Kythia comes with a huge collection of modular addons, including:

- `ai` (Powered by Google Gemini)
- `autoreact` & `autoreply`
- `birthday` & `checklist`
- `embed-builder` & `image`
- `invite` tracking
- `minecraft` integration
- `pro` (Cloudflare integration)
- `quest`, `server`, `store`, `streak`, `testimony`

...and the list is always growing!

---

## 🌸 Why Kythia?

There are many Discord bots out there, but Kythia stands out from the crowd. Here's why:

- **🤖 Modular by Design:** Kythia is built on a powerful addon system, allowing you to enable only the features you need. This keeps the bot lightweight and efficient.
- **✨ Feature-Rich:** With a massive collection of addons, Kythia offers a huge range of features, from advanced moderation to fun games and a full-fledged economy system.
- **🔧 Fully Customizable:** Almost every aspect of Kythia can be configured to your liking. From custom welcome messages to fine-tuned automod settings, you're in control.
- **🛡️ Rock-Solid Stability:** Built completely around Discord's modern Components V2 architecture with rigorous dynamic input validation and safe length truncation so the bot never crashes on your community.
- **🚀 Actively Developed:** Kythia is constantly being improved with new features, bug fixes, and performance enhancements.

---

## ⚖️ Terms of Service & Telemetry

By using Kythia, you agree to our Terms of Service. Please be aware that this bot collects certain telemetry data to ensure stability, performance, and license compliance.

### 📊 Information We Collect

- **Server Information:** Server ID, name, and member count.
- **Usage Statistics:** Command usage frequency and performance metrics.
- **System Information:** Basic system specs (Node.js version, OS) for troubleshooting.
- **License Data:** HWID and IP address for license verification purposes.

### 🔒 Why We Collect This

This information is used solely to improve the bot's functionality, monitor for errors, and verify that the bot is running with a valid license. We do not sell your data to third parties.

---

## 🚀 Getting Started

Ready to bring Kythia to your server? Here's how to get her up and running.

### ⚙️ Prerequisites

Before running this bot, please ensure you have the following installed:

1. **Node.js** (Node 22 LTS recommended)
2. **npm** (Usually included with Node.js)
3. A Discord bot token from the [Discord Developer Portal](https://discord.com/developers/applications)
4. **Database** such as MySQL, PostgreSQL, MSSQL installed
5. Optional **PM2** for 24/7 hosting run `npm install pm2 -g`

### 📖 Installation Guide

#### 1. Prepare the Requirements

Ensure you have the following software installed:

1. **Node.js**
   - Download and install [Node.js](https://nodejs.org/).
   - Verify installation in your terminal:
     ```bash
     node -v
     npm -v
     ```
     If both versions are displayed, installation was successful.

2. **Discord Bot Token**
   - Visit the [Discord Developer Portal](https://discord.com/developers/applications).
   - Click **New Application**, name your bot, and create it.
   - Navigate to the **Bot** tab, click **Add Bot**, and copy your bot token.

#### 2. Install Dependencies

1. Ensure you are in the project root directory.
2. Install the required libraries:
   ```bash
   npm install
   ```
3. Wait until all dependencies are installed.

#### 3. Configure Environment Variables

1. Copy and rename `example.env` to `.env` file in the project root directory.
2. Copy and rename `example.kythia.config.js` to `kythia.config.js`
3. Configure Your Bot
   Open the `.env` and `kythia.config.js` files. Both files contain detailed comments to guide you in filling out all the required values.

#### 4. Start the Bot

Kythia uses `sharding.js` as its main entry point. This spawns and manages multiple Discord.js shards via `ShardingManager`, with `index.js` acting as the underlying shard worker — **do not run `index.js` directly**.

1. Ensure all configurations are correct.
2. Choose how you want to run the bot:
   - **For a quick test (in foreground):**

     ```bash
     # Using Node.js
     npm run shard

     # Using Bun (faster startup)
     bun run shard
     ```

     _(Press `ctrl + c` to stop the bot)_

   - **For 24/7 Hosting (Recommended):**
     ```bash
     # Run this command ONLY ONCE for the very first time.
     # It will start the bot and save it to PM2's process list.
     npm run pm2:startup
     ```
     _(To manage the bot later, use commands like `npm run pm2:stop` or `npm run pm2:restart`)_

3. If the bot starts successfully, you will see shard status messages followed by:
   ```bash
   ✅ Logged in as Kythia#9135
   ```
4. Check the terminal for any errors.
5. If there are no errors, all shards are running and ready for use.
6. If errors occur, review the relevant files for troubleshooting.

#### 5. Invite the Bot to Your Server

1. Return to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Select your application, then go to the **OAuth2** > **URL Generator** tab.
3. Select the `bot` scope and add the necessary permissions (e.g., `Manage Roles`, `Send Messages`) but `administrator` recommended.
4. Copy the generated URL and open it in your browser to invite the bot to your server.

#### 6. Test the Bot

1. Open your Discord server where the bot has been invited.
2. Type `/ping`, `/help` or `/about` to check the bot's response.
3. Enjoy using Kythia!

#### 🔌 Optional: Dashboard Setup

If you enabled the dashboard in `kythia.config.js`, you **MUST** configure the Redirect URI in the Discord Developer Portal, otherwise login will fail.

1.  Go to [Discord Developer Portal](https://discord.com/developers/applications) > Select your App.
2.  Go to the **OAuth2** tab (General, not URL Generator).
3.  Find the **"Redirects"** section.
4.  Click **Add Redirect** and enter your dashboard callback URL:
    - If on Localhost: `http://localhost:3000/auth/discord/callback`
    - If on VPS (IP): `http://YOUR_VPS_IP:3000/auth/discord/callback`
    - If using Domain: `https://yourdomain.com/auth/discord/callback`
5.  **Save Changes**.
6.  Make sure this URL matches exactly with `API_URL` in your `.env` file (minus the `/auth...` part).

---

## 🎮 Usage

Once Kythia is in your server, you can start using her commands. All commands are slash commands, so just type `/` to see a list of available commands.

Here are a few commands to get you started:

- `/help`: Shows a list of all available commands.
- `/ping`: Checks the bot's latency.
- `/serverinfo`: Displays information about the server.
- `/userinfo`: Displays information about a user.

For a full list of commands and their detailed usage, please see the [Command Documentation](https://portal.kythia.xyz/docs/).

---

## 🙌 Contributing

Contributions to Kythia are managed by the internal development team. If you are a member of the team and would like to contribute, please follow the established development workflow.

- **🐛 Reporting Bugs:** If you find a bug, please report it to the team through the designated channels. Be sure to include as much detail as possible, including steps to reproduce the bug.
- **💡 Suggesting Features:** Have an idea for a new feature? We'd love to hear it! Please share your suggestion with the team.

---

## 📜 License

This project is licensed under the EULA. See the [LICENSE](LICENSE) file for details.
Copyright © 2026 Kythia Labs - All rights reserved.

> [!IMPORTANT]
> **License Required:** Use of this bot requires a valid license from the author. For commercial use or to obtain a license, please contact me at [me@kenndeclouv.com](mailto:me@kenndeclouv.com) OR join official discord server [Discord](https://dsc.gg/kythia)

---

## 💬 Community & Support

Need help or want to connect with other Kythia users? Join our community!

- **🌐 Website:** [kythia.xyz](https://kythia.xyz)
- **🔑 Portal:** [portal.kythia.xyz](https://portal.kythia.xyz)
- **💬 Discord Server:** [dsc.gg/kythia](https://dsc.gg/kythia)
- **📧 Email:** [me@kenndeclouv.com](mailto:me@kenndeclouv.com)

## 🫶 Special Thanks

- **One and only GOD**
- **Lead Illustrators**
  - [rihaadeclouv](https://instagram.com/rihaadeclouv)
- **Contributors**
  - [idMJA](https://github.com/idMJA)
- **Testers**
  - [Naquth](https://github.com/naquth)
  - [Razaeldotexe](https://github.com/razaeldotexe)
  - [Aryandita](https://github.com/Aryandita)
- **Special Mention**
  - [Colly](https://github.com/collygit1)

## 🌟 Star History

<a href="https://www.star-history.com/?repos=kythia%2Fkythia&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=kythia/kythia&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=kythia/kythia&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=kythia/kythia&type=date&legend=top-left" />
 </picture>
</a>
