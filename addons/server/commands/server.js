/**
 * @namespace: addons/server/commands/server.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const {
    SlashCommandBuilder,
    ChannelType,
    PermissionFlagsBits,
    OverwriteType,
    AttachmentBuilder,
    EmbedBuilder,
    InteractionContextType,
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { loadTemplates, buildEmbeds } = require('../helpers/template');
const { t } = require('@coreHelpers/translator');
const { embedFooter } = require('@coreHelpers/discord');

// Path ke folder template
const TEMPLATE_DIR = path.join(__dirname, '../template');

// Loader template DRY: gunakan loadTemplates helper untuk load dari folder + embedded
const EMBEDDED = loadTemplates(TEMPLATE_DIR);

// map string permission ke bit
const PERM = new Proxy(
    {},
    {
        get: (_, key) => {
            if (!PermissionFlagsBits[key]) throw new Error(`unknown perm: ${key}`);
            return PermissionFlagsBits[key];
        },
    }
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function roleIdByName(guild, name) {
    if (name === '@everyone') return guild.roles.everyone.id;
    const r = guild.roles.cache.find((x) => x.name.toLowerCase() === name.toLowerCase());
    return r?.id;
}
function overwriteFromPermSpec(guild, permSpec) {
    const allow = (permSpec.allow || []).map((p) => PERM[p]).reduce((a, b) => a | b, 0n);
    const deny = (permSpec.deny || []).map((p) => PERM[p]).reduce((a, b) => a | b, 0n);
    const targets = permSpec.roles?.map((n) => roleIdByName(guild, n)).filter(Boolean) || [];
    return targets.map((id) => ({ id, type: OverwriteType.Role, allow, deny }));
}
async function ensureRole(guild, spec, stats) {
    const exists = guild.roles.cache.find((r) => r.name.toLowerCase() === spec.name.toLowerCase());
    if (exists) {
        stats.role.skipped++;
        return exists;
    }
    const perms = (spec.perms || []).map((p) => PERM[p]).reduce((a, b) => a | b, 0n);
    const role = await guild.roles.create({
        name: spec.name,
        color: spec.color ?? null,
        hoist: !!spec.hoist,
        mentionable: !!spec.mentionable,
        permissions: perms,
        reason: 'autobuild: create role',
    });
    stats.role.created++;
    await sleep(250);
    return role;
}
async function ensureCategory(guild, name, stats) {
    const existing = guild.channels.cache.find((c) => c.type === ChannelType.GuildCategory && c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
        stats.category.skipped++;
        return existing;
    }
    const cat = await guild.channels.create({
        name,
        type: ChannelType.GuildCategory,
        reason: 'autobuild: create category',
    });
    stats.category.created++;
    await sleep(250);
    return cat;
}
async function ensureChannel(guild, category, spec, stats) {
    const existing = guild.channels.cache.find((c) => c.parentId === category.id && c.name.toLowerCase() === spec.name.toLowerCase());
    if (existing) {
        stats.channel.skipped++;
        return existing;
    }

    const options = {
        name: spec.name,
        type: spec.type,
        parent: category.id,
        topic: spec.topic || undefined,
        nsfw: !!spec.nsfw,
        rateLimitPerUser: spec.rateLimitPerUser || undefined,
        reason: 'autobuild: create channel',
    };
    if (spec.type === ChannelType.GuildForum) {
        options.availableTags = (spec.forumTags || []).map((t) => ({ name: t }));
        options.defaultAutoArchiveDuration = 10080;
        options.defaultThreadRateLimitPerUser = 5;
    }
    if (Array.isArray(spec.perms) && spec.perms.length) {
        options.permissionOverwrites = spec.perms.flatMap((p) => overwriteFromPermSpec(guild, p));
    }
    const ch = await guild.channels.create(options);
    stats.channel.created++;
    await sleep(300);

    if (Array.isArray(spec.pin) && spec.pin.length && ch.type === ChannelType.GuildText) {
        for (const msg of spec.pin) {
            let m;
            if (typeof msg === 'object' && msg !== null && !Array.isArray(msg)) {
                const embedsToSend = buildEmbeds([msg]);
                m = await ch.send({ embeds: embedsToSend });
            } else {
                m = await ch.send({ content: msg });
            }
            if (m) {
                try {
                    await m.pin();
                } catch (e) {
                    console.warn(`Gagal mem-pin pesan di channel ${ch.name}:`, e.message);
                }
            }
            await sleep(200);
        }
    }
    return ch;
}

// --- Progress Embed Helper ---
async function updateProgress(interaction, progress) {
    // progress: { step, totalSteps, current, total, label }
    const percent = progress.total > 0 ? Math.floor((progress.current / progress.total) * 100) : 0;
    const barLength = 20;
    const filledLength = Math.round((percent / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    const embed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setDescription(
            `## ${await t(interaction, 'server.server.progress.title')}\n` +
                `**${progress.label}**\n` +
                `\`${bar}\` ${percent}%\n` +
                `(${progress.current}/${progress.total})\n\n` +
                (progress.extra || '') +
                `\n${await t(interaction, 'server.server.progress.step', { step: progress.step, totalSteps: progress.totalSteps })}`
        )
        .setFooter(await embedFooter(interaction));
    await interaction.editReply({ embeds: [embed] });
}

async function runTemplate(interaction, tpl, opts) {
    const guild = interaction.guild;
    const stats = {
        role: { created: 0, skipped: 0 },
        category: { created: 0, skipped: 0 },
        channel: { created: 0, skipped: 0 },
        failed: 0,
    };
    if (!guild) throw new Error('guild missing');
    if (
        !guild.members.me.permissions.has(
            PermissionFlagsBits.ManageGuild | PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageRoles
        )
    ) {
        throw new Error('bot kurang permission: ManageGuild, ManageChannels, ManageRoles');
    }

    // --- Progress variables ---
    const totalRoles = (tpl.roles || []).length;
    const totalCats = (tpl.categories || []).length;
    const totalChannels = tpl.categories?.reduce((acc, cat) => acc + (cat.channels?.length || 0), 0) || 0;
    let step = 1;
    const totalSteps = (totalRoles ? 1 : 0) + (totalCats ? 1 : 0) + (totalChannels ? 1 : 0);

    // Roles
    if (!opts.dryRun && totalRoles) {
        let i = 0;
        for (const r of tpl.roles || []) {
            try {
                await ensureRole(guild, r, stats);
            } catch {
                stats.failed++;
            }
            i++;
            await updateProgress(interaction, {
                step,
                totalSteps,
                current: i,
                total: totalRoles,
                label: await t(interaction, 'server.server.progress.creating.roles'),
            });
        }
        step++;
    }

    // Categories & Channels
    let catIdx = 0;
    for (const cat of tpl.categories || []) {
        if (cat.name.toLowerCase() === 'voice' && !opts.includeVoice) continue;
        let catRef = null;
        if (!opts.dryRun) {
            try {
                catRef = await ensureCategory(guild, cat.name, stats);
            } catch {
                stats.failed++;
                continue;
            }
        }
        catIdx++;
        await updateProgress(interaction, {
            step,
            totalSteps,
            current: catIdx,
            total: totalCats,
            label: await t(interaction, 'server.server.progress.creating.categories'),
        });

        // Channels in this category
        let chIdx = 0;
        for (const ch of cat.channels || []) {
            if (cat.name.toLowerCase() === 'voice' && !opts.includeVoice && ch.type === ChannelType.GuildVoice) continue;
            if (opts.privateStaff && cat.name.toLowerCase() === 'staff') {
                ch.perms = ch.perms || [];
                ch.perms.unshift({ roles: ['@everyone'], deny: ['ViewChannel'] });
            }
            if (!opts.dryRun) {
                try {
                    await ensureChannel(guild, catRef, ch, stats);
                } catch {
                    stats.failed++;
                }
            } else {
                stats.channel.created++;
            }
            chIdx++;
            await updateProgress(interaction, {
                step: step + 1,
                totalSteps,
                current: chIdx,
                total: cat.channels.length,
                label: await t(interaction, 'server.server.progress.creating.channels', { category: cat.name }),
            });
        }
    }
    return stats;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('⚙️ Discord server management tools')
        .addSubcommand((sub) =>
            sub
                .setName('autobuild')
                .setDescription('automatically build server structure from a JSON template')
                .addStringOption((o) =>
                    o
                        .setName('template')
                        .setDescription('template key (e.g. store, gaming, saas, company, tech-community)')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addBooleanOption((o) => o.setName('reset').setDescription('reset server first').setRequired(true))
                .addBooleanOption((o) => o.setName('dry_run').setDescription('simulation only').setRequired(false))
                .addBooleanOption((o) => o.setName('include_voice').setDescription('include voice category').setRequired(false))
                .addBooleanOption((o) => o.setName('private_staff').setDescription('force staff private').setRequired(false))
                .addStringOption((o) => o.setName('locale').setDescription('id/en').setRequired(false))
        )
        .addSubcommand((sub) => sub.setName('backup').setDescription('Backup server structure to a JSON file'))
        .addSubcommand((sub) =>
            sub
                .setName('restore')
                .setDescription('Restore server structure from a JSON backup file')
                .addAttachmentOption((opt) => opt.setName('file').setDescription('Server backup file (.json)').setRequired(true))
                .addBooleanOption((opt) => opt.setName('clear').setDescription('Delete all channels & roles first?').setRequired(false))
        )
        // .addSubcommand((sub) =>
        //     sub
        //         .setName("clone")
        //         .setDescription("Clone structure from another server the bot is in and restore to this server")
        //         .addStringOption((opt) =>
        //             opt.setName("name").setDescription("Source server name").setRequired(true).setAutocomplete(true)
        //         )
        //         .addBooleanOption((opt) =>
        //             opt.setName("clear").setDescription("Delete all channels & roles first?").setRequired(false)
        //         )
        // )
        // reset
        .addSubcommand((sub) =>
            sub
                .setName('reset')
                .setDescription('Reset server structure to default')
                .addBooleanOption((opt) => opt.setName('clear').setDescription('Delete all channels & roles first?').setRequired(false))
        )
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    aliases: ['srv'],
    guildOnly: true,
    voteLcoked: true,
    permissions: PermissionFlagsBits.ManageGuild,
    botPermissions: [PermissionFlagsBits.ManageGuild, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles],
    async autocomplete(interaction) {
        const sub = interaction.options.getSubcommand();
        const focused = interaction.options.getFocused();
        // Autocomplete for /server autobuild template
        if (
            sub === 'autobuild' &&
            interaction.options.getSubcommand() === 'autobuild' &&
            interaction.options.getFocused(true)?.name === 'template'
        ) {
            const embeddedTemplates = Object.entries(EMBEDDED)
                .map(([key, tpl]) => ({
                    name: tpl?.meta?.display ? `${tpl.meta.display} (${key})` : key,
                    value: key,
                }))
                .filter(
                    (tpl) =>
                        tpl.name.toLowerCase().includes(focused.toLowerCase()) || tpl.value.toLowerCase().includes(focused.toLowerCase())
                )
                .slice(0, 25);
            return interaction.respond(embeddedTemplates);
        }
        // Autocomplete untuk /server clone name (server list)
        if (sub === 'clone' && interaction.options.getSubcommand() === 'clone' && interaction.options.getFocused(true)?.name === 'name') {
            const choices = interaction.client.guilds.cache
                .filter((g) => g.members.me.permissions.has(PermissionFlagsBits.Administrator))
                .map((g) => ({ name: g.name, value: g.id }))
                .filter((g) => g.name.toLowerCase().includes(focused.toLowerCase()))
                .slice(0, 25);
            return interaction.respond(choices);
        }
        // fallback
        return interaction.respond([]);
    },

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        await interaction.deferReply();

        if (!interaction.guild) {
            const embed = new EmbedBuilder().setColor('Red').setDescription(`## ${await t(interaction, 'server.server.command.no.guild')}`);
            return interaction.editReply({ embeds: [embed], ephemeral: true });
        }
        // AUTOBUILD
        if (subcommand === 'autobuild') {
            const reset = interaction.options.getBoolean('reset', true);
            const key = interaction.options.getString('template', true);
            const dryRun = interaction.options.getBoolean('dry_run') ?? false;
            const includeVoice = interaction.options.getBoolean('include_voice') ?? true;
            const privateStaff = interaction.options.getBoolean('private_staff') ?? true;

            if (reset) {
                await resetServer(interaction);
            }
            // load semua templates dari folder + embedded
            const tpl = EMBEDDED[key];
            if (!tpl) {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(`## ${await t(interaction, 'server.server.autobuild.template.not.found', { key })}`);
                return interaction.editReply({ embeds: [embed], ephemeral: true });
            }

            const locale = interaction.options.getString('locale') || tpl?.meta?.defaultLocale || 'id';
            // No-op localization: just return the original message
            const pin = (tmsg) => tmsg;
            for (const cat of tpl.categories)
                for (const ch of cat.channels || []) {
                    if (Array.isArray(ch.pin)) ch.pin = ch.pin.map(pin);
                }

            try {
                // Initial progress embed
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(kythia.bot.color)
                            .setDescription(`## ${await t(interaction, 'server.server.autobuild.progress.start')}`)
                            .setFooter(await embedFooter(interaction)),
                    ],
                });

                const stats = await runTemplate(interaction, tpl, { dryRun, includeVoice, privateStaff, locale });
                const embed = new EmbedBuilder()
                    .setColor(kythia.bot.color)
                    .setDescription(
                        `## ${await t(interaction, 'server.server.autobuild.success.title', { name: tpl.meta.display || key })}\n` +
                            (await t(interaction, 'server.server.autobuild.success.desc', {
                                mode: dryRun ? 'dry-run' : 'apply',
                                locale,
                                voice: includeVoice ? 'on' : 'off',
                                staff: privateStaff ? 'on' : 'off',
                                roleCreated: stats.role.created,
                                roleSkipped: stats.role.skipped,
                                catCreated: stats.category.created,
                                catSkipped: stats.category.skipped,
                                chCreated: stats.channel.created,
                                chSkipped: stats.channel.skipped,
                                failed: stats.failed,
                            }))
                    )
                    .setFooter(await embedFooter(interaction));

                return interaction.editReply({ embeds: [embed] });
            } catch (e) {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(`## ${await t(interaction, 'server.server.autobuild.failed', { error: e.message })}`);
                return interaction.editReply({ embeds: [embed] });
            }
        }

        // BACKUP/RESTORE/CLONE
        if (['backup', 'restore', 'clone'].includes(subcommand)) {
            switch (subcommand) {
                case 'backup': {
                    const guild = interaction.guild;
                    if (!guild) {
                        const embed = new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(`## ${await t(interaction, 'server.server.backup.no.guild')}`);
                        return interaction.editReply({ embeds: [embed] });
                    }

                    // Kasih tau user kalau prosesnya lagi jalan
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(kythia.bot.color)
                                .setDescription(`## ${await t(interaction, 'server.server.backup.progress.start')}`)
                                .setFooter(await embedFooter(interaction)),
                        ],
                    });

                    try {
                        // --- MENGUMPULKAN SEMUA DATA SERVER ---

                        // 1. Ambil settingan dasar server
                        const serverSettings = {
                            name: guild.name,
                            description: guild.description,
                            iconURL: guild.iconURL({ dynamic: true, size: 4096 }),
                            bannerURL: guild.bannerURL({ size: 4096 }),
                            splashURL: guild.splashURL({ size: 4096 }),
                            verificationLevel: guild.verificationLevel,
                            explicitContentFilter: guild.explicitContentFilter,
                            defaultMessageNotifications: guild.defaultMessageNotifications,
                            systemChannelId: guild.systemChannel?.id,
                            rulesChannelId: guild.rulesChannel?.id,
                            publicUpdatesChannelId: guild.publicUpdatesChannel?.id,
                        };

                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(kythia.bot.color)
                                    .setDescription(`## ${await t(interaction, 'server.server.backup.progress.settings')}`)
                                    .setFooter(await embedFooter(interaction)),
                            ],
                        });

                        // 2. Ambil data Roles
                        const roles = guild.roles.cache
                            .filter((r) => !r.managed && r.id !== guild.id)
                            .sort((a, b) => b.position - a.position)
                            .map((role) => ({
                                id: role.id,
                                name: role.name,
                                color: role.color,
                                hoist: role.hoist,
                                permissions: role.permissions.bitfield.toString(),
                                mentionable: role.mentionable,
                            }));

                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(kythia.bot.color)
                                    .setDescription(`## ${await t(interaction, 'server.server.backup.progress.roles')}`)
                                    .setFooter(await embedFooter(interaction)),
                            ],
                        });

                        // 3. Ambil data Channels
                        const channels = guild.channels.cache
                            .sort((a, b) => a.position - b.position)
                            .map((channel) => ({
                                name: channel.name,
                                type: channel.type,
                                parent: channel.parent?.name || null,
                                position: channel.position,
                                topic: channel.topic || null,
                                nsfw: channel.nsfw || false,
                                rateLimitPerUser: channel.rateLimitPerUser || 0,
                                permissionOverwrites: channel.permissionOverwrites.cache.map((po) => ({
                                    id: po.id,
                                    allow: po.allow.bitfield.toString(),
                                    deny: po.deny.bitfield.toString(),
                                    type: po.type === OverwriteType.Role ? 'role' : 'member',
                                })),
                            }));

                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(kythia.bot.color)
                                    .setDescription(`## ${await t(interaction, 'server.server.backup.progress.channels')}`)
                                    .setFooter(await embedFooter(interaction)),
                            ],
                        });

                        // 4. Ambil data Emojis & Stickers
                        const emojis = guild.emojis.cache.map((e) => ({ name: e.name, url: e.url, animated: e.animated }));
                        const stickers = await guild.stickers
                            .fetch()
                            .then((col) => col.map((st) => ({ name: st.name, tags: st.tags, url: st.url })));

                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(kythia.bot.color)
                                    .setDescription(`## ${await t(interaction, 'server.server.backup.progress.emojis')}`)
                                    .setFooter(await embedFooter(interaction)),
                            ],
                        });

                        // 5. Ambil data Soundboard
                        let soundboard = [];
                        try {
                            if (guild.soundboard && typeof guild.soundboard.sounds?.fetch === 'function') {
                                const soundboardSounds = await guild.soundboard.sounds.fetch();
                                soundboard = soundboardSounds.map((s) => ({ name: s.name, emoji: s.emoji?.name, url: s.url }));
                            }
                        } catch (e) {
                            console.warn('Gagal fetch soundboard:', e.message);
                            soundboard = [];
                        }

                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(kythia.bot.color)
                                    .setDescription(`## ${await t(interaction, 'server.server.backup.progress.soundboard')}`)
                                    .setFooter(await embedFooter(interaction)),
                            ],
                        });

                        // --- GABUNGKAN SEMUA DATA JADI SATU ---
                        const backupData = {
                            metadata: {
                                guildId: guild.id,
                                guildName: guild.name,
                                backedUpBy: interaction.user.tag,
                                timestamp: new Date().toISOString(),
                            },
                            settings: serverSettings,
                            roles,
                            channels,
                            emojis,
                            stickers,
                            soundboard,
                        };

                        // Buat file-nya di memory, gak perlu simpen di disk server
                        const buffer = Buffer.from(JSON.stringify(backupData, null, 2));
                        const file = new AttachmentBuilder(buffer, { name: `backup-${guild.id}-${Date.now()}.json` });

                        // Kirim file ke DM user
                        await interaction.user.send({
                            content: await t(interaction, 'server.server.backup.dm.content', { name: guild.name }),
                            files: [file],
                        });

                        // Update reply awal di channel
                        const embed = new EmbedBuilder()
                            .setColor('Green')
                            .setDescription(`## ${await t(interaction, 'server.server.backup.success')}`);
                        await interaction.editReply({ embeds: [embed] });
                    } catch (err) {
                        console.error(err);
                        if (err.code === 50007) {
                            const embed = new EmbedBuilder()
                                .setColor('Red')
                                .setDescription(`## ${await t(interaction, 'server.server.backup.dm.failed')}`);
                            return interaction.editReply({ embeds: [embed] });
                        }
                        const embed = new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(`## ${await t(interaction, 'server.server.backup.failed')}`);
                        return interaction.editReply({ embeds: [embed] });
                    }
                    break;
                }
                case 'restore':
                case 'clone': {
                    // Progress embed: start
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(kythia.bot.color)
                                .setDescription(`## ${await t(interaction, 'server.server.restore.progress.start')}`)
                                .setFooter(await embedFooter(interaction)),
                        ],
                    });

                    let backup;
                    const clearBefore = interaction.options.getBoolean('clear') ?? false;
                    const guild = interaction.guild;

                    const fetchAssetBuffer = async (url) => {
                        if (!url) return null;
                        const res = await fetch(url);
                        if (!res.ok) throw new Error(`Failed to download asset from ${url}`);
                        return Buffer.from(await res.arrayBuffer());
                    };

                    try {
                        if (subcommand === 'restore') {
                            const file = interaction.options.getAttachment('file');
                            if (!file || !file.name.endsWith('.json')) {
                                const embed = new EmbedBuilder()
                                    .setColor('Red')
                                    .setDescription(`## ${await t(interaction, 'server.server.restore.file.invalid')}`);
                                return interaction.editReply({ embeds: [embed] });
                            }
                            const res = await fetch(file.url);
                            backup = await res.json();
                        } else {
                            // Logika clone kamu...
                        }

                        if (!backup) {
                            const embed = new EmbedBuilder()
                                .setColor('Red')
                                .setDescription(`## ${await t(interaction, 'server.server.restore.data.invalid')}`);
                            return interaction.editReply({ embeds: [embed] });
                        }

                        // Hapus semua yang lama (jika diminta)
                        if (clearBefore) {
                            await interaction.editReply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor(kythia.bot.color)
                                        .setDescription(`## ${await t(interaction, 'server.server.restore.clearing')}`)
                                        .setFooter(await embedFooter(interaction)),
                                ],
                            });
                            await Promise.all(guild.channels.cache.map((c) => c.delete().catch(() => {})));
                            await Promise.all(
                                guild.roles.cache.filter((r) => r.editable && r.name !== '@everyone').map((r) => r.delete().catch(() => {}))
                            );
                            await Promise.all(guild.emojis.cache.map((e) => e.delete().catch(() => {})));
                            await guild.stickers.fetch().then((stickers) => Promise.all(stickers.map((s) => s.delete().catch(() => {}))));
                        }

                        // Restore settingan server
                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(kythia.bot.color)
                                    .setDescription(`## ${await t(interaction, 'server.server.restore.settings')}`)
                                    .setFooter(await embedFooter(interaction)),
                            ],
                        });
                        const settings = backup.settings;
                        await guild
                            .edit({
                                name: settings.name,
                                verificationLevel: settings.verificationLevel,
                                explicitContentFilter: settings.explicitContentFilter,
                                defaultMessageNotifications: settings.defaultMessageNotifications,
                                icon: await fetchAssetBuffer(settings.iconURL),
                                banner: await fetchAssetBuffer(settings.bannerURL),
                            })
                            .catch((e) => console.warn('Failed to update server settings:', e.message));

                        // Restore Roles
                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(kythia.bot.color)
                                    .setDescription(`## ${await t(interaction, 'server.server.restore.roles.text')}`)
                                    .setFooter(await embedFooter(interaction)),
                            ],
                        });
                        const roleMap = new Map();
                        let roleIdx = 0;
                        for (const roleData of backup.roles.slice().reverse()) {
                            const role = await guild.roles
                                .create({
                                    name: roleData.name,
                                    color: roleData.color,
                                    hoist: roleData.hoist,
                                    permissions: BigInt(roleData.permissions),
                                    mentionable: roleData.mentionable,
                                    reason: 'Restore backup',
                                })
                                .catch(() => null);
                            if (role) roleMap.set(roleData.id, role);
                            roleIdx++;
                            if (roleIdx % 5 === 0 || roleIdx === backup.roles.length) {
                                await interaction.editReply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setColor(kythia.bot.color)
                                            .setDescription(
                                                `## ${await t(interaction, 'server.server.restore.roles.progress', { current: roleIdx, total: backup.roles.length })}`
                                            )
                                            .setFooter(await embedFooter(interaction)),
                                    ],
                                });
                            }
                        }

                        // Restore Channels
                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(kythia.bot.color)
                                    .setDescription(`## ${await t(interaction, 'server.server.restore.channels.text')}`)
                                    .setFooter(await embedFooter(interaction)),
                            ],
                        });
                        const categoryMap = new Map();
                        let catIdx = 0;
                        const categories = backup.channels.filter((c) => c.type === ChannelType.GuildCategory);
                        for (const catData of categories) {
                            const category = await guild.channels.create({
                                name: catData.name,
                                type: ChannelType.GuildCategory,
                                position: catData.position,
                            });
                            categoryMap.set(catData.name, category);
                            catIdx++;
                            if (catIdx % 2 === 0 || catIdx === categories.length) {
                                await interaction.editReply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setColor(kythia.bot.color)
                                            .setDescription(
                                                `## ${await t(interaction, 'server.server.restore.categories.progress', { current: catIdx, total: categories.length })}`
                                            )
                                            .setFooter(await embedFooter(interaction)),
                                    ],
                                });
                            }
                        }
                        let chIdx = 0;
                        const nonCatChannels = backup.channels.filter((c) => c.type !== ChannelType.GuildCategory);
                        for (const chanData of nonCatChannels) {
                            const parent = chanData.parent ? categoryMap.get(chanData.parent)?.id : null;
                            await guild.channels.create({
                                name: chanData.name,
                                type: chanData.type,
                                topic: chanData.topic,
                                nsfw: chanData.nsfw,
                                rateLimitPerUser: chanData.rateLimitPerUser,
                                position: chanData.position,
                                parent: parent,
                                permissionOverwrites: chanData.permissionOverwrites?.map((po) => ({
                                    id: roleMap.get(po.id)?.id || po.id,
                                    allow: BigInt(po.allow),
                                    deny: BigInt(po.deny),
                                    type: po.type === 'role' ? OverwriteType.Role : OverwriteType.Member,
                                })),
                            });
                            chIdx++;
                            if (chIdx % 5 === 0 || chIdx === nonCatChannels.length) {
                                await interaction.editReply({
                                    embeds: [
                                        new EmbedBuilder()
                                            .setColor(kythia.bot.color)
                                            .setDescription(
                                                `## ${await t(interaction, 'server.server.restore.channels.progress', { current: chIdx, total: nonCatChannels.length })}`
                                            )
                                            .setFooter(await embedFooter(interaction)),
                                    ],
                                });
                            }
                        }

                        // Restore Emojis, Stickers, Soundboard (Paralel)
                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(kythia.bot.color)
                                    .setDescription(`## ${await t(interaction, 'server.server.restore.assets')}`)
                                    .setFooter(await embedFooter(interaction)),
                            ],
                        });
                        const assetPromises = [];

                        backup.emojis?.forEach((emoji) =>
                            assetPromises.push(
                                fetchAssetBuffer(emoji.url)
                                    .then((buffer) => guild.emojis.create({ name: emoji.name, attachment: buffer }))
                                    .catch((e) => console.warn('Failed to restore emoji:', e.message))
                            )
                        );
                        backup.stickers?.forEach((sticker) =>
                            assetPromises.push(
                                fetchAssetBuffer(sticker.url)
                                    .then((buffer) =>
                                        guild.stickers.create({ name: sticker.name, tags: sticker.tags.split(',')[0], file: buffer })
                                    )
                                    .catch((e) => console.warn('Failed to restore sticker:', e.message))
                            )
                        );
                        backup.soundboard?.forEach((sound) =>
                            assetPromises.push(
                                fetchAssetBuffer(sound.url)
                                    .then((buffer) =>
                                        guild.soundboard.sounds.create({ name: sound.name, sound: buffer, emoji: sound.emoji })
                                    )
                                    .catch((e) => console.warn('Failed to restore sound:', e.message))
                            )
                        );

                        await Promise.allSettled(assetPromises);

                        const embed = new EmbedBuilder()
                            .setColor('Green')
                            .setDescription(
                                `## ${await t(interaction, 'server.server.restore.success', { name: backup.metadata.guildName })}`
                            );
                        return interaction.editReply({ embeds: [embed] });
                    } catch (err) {
                        console.error(err);
                        const embed = new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(`## ${await t(interaction, 'server.server.restore.failed')}`);
                        return interaction.editReply({ embeds: [embed] });
                    }
                }
            }
        }

        // RESET
        if (subcommand === 'reset') {
            await resetServer(interaction);
        }
    },
};

async function resetServer(interaction) {
    const guild = interaction.guild;
    if (!guild) {
        const embed = new EmbedBuilder().setColor('Red').setDescription(`## ${await t(interaction, 'server.server.reset.no.guild')}`);
        return interaction.editReply({ embeds: [embed] });
    }

    // Progress embed: start
    await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(`## ${await t(interaction, 'server.server.reset.progress.start')}`)
                .setFooter(await embedFooter(interaction)),
        ],
    });

    const currentChannelId = interaction.channelId;
    const channelPromises = [];
    let chIdx = 0;
    const channelsArr = Array.from(guild.channels.cache.values());
    for (const channel of channelsArr) {
        if (channel.id !== currentChannelId && channel.deletable) {
            channelPromises.push(channel.delete().catch(() => {}));
        }
        chIdx++;
        if (chIdx % 5 === 0 || chIdx === channelsArr.length) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(kythia.bot.color)
                        .setDescription(
                            `## ${await t(interaction, 'server.server.reset.progress.channels', { current: chIdx, total: channelsArr.length })}`
                        )
                        .setFooter(await embedFooter(interaction)),
                ],
            });
        }
    }
    await Promise.all(channelPromises);

    const rolePromises = [];
    let roleIdx = 0;
    const rolesArr = Array.from(guild.roles.cache.values());
    for (const role of rolesArr) {
        if (role.editable && role.name !== '@everyone') {
            rolePromises.push(role.delete().catch(() => {}));
        }
        roleIdx++;
        if (roleIdx % 5 === 0 || roleIdx === rolesArr.length) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(kythia.bot.color)
                        .setDescription(
                            `## ${await t(interaction, 'server.server.reset.progress.roles', { current: roleIdx, total: rolesArr.length })}`
                        )
                        .setFooter(await embedFooter(interaction)),
                ],
            });
        }
    }
    await Promise.all(rolePromises);

    let emojiIdx = 0;
    const emojisArr = Array.from(guild.emojis.cache.values());
    for (const emoji of emojisArr) {
        await emoji.delete().catch(() => {});
        emojiIdx++;
        if (emojiIdx % 5 === 0 || emojiIdx === emojisArr.length) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(kythia.bot.color)
                        .setDescription(
                            `## ${await t(interaction, 'server.server.reset.progress.emojis', { current: emojiIdx, total: emojisArr.length })}`
                        )
                        .setFooter(await embedFooter(interaction)),
                ],
            });
        }
    }

    if (guild.stickers && guild.stickers.cache) {
        let stickerIdx = 0;
        const stickersArr = Array.from(guild.stickers.cache.values());
        for (const sticker of stickersArr) {
            await sticker.delete().catch(() => {});
            stickerIdx++;
            if (stickerIdx % 2 === 0 || stickerIdx === stickersArr.length) {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(kythia.bot.color)
                            .setDescription(
                                `## ${await t(interaction, 'server.server.reset.progress.stickers', { current: stickerIdx, total: stickersArr.length })}`
                            )
                            .setFooter(await embedFooter(interaction)),
                    ],
                });
            }
        }
    }

    const embed = new EmbedBuilder().setColor('Green').setDescription(`${await t(interaction, 'server.server.reset.success')}`);
    return interaction.editReply({ embeds: [embed] });
}
