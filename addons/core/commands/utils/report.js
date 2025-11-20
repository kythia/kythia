/**
 * @namespace: addons/core/commands/utils/report.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const {
    SlashCommandBuilder,
    EmbedBuilder,
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    InteractionContextType,
} = require('discord.js');

module.exports = {
    slashCommand: new SlashCommandBuilder()
        .setName('report')
        .setDescription('🚨 Report a user to the moderators.')
        .addUserOption((option) => option.setName('user').setDescription('User to report').setRequired(true))
        .addStringOption((option) => option.setName('reason').setDescription('Reason for the report').setRequired(true))
        .setContexts(InteractionContextType.Guild),

    contextMenuCommand: new ContextMenuCommandBuilder()
        .setName('Report User')
        .setType(ApplicationCommandType.User)
        .setContexts(InteractionContextType.Guild),

    contextMenuDescription: '🚨 Report a user to the moderators.',
    guildOnly: true,
    async execute(interaction, container) {
        const { t, kythiaConfig, helpers, models } = container;
        const { embedFooter } = helpers.discord;
        const { ServerSetting } = models;

        await interaction.deferReply({ ephemeral: true });
        const user = interaction.options.getUser('user') || interaction.targetUser || interaction.user;
        const reason = interaction.options.getString('reason') || (await t(interaction, 'core.utils.report.reason'));
        const guildId = interaction.guild?.id;

        const setting = await ServerSetting.getCache({ guildId });
        if (!setting.modLogChannelId && !interaction.guild) {
            return interaction.editReply({
                content: await t(interaction, 'core.utils.report.no.channel'),
                ephemeral: true,
            });
        }

        const reportChannel = interaction.guild?.channels.cache.get(setting.modLogChannelId);
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(
                await t(interaction, 'core.utils.report.embed.desc', {
                    reported: user.tag,
                    reporter: interaction.user?.tag,
                    reason,
                })
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(await embedFooter(interaction));
        await reportChannel?.send({ embeds: [embed] });
        return interaction.editReply(await t(interaction, 'core.utils.report.success', { user: user.tag }));
    },
};
