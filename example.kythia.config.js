/**
 * ===================================================================
 *         KYTHIA BOT CONFIGURATION (kythia.config.js)
 * ===================================================================
 *
 * INSTRUCTIONS:
 * 1. Ensure your environment variables are set in a `.env` file at the project root.
 *    - You can copy `.env.example` and fill in your values.
 *    - This config file reads from `process.env` (populated by dotenv or your process manager).
 * 2. Do NOT commit your real `.env` file to version control.
 * 3. All configuration values are loaded into the `kythia` object below.
 *    - Default values are provided where appropriate.
 *    - For sensitive values (tokens, secrets), always use environment variables.
 * 4. If you add new configuration keys, document them clearly and update `.env.example`.
 *
 * ===================================================================
 */

function loadKythiaConfig() {
    return {
        /** -------------------------------------------------------------------
         * I. GENERAL SETTINGS
         * ------------------------------------------------------------------- */
        env: 'local',
        // Bot version
        version: require('./package.json').version,
        // Bot owner
        owner: {
            // Discord User ID of the bot owner (for owner-only commands)
            // can be multiple, seperate with comma (eg: 1158654757183959091,1358351229771710565)
            ids: '1158654757183959091',
            // Display name of the owner
            // can be multiple, seperate with comma (eg: kenndeclouv,kenoura_)
            names: 'kenndeclouv',
        },
        /**
         * Sentry for error logging
         * get your dsn at: https://sentry.io/
         * add your dsn in .env
         * SENTRY_DSN=your_dsn
         * if you don't have sentry, you can leave it empty
         */
        sentry: {
            dsn: process.env.SENTRY_DSN,
        },
        /** -------------------------------------------------------------------
         * II. DISCORD BOT CORE SETTINGS
         * ------------------------------------------------------------------- */
        bot: {
            // Bot name
            name: 'Kythia',
            // Discord bot token (keep this secret!)
            token: process.env.DISCORD_BOT_TOKEN,
            // Discord application client ID
            clientId: process.env.DISCORD_BOT_CLIENT_ID,
            // Discord application client secret (keep this secret!)
            clientSecret: process.env.DISCORD_BOT_CLIENT_SECRET,

            /* Total shards
             * shard is system to distribute the bot to multiple servers
             * you can set it to 'auto' to let discord decide the best number of shards
             * or you can set it to a specific number of shards
             */
            totalShards: 'auto',

            // guild id for main server
            mainGuildId: '',
            // guild id for dev server
            devGuildId: '',

            // Bot embed color (hex)
            color: '#FFFFFF',
            // Command prefixes, you can change it to your own prefixes
            prefixes: ['!', 'k!'],

            // Bot status (e.g., 'online', 'idle', 'dnd')
            status: 'online',
            // Activity type (e.g., 'Playing', 'Watching', 'Listening', 'Custom')
            activityType: 'Playing',
            // Activity text shown in Discord
            activity: 'Minecraft with kenndeclouv',

            // Global cooldown in seconds
            globalCommandCooldown: 5,

            // Bot language
            language: 'en',
            // Bot locale
            locale: 'en-US',
            // Bot timezone
            // list of timezone: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
            timezone: 'Asia/Jakarta',
        },

        /** -------------------------------------------------------------------
         * III. DATABASE CONFIGURATION
         * ------------------------------------------------------------------- */
        db: {
            // Database dialect/driver ('mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle')
            driver: process.env.DB_DRIVER || 'mysql',
            // Database host (IP or hostname)
            host: process.env.DB_HOST || 'localhost',
            // Database port (string or number, as per your DB)
            port: process.env.DB_PORT,
            // Database name
            name: process.env.DB_NAME || 'kythia',
            // Database username
            user: process.env.DB_USER || 'root',
            // Database password
            password: process.env.DB_PASSWORD || '',
            // Optional: For SQLite, path to storage file
            storagePath: process.env.DB_STORAGE_PATH,
            // Optional: For MySQL/MariaDB, Unix socket path
            socketPath: process.env.DB_SOCKET_PATH,
            // Optional: For MSSQL, extra dialect options (JSON string)
            dialectOptions: process.env.DB_DIALECT_OPTIONS,

            // Optional: For MySQL/MariaDB, timezone
            timezone: '+07:00',
            // Optional: For Redis, Redis URL
            redis: process.env.REDIS_URL || 'redis://localhost:6379',

            // Optional: For Redis, Redis cache version
            redisCacheVersion: 'v1.0',
        },

        /** -------------------------------------------------------------------
         * IV. TURN ADDONS ON/OFF (the default is all addons are on)
         * for example: addons: { nsfw: false, music: true }
         * you can turn it all off by addons: { all: false }
         * you can leave it empty if you dont have any addon
         * ------------------------------------------------------------------- */
        addons: {
            all: {
                active: true,
            },
            adventure: {
                active: true,
            },
            /** -------------------------------------------------------------------
             * AI ADDON (Google Gemini)
             * get your api key at: https://aistudio.google.com/apikey
             * ------------------------------------------------------------------- */
            ai: {
                active: true,
                // gemini ai model
                // list of models: https://ai.google.dev/gemini-api/docs/models
                model: 'gemini-2.5-flash',
                // Comma-separated list of Gemini API keys (example: your_api_key_1,your_api_key_2,your_api_key_3)
                geminiApiKeys: process.env.GEMINI_API_KEYS,
                // ai read message history length
                getMessageHistoryLength: 4,
                // ai per minute limit
                // https://ai.google.dev/gemini-api/docs/rate-limits
                perMinuteAiLimit: 10,
                // allowed / command to use by ai
                safeCommands: ['ping', 'avatar'],
                // additional command keywords
                additionalCommandKeywords: ['setting', 'musik', 'latency', 'latensi'],
                // ai persona prompt
                personaPrompt: `You are Kythia, a friendly and helpful Discord assistant. You are cheerful, polite, and always ready to assist users with their questions. Your creator is kenndeclouv.`,
                // owner interaction prompt
                ownerInteractionPrompt: `kenndeclouv (1158654757183959091) is your developer.`,
                // daily greeter
                dailyGreeter: false,
                // daily greeter schedule
                // format: https://crontab.guru/
                dailyGreeterSchedule: '0 7 * * *',
                // daily greeter prompt
                dailyGreeterPrompt: `
                    Make a warm greeting for the members.
                `,
            },
            checklist: {
                active: true,
            },
            core: {
                active: true,
            },
            /** -------------------------------------------------------------------
             * DASHBOARD ADDON
             * ------------------------------------------------------------------- */
            dashboard: {
                active: true,
                // Dashboard base URL (for local dev, usually http://localhost:3000)
                url: process.env.DASHBOARD_URL || 'http://localhost:3000',
                // Dashboard port (default: 3000)
                port: process.env.DASHBOARD_PORT || 3000,
                // Session secret for dashboard authentication (keep this secret!)
                sessionSecret: process.env.DASHBOARD_SESSION_SECRET,
            },
            fun: {
                active: true,
                // wordle
                wordle: {
                    // lists of wordle words
                    words: ['apple', 'grape', 'lemon', 'mango', 'peach', 'berry', 'melon', 'guava'],
                },
            },
            giveaway: {
                active: true,
                // giveaway check interval in second
                checkInterval: 20,
            },
            invite: {
                active: true,
            },
            leveling: {
                active: true,
            },
            minecraft: {
                active: false,
            },
            /** -------------------------------------------------------------------
             * MUSIC ADDON (Lavalink & Spotify)
             * ------------------------------------------------------------------- */
            music: {
                active: true,
                // default music platform
                defaultPlatform: 'ytsearch',
                // use AI for lyrics feature
                useAI: true,
                // playlist limit
                playlistLimit: 3,
                // autocomplete limit when using /music play search:
                autocompleteLimit: 5,
                // suggestion limit in music ambed
                suggestionLimit: 7,
                /**
                 * use Spotify for music feature
                 * required lavalink client, you can get it at: https://github.com/freyacodes/Lavalink
                 * use lavalink version 4.1.1
                 * with plugin:
                 * - lavasrc-plugin-4.8.0
                 * - youtube-plugin-1.13.5
                 * - lavasearch-plugin-1.0.0
                 * - sponsorblock-plugin-3.0.1
                 */
                lavalink: {
                    // Comma-separated list of Lavalink hosts (example: localhost,localhost:2333,localhost:2334)
                    hosts: process.env.LAVALINK_HOSTS || 'localhost',
                    // Comma-separated list of Lavalink ports (example: 2333,2334,2335)
                    ports: process.env.LAVALINK_PORTS || '2333',
                    // Comma-separated list of Lavalink passwords (example: youshallnotpass,youshallnotpass2,youshallnotpass3)
                    passwords: process.env.LAVALINK_PASSWORDS || 'youshallnotpass',
                    // Comma-separated list of 'true'/'false' for secure (SSL) connections (example: true,false,true)
                    secures: process.env.LAVALINK_SECURES || 'false',
                },
                spotify: {
                    // Spotify API client ID
                    // get yours at: https://developer.spotify.com/
                    clientId: process.env.SPOTIFY_CLIENT_ID,
                    // Spotify API client secret
                    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
                },
                audd: {
                    // Audd.io API key for lyrics feature
                    // get yours at: https://audd.io/
                    apiKey: process.env.AUDD_API_KEY,
                },
                artworkUrlStyle: 'banner', // thumbnail, banner
            },
            nsfw: {
                active: true,
            },
            nuke: {
                active: true,
            },
            pet: {
                active: true,
            },
            pterodactyl: {
                active: true,
            },
            server: {
                active: true,
            },
            store: {
                active: true,
            },
            streak: {
                active: true,
            },
            suggestion: {
                active: true,
            },
            testimony: {
                active: true,
            },
            ticket: {
                active: true,
            },
        },

        /** -------------------------------------------------------------------
         * VIII. WEBHOOKS & API
         * ------------------------------------------------------------------- */
        api: {
            // Webhook for guild invite/leave events
            webhookGuildInviteLeave: process.env.WEBHOOK_GUILD_INVITE_LEAVE,
            // Webhook for error logging
            webhookErrorLogs: process.env.WEBHOOK_ERROR_LOGS,
            // topgg for vote, require dashboard addon
            topgg: {
                authToken: process.env.TOPGG_AUTH_TOKEN,
                apiKey: process.env.TOPGG_API_KEY,
            },
            // Webhook for vote logging
            webhookVoteLogs: process.env.WEBHOOK_VOTE_LOGS,
        },

        /** -------------------------------------------------------------------
         * IX. MISCELLANEOUS SETTINGS
         * ------------------------------------------------------------------- */
        settings: {
            // all / warn,error,info,debug
            logConsoleFilter: 'all',
            // Log format
            // none, HH:mm:ss, HH:mm:ss.SSS
            // more see at https://date-fns.org/v4.1.0/docs/format
            logFormat: 'HH:mm:ss',
            // Support server invite link
            supportServer: 'https://dsc.gg/kythia',
            // Bot invite link (auto-generated from client ID)
            inviteLink: `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_BOT_CLIENT_ID}&scope=bot%20applications.commands&permissions=8`,
            // Owner's website
            ownerWeb: 'https://kenndeclouv.me',
            // Kythia website
            kythiaWeb: 'https://kythia.my.id',
            // Banner image URL for embeds or dashboard
            // you can host it on your own server
            // or you can use a CDN like Cloudflare Images/ imagekit/ etc
            bannerImage: 'https://kythia.png',
            // link to error status page
            statusPage: 'https://status.kythia.my.id',
            // webhook notification when error on or off
            webhookErrorLogs: false,
            // webhook kythia invite or leave guild on or off
            webhookGuildInviteLeave: true,
            // automod spam threshold
            spamThreshold: 7,
            // automod duplicate message threshold
            duplicateThreshold: 5,
            // automod mention threshold
            mentionThreshold: 4,
            // automod fast message window
            fastTimeWindow: 40 * 1000, // 40 seconds
            duplicateTimeWindow: 15 * 60 * 1000, // 15 minutes
            cacheExpirationTime: 15 * 60 * 1000, // 15 minutes
            // automod punishment cooldown
            punishmentCooldown: 1 * 1000, // 1 second
        },
        /** -------------------------------------------------------------------
         * X. EMOJIS
         * ------------------------------------------------------------------- */
        emojis: {
            // music emojis
            musicPlayPause: '<:name:id>',
            musicPlay: '<:name:id>',
            musicPause: '<:name:id>',
            musicSkip: '<:name:id>',
            musicStop: '<:name:id>',
            musicLoop: '<:name:id>',
            musicAutoplay: '<:name:id>',
            musicLyrics: '<:name:id>',
            musicQueue: '<:name:id>',
            musicShuffle: '<:name:id>',
            musicFilter: '<:name:id>',
            musicFavorite: '<:name:id>',
        },
    };
}

const initialConfig = loadKythiaConfig();

global.kythia = initialConfig;

module.exports = initialConfig;
module.exports.loadKythiaConfig = loadKythiaConfig;
