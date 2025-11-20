/**
 * @namespace: addons/core/commands/moderation/unlock.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: (subcommand) =>
        subcommand
            .setName('unlock')
            .setDescription('🔓 Unlocks a channel to allow messages.')
            .addChannelOption((option) => option.setName('channel').setDescription('Channel to unlock').setRequired(false)),
    permissions: PermissionFlagsBits.ManageChannels,
    botPermissions: PermissionFlagsBits.ManageChannels,
    async execute(interaction, container) {
        const { t, helpers } = container;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply({ ephemeral: true });
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });

        const lockEmbed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(
                `## ${await t(interaction, 'core.moderation.unlock.embed.channel.unlocked.title')}\n` +
                    (await t(interaction, 'core.moderation.unlock.embed.channel.unlocked.desc', { user: `<@${interaction.user.id}>` }))
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(await embedFooter(interaction));

        await channel.send({ embeds: [lockEmbed] });

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(
                `## ${await t(interaction, 'core.moderation.unlock.embed.reply.title')}\n` +
                    (await t(interaction, 'core.moderation.unlock.embed.reply.desc', { channel: channel.toString() }))
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(await embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
    },
};
