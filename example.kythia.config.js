/**
 * ===================================================================
 *         KYTHIA BOT CONFIGURATION (kythia.config.js)
 * ===================================================================
 *
 * 📋 SETUP INSTRUCTIONS:
 *
 * 1. Copy this file and rename it to 'kythia.config.js' (remove 'example.')
 * 2. Ensure your .env file is properly configured first (see example.env)
 * 3. Review the settings below and adjust as needed for your bot
 * 4. Most settings have sensible defaults - you don't need to change everything!
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ⚠️  IMPORTANT - READ THIS BEFORE ASKING FOR HELP ⚠️
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 *   🚫 BASIC SETUP SUPPORT POLICY:
 *
 *   Questions about basic configuration values WILL NOT BE ANSWERED.
 *   ALL SETTINGS ARE DOCUMENTED IN THIS FILE WITH EXAMPLES.
 *
 *   👉 RTFM (Read The F*cking Manual) 👈
 *
 *   If you cannot understand the clear comments and examples here,
 *   this bot is not for you. No exceptions.
 *
 *   Advanced technical questions are welcome in Discord.
 *   Basic configuration questions will be ignored.
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 🆘 RESOURCES:
 *   - Discord Server (Advanced Support Only): https://dsc.gg/kythia
 *   - Documentation: https://portal.kythia.xyz/docs
 *   - README.md: Read it thoroughly before asking anything
 *
 * ⚠️  IMPORTANT NOTES:
 *   - This config reads environment variables from your .env file
 *   - Sensitive values (tokens, secrets) should ONLY be in .env, never here
 *   - Do NOT commit this file with your personal values to version control
 *   - Most settings have defaults - only change what you need
 *
 * ===================================================================
 */

