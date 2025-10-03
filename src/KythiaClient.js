const { Client, GatewayIntentBits, Partials } = require('discord.js');

module.exports = function kythiaClient() {
    const client = new Client({
        /**
         *   export declare enum GatewayIntentBits {
         *     Guilds = 1,
         *     GuildMembers = 2,
         *     GuildModeration = 4,
         *
         *     @deprecated This is the old name for {@link GatewayIntentBits.GuildModeration}
         *
         *     GuildBans = 4,
         *     GuildExpressions = 8,
         *
         *     @deprecated This is the old name for {@link GatewayIntentBits.GuildExpressions}
         *
         *     GuildEmojisAndStickers = 8,
         *     GuildIntegrations = 16,
         *     GuildWebhooks = 32,
         *     GuildInvites = 64,
         *     GuildVoiceStates = 128,
         *     GuildPresences = 256,
         *     GuildMessages = 512,
         *     GuildMessageReactions = 1024,
         *     GuildMessageTyping = 2048,
         *     DirectMessages = 4096,
         *     DirectMessageReactions = 8192,
         *     DirectMessageTyping = 16384,
         *     MessageContent = 32768,
         *     GuildScheduledEvents = 65536,
         *     AutoModerationConfiguration = 1048576,
         *     AutoModerationExecution = 2097152,
         *     GuildMessagePolls = 16777216,
         *     DirectMessagePolls = 33554432
         *   }
         */
        intents: Object.values(GatewayIntentBits),
        /**
         *  partials: [
         *    'User',         'Channel',
         *    'GuildMember',  'Message',
         *    'Reaction',     'GuildScheduledEvent',
         *    'ThreadMember', 'SoundboardSound',
         *    0,              1,
         *    2,              3,
         *    4,              5,
         *    6,              7
         *  ],
         */
        partials: Object.values(Partials),
    });
    return client;
};
