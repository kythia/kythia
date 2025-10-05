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
        ],

        partials: [Partials.Message, Partials.Channel, Partials.Reaction],

        makeCache: Options.cacheWithLimits({
            MessageManager: 25,
            PresenceManager: 0,
            GuildMemberManager: {
                max: 100,
                keepOverLimit: (member) =>
                    member.id === client.user.id || member.id === member.guild.ownerId || member.voice.channelId !== null,
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

                filter: () => (user) => !user.bot && user.id !== client.user.id,
            },
        },
    });
    return client;
};