function loadKythiaConfig() {
	return {
		/** -------------------------------------------------------------------
		 * I. GENERAL SETTINGS
		 * ------------------------------------------------------------------- */
		// Environment (usually 'local' for self-hosted)
		env: 'local',

		// Bot version (automatically loaded from package.json - DO NOT CHANGE)
		version: require('./package.json').version,

		// License key from .env (get from https://dsc.gg/kythia)
		licenseKey: process.env.LICENSE_KEY,

		/** ⚠️  CRITICAL - LEGAL ACCEPTANCE REQUIRED ⚠️
		 * Read the Terms of Service at https://kythia.xyz/tos
		 *
		 * YOU MUST SET BOTH VALUES TO true TO USE THE BOT:
		 * - acceptTOS: true     (Accept Terms of Service)
		 * - dataCollection: true (Accept telemetry data collection)
		 *
		 * THE BOT WILL NOT START IF BOTH ARE NOT SET TO true!
		 */
		legal: {
			acceptTOS: false, // ⚠️  CHANGE THIS TO true
			dataCollection: false, // ⚠️  CHANGE THIS TO true
		},

		/** Bot Owner Configuration
		 * IMPORTANT: Change this to YOUR Discord User ID!
		 * How to get your Discord ID:
		 *   1. Enable Developer Mode in Discord (Settings > Advanced > Developer Mode)
		 *   2. Right-click your username anywhere and select "Copy User ID"
		 */
		owner: {
			// Your Discord User ID
			// Can be multiple owners: '123456789,987654321'
			ids: '1158654757183959091',

			// Your display name (shown in bot info)
			// Can be multiple names: 'owner1,owner2'
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
			activity: 'join support https://dsc.gg/kythia',

			// Global cooldown in seconds
			globalCommandCooldown: 5,

			// minimum members required to stay in a server (0 = disabled)
			minMembers: 0,

			// Bot language
			language: 'en',
			// Bot locale
			locale: 'en-US',
			// Bot timezone
			// list of timezone: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
			timezone: 'Asia/Jakarta',

			// if your bot has an entry point (the activity launch command), set this to true
			// https://discord.com/developers/applications/<client-id>/embedded/settings
			hasActivityEntryPoint: false,
		},

		/** -------------------------------------------------------------------
		 * III. DATABASE CONFIGURATION
		 * ------------------------------------------------------------------- */
		db: {
			// Database dialect/driver ('mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle')
			driver: process.env.DB_DRIVER,
			// Database host (IP or hostname)
			host: process.env.DB_HOST,
			// Database port (string or number, as per your DB)
			port: process.env.DB_PORT,
			// Database name
			name: process.env.DB_NAME,
			// Database username
			user: process.env.DB_USER,
			// Database password
			pass: process.env.DB_PASSWORD,
			// Optional: For SQLite, path to storage file
			storagePath: process.env.DB_STORAGE_PATH,
			// Optional: For MySQL/MariaDB, Unix socket path
			socketPath: process.env.DB_SOCKET_PATH,
			// Optional: For MSSQL, extra dialect options (JSON string)
			dialectOptions: process.env.DB_DIALECT_OPTIONS,

			// Optional: For MySQL/MariaDB, timezone
			timezone: '+07:00',

			// ! WARNING
			// its very recommended to use redis for cache
			// some features will not work without redis
			useRedis: true,
			// For Redis, Redis URL
			redis: process.env.REDIS_URLS,

			// Optional: For Redis, Redis cache version
			redisCacheVersion: 'v1.0',
		},

		/** -------------------------------------------------------------------
		 * IV. ADDON CONFIGURATION - Enable/Disable Features
		 * -------------------------------------------------------------------
		 * QUICK GUIDE:
		 *   - Set 'active: true' to enable an addon
		 *   - Set 'active: false' to disable an addon
		 *   - Disabled addons won't load, saving memory
		 *   - Some addons require additional .env configuration (noted below)
		 *
		 * 💡 TIP: Start with all addons enabled, then disable what you don't need
		 * ------------------------------------------------------------------- */
		addons: {
			all: {
				// turn it on or off
				active: true,
			},
			activity: {
				active: true,
			},
			adventure: {
				active: true,
			},
			/** -------------------------------------------------------------------
			 * AI ADDON - Google Gemini AI Chat
			 * -------------------------------------------------------------------
			 * REQUIREMENTS:
			 *   - Set GEMINI_API_KEYS in .env
			 *   - Get free API keys at: https://aistudio.google.com/apikey
			 * ------------------------------------------------------------------- */
			ai: {
				active: true,
				// gemini ai model
				// list of models: https://ai.google.dev/gemini-api/docs/models
				// ! IMPORTANT!
				// USE AT LEAST GEMINI 3 flash preview
				// as the google search and function calling is supported in gemini 3 flash preview above
				model: 'gemini-3-flash-preview',
				// ! IMPORTANT!
				// use for non tool-heavy messages
				liteModel: 'gemini-2.5-flash-lite',
				// Comma-separated list of Gemini API keys (example: your_api_key_1,your_api_key_2,your_api_key_3)
				geminiApiKeys: process.env.GEMINI_API_KEYS,
				// groq ai api key
				// use for deciding the context for gemini
				// if you don't have it, you can get it for free at: https://console.groq.com/keys
				groqApiKey: process.env.GROQ_API_KEY,
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
				/**
				 * Default personality for new users (can be changed by users with /ai personality)
				 * Options: 'friendly', 'professional', 'humorous', 'technical', 'casual'
				 * @default 'friendly'
				 */
				defaultPersonality: 'friendly',
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
				// owner bypass filter
				ownerBypassFilter: true,

				// gemini imagen model, only can if your project is active billed
				imagenModel: 'gemini-3.1-flash-image-preview',
				imagenLimit: 2,
				imagenApiKeys: process.env.GEMINI_IMAGEN_API_KEYS,
			},
			/** -------------------------------------------------------------------
			 * API/DASHBOARD ADDON - Web Dashboard Interface
			 * -------------------------------------------------------------------
			 * REQUIREMENTS:
			 *   - Set API_SECRET, API_URL, API_PORT in .env
			 *   - Configure OAuth2 Redirect URI in Discord Developer Portal
			 *   - See example.env for detailed setup instructions
			 *
			 * ! DISCONTINUED
			 * Dashboard repo: https://github.com/kenndeclouv/kythia-dashboard
			 * ------------------------------------------------------------------- */
			api: {
				active: true,
				// API URL
				url: process.env.API_URL,
				// API port (default: 3000)
				port: process.env.API_PORT || 3000,
				// Session secret for dashboard authentication (keep this secret!)
				secret: process.env.API_SECRET,
				// Allowed origins for CORS (comma-separated list)
				allowedOrigin: process.env.API_ALLOWED_ORIGIN,
			},
			automod: {
				active: true,
			},
			autoreact: {
				active: true,
			},
			autoreply: {
				active: true,
			},
			birthday: {
				active: true,
			},
			booster: {
				active: true,
			},
			checklist: {
				active: true,
			},
			core: {
				active: true,
				// exchangerate api key for currency conversion
				// get yours at: https://manage.exchangeratesapi.io/signup/free
				exchangerateApi: process.env.EXCHANGERATE_API,
			},
			economy: {
				active: true,
				// economy cooldown in second
				dailyCooldown: 86400, // 1 day
				begCooldown: 3600, // 1 hour
				lootboxCooldown: 14400, // 4 hours
				workCooldown: 28800, // 8 hours
				robCooldown: 7200, // 2 hours
				hackCooldown: 3600, // 1 hour
			},
			embedBuilder: {
				active: false,
			},
			fun: {
				active: true,
				// wordle
				wordle: {
					// lists of wordle words
					words: [
						'apple',
						'grape',
						'lemon',
						'mango',
						'peach',
						'berry',
						'melon',
						'guava',
					],
				},
			},
			giveaway: {
				active: true,
				// giveaway check interval in second
				checkInterval: 20,
			},
			globalchat: {
				// ! WARN
				// this feature is kythia's internal only
				// collaborate with TronixDev https://dsc.gg/trnx
				active: false,
				apiUrl: process.env.GLOBAL_CHAT_API_URL,
				healthCheckSchedule: '*/30 * * * *',
				healthCheckDelay: 1000,
				apiKey: process.env.GLOBAL_CHAT_API_KEY,
			},
			globalvoice: {
				// ! WARN
				// this feature is kythia's internal only
				active: false,
				apiUrl: process.env.GLOBAL_VOICE_API_URL,
				apiKey: process.env.GLOBAL_VOICE_API_KEY,
			},
			image: {
				// ! WARN
				// need to setup cloudflare r2 first
				active: false,
				accountId: process.env.R2_ACCOUNT_ID,
				accessKeyId: process.env.R2_ACCESS_KEY_ID,
				secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
				bucketName: process.env.R2_BUCKET_NAME,
				publicUrl: process.env.R2_PUBLIC_URL,
			},
			invite: {
				active: true,
			},
			leveling: {
				active: true,
				backgroundUrl: 'https://placehold.co/800x250.png',
			},
			minecraft: {
				active: true,
			},
			modmail: {
				active: true,
				reopenCooldownMs: 300000, // 5 minutes
				prefix: '=',
			},
			/** -------------------------------------------------------------------
			 * MUSIC ADDON - Lavalink Music Player
			 * -------------------------------------------------------------------
			 * REQUIREMENTS:
			 *   - Setup Lavalink server (see example.env for details)
			 *   - Set LAVALINK_* variables in .env
			 *   - Optional: Spotify (SPOTIFY_CLIENT_ID/SECRET)
			 *
			 * 💡 Free Lavalink available in Kythia Discord: https://dsc.gg/kythia
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
				 * required lavalink client, you can get it at: https://github.com/lavalink-devs/Lavalink
				 * use lavalink version 4.1.1
				 * with plugin:
				 * - lavasrc-plugin-4.8.1
				 * - youtube-plugin-1.16.0 (with yt-cipher)
				 * - lavasearch-plugin-1.0.0
				 * - sponsorblock-plugin-3.0.1
				 *
				 * OR you can just join kythia's server, there's many updates and free lavalink too
				 * https://discord.com/invite/RK6WYM2GAq
				 * https://discord.com/users/1158654757183959091
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
				artworkUrlStyle: 'banner', // thumbnail, banner
			},
			nsfw: {
				// ! WARN: DANGER ZONE! 🔞
				// By setting this to `true`, you fully acknowledge and accept ALL the risks involved.
				// This includes your server getting nuked by Discord, getting raided by members,
				// and most importantly, the ETERNAL SINS YOU WILL CARRY ON YOUR OWN SHOULDERS
				// Kythia and the Developer hold zero responsibility for your actions.
				active: false,
			},
			pet: {
				active: true,
				useCooldown: 28800, // 8 hours
				gachaCooldown: 3600, // 1 hours
			},
			pro: {
				active: false, // activate if u have setup the cloudflare api
				cloudflare: {
					/**
					 * API Token created from the Cloudflare dashboard.
					 * REQUIRED: Use "Create Token", DO NOT use "Global API Key".
					 * Taken from .env
					 */
					token: process.env.CLOUDFLARE_API_TOKEN,

					/**
					 * Zone ID of your domain in Cloudflare.
					 * Taken from .env
					 */
					zoneId: process.env.CLOUDFLARE_ZONE_ID,

					/**
					 * Primary domain name used for this feature
					 * (e.g., 'kyth.me')
					 */
					domain: process.env.CLOUDFLARE_DOMAIN,
				},
				maxSubdomains: 5,
			},
			quest: {
				// ! WARNING
				// host your own quest api
				// see my repo https://github.com/kenndeclouv/kythia-quest-api
				// ! IMPORTANT NOTE: the quest api need user token to work
				// and using user token is violation of discord's terms of service
				// so it's dangerously to use it
				active: false, // activate if u have setup the quest api
				scheduler: '*/30 * * * *', // cron scheduler https://crontab.guru/
				apiUrls: process.env.QUEST_API_URLS, // seperate with comma
			},
			reactionRole: {
				active: true,
			},
			server: {
				active: true,
			},
			socialAlerts: {
				active: true,
				youtubeApiKey: process.env.YOUTUBE_API_KEY,
				rsshubUrl: process.env.RSSHUB_URL || 'https://rsshub.app', // Used for TikTok RSS feeds
				tiktokClientKey: process.env.TIKTOK_CLIENT_KEY,
				tiktokClientSecret: process.env.TIKTOK_CLIENT_SECRET,
			},
			streak: {
				active: true,
			},
			tempvoice: {
				active: true,
			},
			ticket: {
				active: true,
			},
			verification: {
				active: true,
			},
			welcomer: {
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
			startup: 'full', // full, minimum
			// all / warn,error,info,debug
			logConsoleFilter: 'all',
			// error,warn
			webhookLogFilter: 'error,warn',
			// Log format
			// none, HH:mm:ss, HH:mm:ss.SSS
			// more see at https://date-fns.org/v4.1.0/docs/format
			logFormat: 'HH:mm:ss',
			// Support server invite link
			supportServer: 'https://dsc.gg/kythia',
			// Bot invite link (auto-generated from client ID)
			inviteLink: `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_BOT_CLIENT_ID}&scope=bot%20applications.commands&permissions=8`,
			// Owner's website
			ownerWeb: 'https://kenndeclouv.com',
			// Kythia website
			kythiaWeb: 'https://kythia.xyz',

			patreon: 'https://patreon.com/cw/kythia',

			// Banner image URL for embeds or dashboard
			// you can host it on your own server
			// or you can use a CDN like Cloudflare Images/ imagekit/ etc
			bannerImage: 'https://placehold.co/800x300.png?text=Banner',
			voteBannerImage: 'https://placehold.co/800x300.png?text=Vote+Banner',
			gcBannerImage: 'https://placehold.co/800x300.png?text=Global+Chat+Banner',
			statsBannerImage: 'https://placehold.co/800x300.png?text=Stats+Banner',
			helpBannerImage: 'https://placehold.co/800x300.png?text=Help+Banner',
			aboutBannerImage: 'https://placehold.co/800x300.png?text=About+Banner',
			tempvoiceBannerImage:
				'https://placehold.co/800x300.png?text=Temp+Voice+Banner',
			ticketBannerImage: 'https://placehold.co/800x300.png?text=Ticket+Banner',
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
			shortMessageThreshold: 5,
			// automod punishment cooldown
			punishmentCooldown: 1 * 1000, // 1 second

			// owner can skip all cooldown like in ecomony or pet
			ownerSkipCooldown: true,

			antiAllCapsMinLength: 15,
			antiAllCapsRatio: 0.7,
			antiEmojiMinTotal: 11,
			antiEmojiRatio: 0.8,
			antiZalgoMin: 8,
		},
		/** -------------------------------------------------------------------
		 * X. EMOJIS
		 * ------------------------------------------------------------------- */
		emojis: {
			// stats emojis
			stats: {
				statistic: '📊',
				technology: '🤖',
				connection: '🌐',
				cache: '💾',
				owner: '👑',
			},
			// music emojis
			// can use regular emoji like ▶️ ⏯️
			// or custom emoji like <:name:id>
			music: {
				playPause: '⏯️',
				play: '▶️',
				pause: '⏸️',
				skip: '⏭️',
				stop: '⏹️',
				loop: '🔁',
				autoplay: '🎶',
				lyrics: '📝',
				queue: '📜',
				shuffle: '🔀',
				filter: '🎚️',
				favorite: '❤️',
				back: '⏮️',
			},

			// tempvoice emojis
			tempvoice: {
				rename: '⌨️',
				limit: '👥',
				privacy: '🛡️',
				waiting: '⏲️',
				stage: '🎙️',
				trust: '🤝',
				untrust: '✂️',
				invite: '📞',
				kick: '👢',
				region: '🌐',
				block: '🚫',
				unblock: '🟢',
				claim: '👑',
				transfer: '🔁',
				delete: '🗑️',
			},
		},
	};
}

