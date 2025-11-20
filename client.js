const { Client, GatewayIntentBits, Partials, Options } = require('discord.js');

module.exports = function kythiaClient() {
    const client = new Client({
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
        ],

        partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember],

        makeCache: Options.cacheWithLimits({
            MessageManager: 25,
            GuildMemberManager: {
                max: 100,
                keepOverLimit: (member) =>
                    (client.user && member.id === client.user.id) ||
                    (member.guild && member.id === member.guild.ownerId) ||
                    (member.voice && member.voice.channelId !== null),
            },
            ThreadManager: 10,
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
                filter: () => (user) => user && !user.bot,
            },
        },
    });
    return client;
};
