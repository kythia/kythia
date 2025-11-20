/**
 * @namespace: addons/core/commands/moderation/mute.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: (subcommand) =>
        subcommand
            .setName('mute')
            .setDescription('🔇 Mute a user in a voice channel.')
            .addUserOption((option) => option.setName('user').setDescription('User to mute').setRequired(true)),
    permissions: PermissionFlagsBits.MuteMembers,
    botPermissions: PermissionFlagsBits.MuteMembers,
    async execute(interaction, container) {
        const { t, helpers } = container;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser('user');
        let member;
        try {
            member = await interaction.guild.members.fetch(user.id);
        } catch (e) {
            member = null;
        }

        if (!member) {
            return interaction.editReply({
                content: await t(interaction, 'core.moderation.mute.user.not.found'),
            });
        }

        if (!member.voice.channel) {
            return interaction.editReply({
                content: await t(interaction, 'core.moderation.mute.user.not.in.voice'),
            });
        }

        try {
            await member.voice.setMute(true, await t(interaction, 'core.moderation.mute.reason'));
        } catch (e) {
            return interaction.editReply({
                content: await t(interaction, 'core.moderation.mute.failed'),
            });
        }

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(
                await t(interaction, 'core.moderation.mute.embed.desc', {
                    tag: user.tag,
                    moderator: interaction.user.tag,
                })
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(await embedFooter(interaction));

        return interaction.editReply({ embeds: [embed] });
    },
};
