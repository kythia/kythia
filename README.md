<p align="center">
  <a href="https://kythia.my.id">
    <img src="./addons/dashboard/web/public/assets/img/logo/logo.png" alt="Kythia Logo" height="150" style="border-radius: 10px;">
  </a>
</p>

<h1 align="center">
  Kythia - Your Cutest Discord Companion
</h1>

<p align="center">
  <strong>Kythia Hye-Jin is more than just a bot; she's your sweet, cute, and beautiful companion, designed to bring life and order to your Discord server!</strong>
</p>

<p align="center">
  <a href="https://github.com/kenndeclouv/kythia/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-CC%20BYNC%204.0-blue?style=for-the-badge" alt="License"></a>
</p>

<p align="center">
  <a href="https://github.com/kenndeclouv/kythia/issues">Report a Bug</a>
  ·
  <a href="https://github.com/kenndeclouv/kythia/issues">Request a Feature</a>
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

### 🛡️ Core Features (from the `core` addon)

*   **Advanced Moderation:** A full suite of moderation commands, including `ban`, `kick`, `mute`, `warn`, `clear`, and more.
*   **Automod:** Automatically delete messages containing spam, bad words, or other unwanted content.
*   **Logging:** Keep track of everything that happens on your server with detailed logs for message deletions, member joins, and more.
*   **Customizable Settings:** Configure the bot's prefix, welcome messages, and other settings to your liking.
*   **Powerful Tools:** A variety of tools to help you manage your server, such as `sticky` messages, `embed` builders, and `hash` crackers.

### 🎉 Engagement & Fun

*   **Adventure Game (`adventure`):** Embark on an epic text-based adventure, fight monsters, and collect loot!
*   **Economy System (`economy`):** Earn virtual currency, rob your friends, and gamble your way to riches.
*   **Music (`music`):** Listen to your favorite tunes with a feature-rich music player.
*   **Pets (`pet`):** Adopt and raise your own virtual pet.
*   **NSFW (`nsfw`):** For the more... adventurous servers.
*   **And more!** Including `fun` games, `giveaways`, and `streaks`.

### 🚀 Server Management & Utility

*   **Ticket System (`ticket`):** A complete ticket system to help you manage user support requests.
*   **Suggestions (`suggestion`):** Allow users to submit suggestions and vote on their favorites.
*   **Clan System (`clan`):** Create and manage clans for your server members.
*   **Leveling System (`leveling`):** Reward your users for their activity with a customizable leveling system.
*   **And much more!** Including `invite` tracking, `server` templates, and `pterodactyl` integration.

### ✨ And Many More Addons!

Kythia comes with a huge collection of addons, including:

*   `ai`
*   `checklist`
*   `dashboard`
*   `minecraft`
*   `nuke`
*   `store`
*   `testimony`

...and the list is always growing!

---

## 🤔 Why Kythia?

There are many Discord bots out there, but Kythia stands out from the crowd. Here's why:

*   **🤖 Modular by Design:** Kythia is built on a powerful addon system, allowing you to enable only the features you need. This keeps the bot lightweight and efficient.
*   **✨ Feature-Rich:** With a massive collection of addons, Kythia offers a huge range of features, from advanced moderation to fun games and a full-fledged economy system.
*   **🔧 Fully Customizable:** Almost every aspect of Kythia can be configured to your liking. From custom welcome messages to fine-tuned automod settings, you're in control.
*   **🚀 Actively Developed:** Kythia is constantly being improved with new features, bug fixes, and performance enhancements.

---

## 🚀 Getting Started

Ready to bring Kythia to your server? Here's how to get her up and running.

### ✅ Prerequisites

Before you begin, make sure you have the following installed:

*   **Node.js:** (v22 LTS recommended)
*   **npm:** (usually included with Node.js)
*   **A database:** MySQL, PostgreSQL, or MSSQL
*   **PM2 (optional):** For 24/7 hosting. Install with `npm install pm2 -g`.

### 📝 Installation

1.  **Get the code:** Clone this repository to your local machine.
2.  **Install dependencies:** Open a terminal in the project's root directory and run:
    ```bash
    npm install
    ```
3.  **Configure your bot:**
    *   Rename `example.env` to `.env`.
    *   Rename `example.kythia.config.js` to `kythia.config.js`.
    *   Open both files and fill in the required values. The comments will guide you!
4.  **Start the bot:**
    *   For a quick test, run:
        ```bash
        npm start
        ```
    *   For 24/7 hosting, use PM2:
        ```bash
        npm run pm2:startup
        ```
5.  **Invite Kythia to your server:**
    *   Go to the [Discord Developer Portal](https://discord.com/developers/applications).
    *   Select your application, then go to **OAuth2 > URL Generator**.
    *   Select the `bot` scope and `administrator` permissions.
    *   Copy the generated URL and open it in your browser.

That's it! Kythia should now be online and ready to go.

---

## 🎮 Usage

Once Kythia is in your server, you can start using her commands. All commands are slash commands, so just type `/` to see a list of available commands.

Here are a few commands to get you started:

*   `/help`: Shows a list of all available commands.
*   `/ping`: Checks the bot's latency.
*   `/serverinfo`: Displays information about the server.
*   `/userinfo`: Displays information about a user.

For a full list of commands and their detailed usage, please see the [Command Documentation](https://kythia.my.id/commands).

---

## 🙌 Contributing

Contributions to Kythia are managed by the internal development team. If you are a member of the team and would like to contribute, please follow the established development workflow.

*   **🐛 Reporting Bugs:** If you find a bug, please report it to the team through the designated channels. Be sure to include as much detail as possible, including steps to reproduce the bug.
*   **💡 Suggesting Features:** Have an idea for a new feature? We'd love to hear it! Please share your suggestion with the team.

---

## 📜 License

This project is licensed under the CC BY-NC 4.0 License. See the [LICENSE](LICENSE) file for details.

---

## 💬 Community & Support

Need help or want to connect with other Kythia users? Join our community!

*   **🌐 Website:** [kythia.my.id](https://kythia.my.id)
*   **💬 Discord Server:** [dsc.gg/kythia](https://dsc.gg/kythia)
*   **📧 Email:** [me@kenn.my.id](mailto:me@kenn.my.id)