function isObject(item) {
	return item && typeof item === 'object' && !Array.isArray(item);
}

function mergeDeep(target, ...sources) {
	if (!sources.length) return target;
	const source = sources.shift();

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key]) Object.assign(target, { [key]: {} });
				mergeDeep(target[key], source[key]);
			} else {
				Object.assign(target, { [key]: source[key] });
			}
		}
	}
	return mergeDeep(target, ...sources);
}

let initialConfig = loadKythiaConfig();

try {
	const fs = require('node:fs');
	const path = require('node:path');
	const dynamicPath = path.join(__dirname, 'kythia.dynamic.json');
	if (fs.existsSync(dynamicPath)) {
		const dynamicConfig = JSON.parse(fs.readFileSync(dynamicPath, 'utf8'));
		initialConfig = mergeDeep(initialConfig, dynamicConfig);
	}
} catch (e) {
	// biome-ignore lint/suspicious/noConsole: dynamic override no need to logging it
	console.error('[Config] Failed to apply dynamic overrides:', e.message);
}

// Enforce the configured timezone across the entire Node.js process (affects cron, Date, etc.)
if (initialConfig.bot?.timezone) {
	process.env.TZ = initialConfig.bot.timezone;
}

global.kythia = initialConfig;

module.exports = initialConfig;
module.exports.loadKythiaConfig = loadKythiaConfig;
