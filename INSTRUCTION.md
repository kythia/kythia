# KYTHIA BOT

## 📖 Overview

Kythia is a professional Discord bot offering a comprehensive suite of interactive features, including a leveling system, automoderation, and a wide range of slash commands to enhance your Discord server. The leveling system rewards users with experience points (XP) for their activity and grants special roles upon reaching specific levels.

## ⚙️ Prerequisites

Before running this bot, please ensure you have the following installed:

1. **Node.js** (node 22 LTS recomended)
2. **npm** (Usually included with Node.js)
3. A Discord bot token from the [Discord Developer Portal](https://discord.com/developers/applications)
4. **Database** such as MySQL, PostgreSQL, MSSQL installed
5. Optional **PM2** for 24/7 hosting run `npm install pm2 -g`

## 📖 Installation Guide

### 1. Prepare the Requirements

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

### 2. Install Dependencies

1. Ensure you are in the project root directory.
2. Install the required libraries:
   ```bash
   npm install
   ```
3. Wait until all dependencies are installed.

### 3. Configure Environment Variables

1. Copy and rename `example.env` to `.env` file in the project root directory.
2. Copy and rename `example.kythia.config.js` to `kythia.config.js`
3. Configure Your Bot
   Open the `.env` and `kythia.config.js` files. Both files contain detailed comments to guide you in filling out all the required values.

### 4. Start the Bot

1. Ensure all configurations are correct.
2. Choose how you want to run the bot:

   - **For a quick test (in foreground):**

     ```bash
     npm start
     ```

     _(Press `ctrl + c` to stop the bot)_

   - **For 24/7 Hosting (Recommended):**
     ```bash
     # Run this command ONLY ONCE for the very first time.
     # It will start the bot and save it to PM2's process list.
     npm run pm2:startup
     ```
     _(To manage the bot later, use commands like `npm run pm2:stop` or `npm run pm2:restart`)_

3. If the bot starts successfully, you will see a message such as:
   ```bash
   ✅ Logged in as Kythia#9135
   ```
4. Check the terminal for any errors.
5. If there are no errors, the bot is running and ready for use.
6. If errors occur, review the relevant files for troubleshooting.
7. Press `ctrl + c` to stop the bot.

### 5. Invite the Bot to Your Server

1. Return to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Select your application, then go to the **OAuth2** > **URL Generator** tab.
3. Select the `bot` scope and add the necessary permissions (e.g., `Manage Roles`, `Send Messages`) but `administrator` recommended.
4. Copy the generated URL and open it in your browser to invite the bot to your server.

### 6. Test the Bot

1. Open your Discord server where the bot has been invited.
2. Type `/ping`, `/help` or `/about` to check the bot's response.
3. Enjoy using Kythia!

## 🚀 Startup Commands

You can run the bot automatically using [PM2](https://pm2.keymetrics.io/), a process manager for Node.js, which is ideal for keeping your bot online 24/7.

### 📦 Commands

| Command               | Description                                                    |
| --------------------- | -------------------------------------------------------------- |
| `npm run start`       | Run kythia bot without pm2                                     |
| `npm run seed [name]` | Run the seeder to fill the database with                       |
|                       | initial data (e.g., npm run seed pet to add default pet data). |
| `npm run pm2:startup` | start the bot with pm2, and save the process                   |
| `npm run pm2:start`   | Start the bot process with pm2                                 |
| `npm run pm2:restart` | Restart the bot process with pm2                               |
| `npm run pm2:stop`    | Stop the bot process with pm2                                  |
| `npm run pm2:delete`  | Remove the bot process from pm2                                |
| `npm run pm2:logs`    | View real-time logs for the bot process managed by pm2         |
|                       |                                                                |

> Please ensure you have installed all dependencies with `npm install` before running any commands.

---

For more information, please visit the [Kythia website](https://kythia.my.id) or contact support [me@kenn.my.id](me@kenn.my.id).