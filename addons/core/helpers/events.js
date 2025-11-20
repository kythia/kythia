/**
 * @namespace: addons/core/helpers/events.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

// addons/core/helpers/events.js
const { ApplicationCommandOptionType } = require('discord.js');
const logger = require('@coreHelpers/logger');
/**
 * Membuat objek interaction palsu dari sebuah Message.
 * VERSI PALING SEMPURNA: State management reply/defer/followUp/edit/delete, argumen, dan error handling sangat teliti.
 * @param {import('discord.js').Message} message - Objek pesan asli.
 * @param {string} commandName - Nama command yang dijalankan.
 * @param {string[]|object} args - Argumen, bisa array (prefix) atau objek (AI).
 * @returns {object} Objek interaction palsu yang sangat kompatibel.
 */

function kythiaInteraction(message, commandName, rawArgsString) {
    let replied = false,
        deferred = false,
        replyMessage = null,
        deleted = false;
    let followUpMessages = [];
    let argsObject = {},
        subcommand = null,
        subcommandGroup = null;
    // --- LOGIKA PARSING BARU (VERSI 2.4 - THE FINAL FINAL) ---
    const commandDef = message.client?.commands?.get(commandName);
    let potentialArgs = typeof rawArgsString === 'string' ? rawArgsString.split(/ +/) : [];
    let plainTextArgs = [];

    // 1. Pisahkan argumen key:value dari teks biasa
    for (const arg of potentialArgs) {
        if (arg.includes(':')) {
            const [key, ...valueParts] = arg.split(':');
            argsObject[key.toLowerCase()] = valueParts.join(':').trim();
        } else if (arg.trim() !== '') {
            plainTextArgs.push(arg);
        }
    }

    // 2. Proses teks biasa untuk menemukan subcommand/group
    if (plainTextArgs.length > 0) {
        const firstArg = plainTextArgs[0].toLowerCase();

        // Prioritas 1: Cek apakah ini group + subcommand (e.g., "account edit")
        if (plainTextArgs.length >= 2) {
            let testKey = `${commandName} ${firstArg} ${plainTextArgs[1].toLowerCase()}`;
            if (message.client.commands.has(testKey)) {
                subcommandGroup = plainTextArgs.shift().toLowerCase();
                subcommand = plainTextArgs.shift().toLowerCase();
            }
        }

        // Prioritas 2: Jika bukan group, cek apakah ini subcommand modular (e.g., "work")
        if (!subcommand && plainTextArgs.length >= 1) {
            let testKey = `${commandName} ${firstArg}`;
            if (message.client.commands.has(testKey)) {
                subcommand = plainTextArgs.shift().toLowerCase();
            }
        }

        // Prioritas 3 (FALLBACK): Jika masih belum ketemu, ini pasti subcommand untuk command yang self-contained (seperti /ai)
        if (!subcommand && plainTextArgs.length >= 1) {
            // Kita tidak perlu cek, langsung asumsikan argumen pertama adalah subcommand
            // karena jika salah, execute dari base command-nya yang akan menangani.
            subcommand = plainTextArgs.shift().toLowerCase();
        }
    }

    // 3. Gabungkan sisa teks biasa untuk argumen default
    const remainingPlainText = plainTextArgs.join(' ');

    // 4. Cek & Terapkan Argumen Default
    let finalCommandKeyForDefaultArg = `${commandName} ${subcommandGroup || ''} ${subcommand || ''}`.replace(/ +/g, ' ').trim();
    let commandForDefaultArg = message.client?.commands?.get(finalCommandKeyForDefaultArg) || commandDef;

    if (commandForDefaultArg && commandForDefaultArg.defaultArgument && remainingPlainText) {
        argsObject[commandForDefaultArg.defaultArgument] = remainingPlainText;
    }
    // --- AKHIR LOGIKA PARSING BARU ---
    // --- LOGIKA PARSING (VERSI 5.0 - HYBRID FINAL) ---
    // const commandDef = message.client?.commands?.get(commandName);
    // let potentialArgs = typeof rawArgsString === "string" ? rawArgsString.split(/ +/) : [];
    // let plainTextArgs = [];

    // // 1. Pisahkan key:value dari teks biasa (Logika ini sudah benar)
    // for (const arg of potentialArgs) {
    //   if (arg.includes(':')) {
    //     const [key, ...valueParts] = arg.split(":");
    //     argsObject[key.toLowerCase()] = valueParts.join(":").trim();
    //   } else if (arg.trim() !== "") {
    //     plainTextArgs.push(arg);
    //   }
    // }

    // // 2. Cari subcommand/group dengan sistem prioritas
    // if (plainTextArgs.length > 0) {
    //   // Prioritas 1: Cek direct key match untuk group + subcommand (e.g., "set automod badword-whitelist")
    //   if (plainTextArgs.length >= 2) {
    //     let testKey = `${commandName} ${plainTextArgs[0]} ${plainTextArgs[1]}`;
    //     if (message.client.commands.has(testKey)) {
    //       subcommandGroup = plainTextArgs.shift().toLowerCase();
    //       subcommand = plainTextArgs.shift().toLowerCase();
    //     }
    //   }

    //   // Prioritas 2: Jika tidak, cek direct key match untuk subcommand modular (e.g., "music play")
    //   if (!subcommandGroup && plainTextArgs.length >= 1) {
    //     let testKey = `${commandName} ${plainTextArgs[0]}`;
    //     if (message.client.commands.has(testKey)) {
    //       subcommand = plainTextArgs.shift().toLowerCase();
    //     }
    //   }

    //   // Prioritas 3 (FALLBACK): Jika masih belum ketemu, ini PASTI command self-contained (seperti /ai).
    //   // Ambil saja argumennya, nanti execute dari base command-nya yang akan memvalidasi.
    //   if (!subcommand && !subcommandGroup && plainTextArgs.length >= 1 && commandDef?.data?.options) {
    //     const firstArg = plainTextArgs[0].toLowerCase();
    //     const secondArg = plainTextArgs[1]?.toLowerCase();

    //     const potentialOption = commandDef.data.options.find(opt => opt.name === firstArg);
    //     if (potentialOption) {
    //       if (potentialOption.type === ApplicationCommandOptionType.SubcommandGroup && secondArg) {
    //         subcommandGroup = plainTextArgs.shift().toLowerCase();
    //         subcommand = plainTextArgs.shift().toLowerCase();
    //       } else if (potentialOption.type === ApplicationCommandOptionType.Subcommand) {
    //         subcommand = plainTextArgs.shift().toLowerCase();
    //       }
    //     }
    //   }
    // }

    // // 3. Gabungkan sisa teks biasa untuk argumen default
    // const remainingPlainText = plainTextArgs.join(' ');

    // // 4. Cek & Terapkan Argumen Default
    // let finalCommandKeyForDefaultArg = `${commandName} ${subcommandGroup || ''} ${subcommand || ''}`.replace(/ +/g, ' ').trim();
    // let commandForDefaultArg = message.client?.commands?.get(finalCommandKeyForDefaultArg) || commandDef;

    // if (commandForDefaultArg && commandForDefaultArg.defaultArgument && remainingPlainText) {
    //   argsObject[commandForDefaultArg.defaultArgument] = remainingPlainText;
    // }
    // --- AKHIR LOGIKA PARSING BARU ---
    // Helper untuk validasi dan normalisasi opsi reply
    function normalizeReplyOptions(options) {
        if (typeof options === 'string') return { content: options };
        if (typeof options === 'object' && options !== null) return { ...options };
        return { content: '' };
    }

    // Helper untuk cek apakah message sudah dihapus
    async function safeDelete(msg) {
        if (!msg) return;
        try {
            if (!msg.deleted) await msg.delete();
        } catch (e) {
            // ignore error (already deleted, missing perms, etc)
        }
    }

    // Helper untuk mengirim reply/followUp dengan fallback
    async function safeSend(channel, options) {
        try {
            if (!channel || typeof channel.send !== 'function') throw new Error('Invalid channel');
            return await channel.send(options);
        } catch (e) {
            // Fallback: send to DM user if channel is not valid
            try {
                if (message.author && typeof message.author.send === 'function') {
                    return await message.author.send(options);
                }
            } catch (e2) {
                // Cannot send to anywhere
                return null;
            }
        }
    }

    // Helper to resolve user/member/channel/role from argument
    function resolveUser(val) {
        try {
            if (!val) return message.mentions?.users?.first?.() || null;
            const userId = String(val).replace(/[<@!>]/g, '');
            return message.client.users.cache.get(userId) || message.mentions?.users?.get?.(userId) || null;
        } catch (e) {
            return null;
        }
    }
    function resolveMember(val) {
        try {
            const user = resolveUser(val);
            return user ? message.guild?.members?.resolve(user) : null;
        } catch (e) {
            return null;
        }
    }
    function resolveChannel(val) {
        try {
            if (!val) return message.mentions?.channels?.first?.() || null;
            const channelId = String(val).replace(/[<#>]/g, '');
            return message.client.channels.cache.get(channelId) || message.mentions?.channels?.get?.(channelId) || null;
        } catch (e) {
            return null;
        }
    }
    function resolveRole(val) {
        try {
            if (!val || !message.guild) return message.mentions?.roles?.first?.() || null;
            const roleId = String(val).replace(/[<@&>]/g, '');
            return message.guild.roles.cache.get(roleId) || message.mentions?.roles?.get?.(roleId) || null;
        } catch (e) {
            return null;
        }
    }

    const fakeInteraction = {
        commandName: commandName,
        user: message.author,
        member: message.member,
        guild: message.guild,
        channel: message.channel,
        client: message.client,
        replied,
        deferred,
        isFake: true,
        createdTimestamp: message.createdTimestamp,
        id: message.id,
        applicationId: message.client?.application?.id || null,
        type: 2, // Simulasi type interaction (application command)
        locale: message.locale || 'id',
        // --- State getter agar selalu up-to-date
        get replied() {
            return replied;
        },
        get deferred() {
            return deferred;
        },
        get deleted() {
            return deleted;
        },
        // --- State setter (untuk internal)
        set replied(val) {
            replied = !!val;
        },
        set deferred(val) {
            deferred = !!val;
        },
        set deleted(val) {
            deleted = !!val;
        },

        // --- INI BAGIAN PALING SEMPURNA UNTUK STATE MANAGEMENT ---
        deferReply: async (options = {}) => {
            if (deleted) throw new Error('Interaction already deleted, cannot deferReply.');
            if (replied) {
                throw new Error('Interaction already replied, cannot deferReply again.');
            }
            if (deferred) {
                // Already deferred, ignore
                return replyMessage;
            }
            deferred = true;
            fakeInteraction.deferred = true;
            try {
                replyMessage = await safeSend(message.channel, { content: '⏳ ...', ...options });
            } catch (e) {
                replyMessage = null;
            }
            return replyMessage;
        },

        reply: async (options) => {
            if (deleted) throw new Error('Interaction already deleted, cannot reply.');
            options = normalizeReplyOptions(options);
            if (deferred) {
                // Jika sudah didefer, editReply
                return fakeInteraction.editReply(options);
            }
            if (replied) {
                // Sudah reply, followUp
                return fakeInteraction.followUp(options);
            }
            replied = true;
            fakeInteraction.replied = true;
            try {
                replyMessage = await safeSend(message.channel, options);
            } catch (e) {
                replyMessage = null;
            }
            return replyMessage;
        },

        editReply: async (options) => {
            if (deleted) throw new Error('Interaction already deleted, cannot editReply.');
            options = normalizeReplyOptions(options);
            if (!replyMessage) {
                // No reply/defer, reply new
                return fakeInteraction.reply(options);
            }
            if (
                replyMessage.content &&
                replyMessage.content.trim() === '⏳ ...' &&
                (!options || (typeof options === 'object' && options.content !== '⏳ ...'))
            ) {
                await safeDelete(replyMessage);
                try {
                    replyMessage = await safeSend(message.channel, options);
                } catch (e) {
                    replyMessage = null;
                }
                replied = true;
                deferred = false;
                fakeInteraction.replied = true;
                fakeInteraction.deferred = false;
                return replyMessage;
            }
            // If not placeholder, edit like usual
            try {
                if (typeof replyMessage.edit === 'function') {
                    const editedMessage = await replyMessage.edit(options);
                    replied = true;
                    deferred = false;
                    fakeInteraction.replied = true;
                    fakeInteraction.deferred = false;
                    return editedMessage;
                } else {
                    // Fallback: send new
                    replyMessage = await safeSend(message.channel, options);
                    replied = true;
                    deferred = false;
                    fakeInteraction.replied = true;
                    fakeInteraction.deferred = false;
                    return replyMessage;
                }
            } catch (e) {
                // If failed to edit (example: already deleted), send new
                try {
                    replyMessage = await safeSend(message.channel, options);
                } catch (e2) {
                    replyMessage = null;
                }
                replied = true;
                deferred = false;
                fakeInteraction.replied = true;
                fakeInteraction.deferred = false;
                return replyMessage;
            }
        },

        followUp: async (options) => {
            if (deleted) throw new Error('Interaction already deleted, cannot followUp.');
            if (!replied && !deferred) throw new Error('Cannot followUp before reply/defer.');
            options = normalizeReplyOptions(options);
            let msg = null;
            try {
                msg = await safeSend(message.channel, options);
            } catch (e) {
                msg = null;
            }
            if (msg) followUpMessages.push(msg);
            return msg;
        },

        deleteReply: async () => {
            if (deleted) return;
            try {
                await safeDelete(replyMessage);
            } catch (e) {}
            for (const msg of followUpMessages) {
                try {
                    await safeDelete(msg);
                } catch (e) {}
            }
            replyMessage = null;
            followUpMessages = [];
            replied = false;
            deferred = false;
            deleted = true;
        },

        fetchReply: async () => {
            if (replyMessage && !replyMessage.deleted) return replyMessage;
            return null;
        },

        // --- Opsi paling lengkap, handle semua kemungkinan ---
        options: {
            _getArg: (name) => {
                try {
                    if (!name) return null;
                    const key = String(name).toLowerCase();
                    if (argsObject[key] !== undefined) return argsObject[key];
                    // Try to find with snake_case/kebabCase variation
                    for (const k of Object.keys(argsObject)) {
                        if (k.replace(/[-_ ]/g, '') === key.replace(/[-_ ]/g, '')) return argsObject[k];
                    }
                    return null;
                } catch (e) {
                    return null;
                }
            },
            getSubcommand: () => subcommand || null,
            getSubcommandGroup: () => subcommandGroup || null,
            getString: (name) => {
                try {
                    const val = fakeInteraction.options._getArg(name);
                    if (val === null || val === undefined) return null;
                    if (typeof val === 'string') return val;
                    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
                    return null;
                } catch (e) {
                    return null;
                }
            },
            getInteger: (name) => {
                try {
                    const val = fakeInteraction.options._getArg(name);
                    if (val === null || val === undefined) return null;
                    const n = parseInt(val, 10);
                    return !isNaN(n) ? n : null;
                } catch (e) {
                    return null;
                }
            },
            getBoolean: (name) => {
                try {
                    const val = fakeInteraction.options._getArg(name);
                    if (val === null || val === undefined) return null;
                    if (typeof val === 'boolean') return val;
                    if (typeof val === 'number') return val !== 0;
                    if (typeof val === 'string') {
                        const s = val.trim().toLowerCase();
                        if (['true', 'yes', '1', 'y', 'on'].includes(s)) return true;
                        if (['false', 'no', '0', 'n', 'off'].includes(s)) return false;
                    }
                    return null;
                } catch (e) {
                    return null;
                }
            },
            getNumber: (name) => {
                try {
                    const val = fakeInteraction.options._getArg(name);
                    if (val === null || val === undefined) return null;
                    const n = parseFloat(val);
                    return !isNaN(n) ? n : null;
                } catch (e) {
                    return null;
                }
            },
            getUser: (name) => {
                try {
                    const val = fakeInteraction.options._getArg(name);
                    return resolveUser(val);
                } catch (e) {
                    return null;
                }
            },
            getMember: (name) => {
                try {
                    const val = fakeInteraction.options._getArg(name);
                    return resolveMember(val);
                } catch (e) {
                    return null;
                }
            },
            getChannel: (name) => {
                try {
                    const val = fakeInteraction.options._getArg(name);
                    return resolveChannel(val);
                } catch (e) {
                    return null;
                }
            },
            getRole: (name) => {
                try {
                    const val = fakeInteraction.options._getArg(name);
                    return resolveRole(val);
                } catch (e) {
                    return null;
                }
            },
            getAttachment: (name) => {
                try {
                    // For message command, we take the first attachment or find by name
                    if (!message.attachments || message.attachments.size === 0) return null;
                    if (!name) return message.attachments.first();
                    // Find attachment with matching file name
                    const lower = String(name).toLowerCase();
                    return (
                        message.attachments.find((att) => att.name && att.name.toLowerCase().includes(lower)) || message.attachments.first()
                    );
                } catch (e) {
                    return null;
                }
            },
            getMentionable: (name) => {
                try {
                    // Cek user
                    const user = fakeInteraction.options.getUser(name);
                    if (user) return user;
                    // Cek role
                    const role = fakeInteraction.options.getRole(name);
                    if (role) return role;
                    // Cek mention pertama (user/role)
                    if (message.mentions?.users?.size > 0) return message.mentions.users.first();
                    if (message.mentions?.roles?.size > 0) return message.mentions.roles.first();
                    return null;
                } catch (e) {
                    return null;
                }
            },
        },

        // --- Utility: Simulasi deferUpdate, isCommand, isRepliable, isChatInputCommand, etc ---
        deferUpdate: async () => {
            // Tidak relevan di message, abaikan
            return;
        },
        isCommand: () => true,
        isRepliable: () => true,
        isChatInputCommand: () => true,
        isMessageComponent: () => false,
        isAutocomplete: () => false,
        isModalSubmit: () => false,
        inGuild: () => !!message.guild,
        toString: () => `[FakeInteraction/${commandName}]`,
    };

    // Sempurnakan: pastikan semua properti penting tidak undefined/null
    for (const key of ['user', 'member', 'guild', 'channel', 'client', 'createdTimestamp', 'id']) {
        if (typeof fakeInteraction[key] === 'undefined') {
            fakeInteraction[key] = null;
        }
    }

    return fakeInteraction;
}

/**
 * Creates mock event arguments for testing with client.emit().
 * @param {string} eventName - The name of the event to mock.
 * @param {import('discord.js').Interaction} interaction - The interaction to source base data from.
 * @param {string} type - The specific scenario type (e.g., 'boost', 'unboost', 'default').
 * @returns {Promise<Array<any>>} An array of arguments for the event.
 */
async function createMockEventArgs(eventName, interaction, type = 'default') {
    const { member, guild, channel, user, client } = interaction;

    switch (eventName) {
        case 'messageCreate':
        case 'messageDelete':
            return [await channel.send({ content: 'This is a dummy message for testing.' })];

        case 'messageUpdate': {
            const oldMessage = { ...(await channel.send({ content: 'Old message content.' })), content: 'Old message content.' };
            const newMessage = await channel.messages.fetch(oldMessage.id);
            newMessage.content = 'This is the new, updated message content.';
            return [oldMessage, newMessage];
        }

        case 'guildMemberAdd':
        case 'guildMemberRemove':
            return [member];

        case 'guildMemberUpdate': {
            // Clone member untuk oldMember
            const oldMember = Object.assign(Object.create(Object.getPrototypeOf(member)), member);
            const newMember = member;

            switch (type) {
                case 'boost':
                    logger.info('[TEST EVENT] Simulating a BOOST event...');
                    // Skenario: Dulu belum nge-boost, sekarang nge-boost
                    oldMember.premiumSinceTimestamp = null;
                    Object.defineProperty(oldMember, 'premiumSince', {
                        get: () => null,
                        configurable: true,
                    });

                    // Pastikan newMember punya premiumSinceTimestamp
                    if (!newMember.premiumSinceTimestamp) {
                        newMember.premiumSinceTimestamp = Date.now();
                        Object.defineProperty(newMember, 'premiumSince', {
                            get: () => new Date(newMember.premiumSinceTimestamp),
                            configurable: true,
                        });
                    }
                    return [oldMember, newMember];

                case 'unboost':
                    logger.info('[TEST EVENT] Simulating an UNBOOST event...');
                    // Skenario: Dulu nge-boost, sekarang udah enggak
                    oldMember.premiumSinceTimestamp = Date.now() - 1000 * 60 * 60 * 24 * 7; // 7 hari yang lalu
                    Object.defineProperty(oldMember, 'premiumSince', {
                        get: () => new Date(oldMember.premiumSinceTimestamp),
                        configurable: true,
                    });

                    // Set newMember jadi tidak boost
                    newMember.premiumSinceTimestamp = null;
                    Object.defineProperty(newMember, 'premiumSince', {
                        get: () => null,
                        configurable: true,
                    });
                    return [oldMember, newMember];

                case 'nickname':
                default:
                    logger.info('[TEST EVENT] Simulating a default member update (nickname)...');
                    // Skenario default: perubahan nickname
                    oldMember.nickname = oldMember.nickname ? null : 'OldNickname_123';
                    return [oldMember, newMember];
            }
        }

        case 'guildCreate':
        case 'guildDelete':
            return [guild];

        case 'guildUpdate': {
            const oldGuild = Object.assign(Object.create(Object.getPrototypeOf(guild)), guild);
            oldGuild.name = 'Old Server Name';
            return [oldGuild, guild];
        }

        case 'guildBanAdd':
        case 'guildBanRemove':
            // Buat objek GuildBan palsu yang minimal
            return [{ guild, user, reason: 'Test ban from /testevent' }];

        case 'channelCreate':
        case 'channelDelete':
            return [channel];

        case 'roleCreate':
        case 'roleDelete':
            return [guild.roles.cache.first() || { name: 'fake-role', id: '12345' }];

        case 'voiceStateUpdate': {
            // Simulasikan user pindah channel (dari null ke channel saat ini)
            const oldState = { ...member.voice, channel: null, channelId: null };
            const newState = member.voice;
            return [oldState, newState];
        }

        case 'ready':
            logger.warn(`[TEST COMMAND] Triggering 'ready' event can have unintended side effects!`);
            return [client];

        case 'interactionCreate':
            logger.warn(`[TEST COMMAND] Triggering 'interactionCreate' can cause infinite loops!`);
            return [interaction];

        default:
            // Jika event tidak disupport, lempar error agar command bisa menanganinya
            throw new Error(`Event '${eventName}' is not supported by the mock event generator.`);
    }
}

module.exports = { kythiaInteraction, createMockEventArgs };
