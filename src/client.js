const { GatewayIntentBits, Partials, Options, Client } = require('discord.js');

const client = new Client({
	waitGuildTimeout: 60000,
	closeTimeout: 60000,
	rest: {
		timeout: 60000,
		retries: 20,
	},
	ws: {
		large_threshold: 250,
	},
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.AutoModerationExecution,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.GuildExpressions,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.AutoModerationConfiguration,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildScheduledEvents,
		GatewayIntentBits.GuildMessagePolls,
	],

	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.Reaction,
		Partials.User,
		Partials.GuildMember,
	],

	makeCache: Options.cacheWithLimits({
		PresenceManager: 0,

		ThreadManager: {
			maxSize: 25,
		},

		GuildMemberManager: {
			maxSize: 2000,
			keepOverLimit: (member) =>
				(member.client.user && member.id === member.client.user.id) ||
				(member.guild && member.id === member.guild.ownerId) ||
				(member.voice && member.voice.channelId !== null) ||
				member.roles.cache.size > 5,
		},

		UserManager: {
			maxSize: 20000,
			keepOverLimit: (user) => user.id === user.client.user.id,
		},
	}),

	sweepers: {
		...Options.DefaultSweeperSettings,
		messages: {
			interval: 3600,
			lifetime: 1800,
		},
		threads: {
			interval: 3600,
			lifetime: 1800,
		},

		users: {
			interval: 3600,

			filter: () => (user) => {
				if (!user || user.bot) return false;
				if (user.id === user.client.user.id) return false;
				return true;
			},
		},
	},
});

module.exports = client;
