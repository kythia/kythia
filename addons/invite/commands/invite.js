/**
 * @namespace: addons/invite/commands/invite.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, InteractionContextType } = require('discord.js');
const Invite = require('../database/models/Invite');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invites')
        .setDescription('Manage invites and rewards')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('user')
                .setDescription('Check user invites')
                .addUserOption((opt) => opt.setName('user').setDescription('User').setRequired(false))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('add')
                .setDescription('Add invites to a user')
                .addUserOption((opt) => opt.setName('user').setDescription('User').setRequired(true))
                .addIntegerOption((opt) => opt.setName('number').setDescription('Amount').setRequired(true))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('remove')
                .setDescription('Remove invites from a user')
                .addUserOption((opt) => opt.setName('user').setDescription('User').setRequired(true))
                .addIntegerOption((opt) => opt.setName('number').setDescription('Amount').setRequired(true))
        )
        .addSubcommand((subcommand) => subcommand.setName('leaderboard').setDescription('View top inviters leaderboard'))
        .addSubcommand((subcommand) => subcommand.setName('reset').setDescription('Reset all invites for this server'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setContexts(InteractionContextType.Guild),
    permissions: PermissionFlagsBits.ManageGuild,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });
        const guildId = interaction.guild.id;
        const sub = interaction.options.getSubcommand();
        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ size: 128 }) })
            .setFooter(await embedFooter(interaction))
            .setTimestamp();

        if (sub === 'user') {
            const target = interaction.options.getUser('user') || interaction.user;
            const row = await Invite.findOne({ where: { guildId, userId: target.id } });
            const invites = row?.invites || 0;
            const leaves = row?.leaves || 0;
            const fake = row?.fake || 0;
            embed.setDescription(
                `## ${await t(interaction, 'invite_invite_command_title')}\n` +
                    (await t(interaction, 'invite_invite_command_user_stats', {
                        user: `<@${target.id}>`,
                        invites,
                        fake,
                        leaves,
                    }))
            );
            return interaction.editReply({ embeds: [embed] });
        }

        if (sub === 'add' || sub === 'remove') {
            if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
                embed.setDescription(
                    `## ${await t(interaction, 'invite_invite_command_title')}\n` + (await t(interaction, 'invite_invite_command_no_permission'))
                );
                return interaction.editReply({ embeds: [embed] });
            }
            const target = interaction.options.getUser('user');
            const number = interaction.options.getInteger('number');
            const delta = sub === 'remove' ? -Math.abs(number) : Math.abs(number);
            const row = await Invite.findOrCreate({ where: { guildId, userId: target.id }, defaults: { invites: 0 } });
            const model = Array.isArray(row) ? row[0] : row;
            model.invites = (model.invites || 0) + delta;
            await model.save();
            embed.setDescription(
                `## ${await t(interaction, 'invite_invite_command_title')}\n` +
                    (await t(interaction, delta >= 0 ? 'invite_command_add_success' : 'invite_command_remove_success', {
                        amount: Math.abs(delta),
                        user: `<@${target.id}>`,
                        total: model.invites,
                    }))
            );
            return interaction.editReply({ embeds: [embed] });
        }

        if (sub === 'leaderboard') {
            const top = await Invite.findAll({ where: { guildId }, order: [['invites', 'DESC']], limit: 10 });
            const lines = top.map(
                async (r, i) =>
                    await t(interaction, 'invite_invite_command_leaderboard_line', {
                        rank: i + 1,
                        user: `<@${r.userId}>`,
                        invites: r.invites,
                    })
            );
            embed.setDescription(
                `## ${await t(interaction, 'invite_invite_command_title')}\n` +
                    (lines.length ? (await Promise.all(lines)).join('\n') : await t(interaction, 'invite_invite_command_leaderboard_empty'))
            );
            return interaction.editReply({ embeds: [embed] });
        }

        if (sub === 'reset') {
            if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
                embed.setDescription(
                    `## ${await t(interaction, 'invite_invite_command_title')}\n` + (await t(interaction, 'invite_invite_command_no_permission'))
                );
                return interaction.editReply({ embeds: [embed] });
            }
            await Invite.destroy({ where: { guildId } });
            embed.setDescription(
                `## ${await t(interaction, 'invite_invite_command_title')}\n` + (await t(interaction, 'invite_invite_command_reset_success'))
            );
            return interaction.editReply({ embeds: [embed] });
        }
    },
};
