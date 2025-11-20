/**
 * @namespace: addons/quest/commands/remove.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { MessageFlags } = require('discord.js');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('remove').setDescription('Stop receiving Discord Quest notifications.'),

    async execute(interaction, container) {
        const { models, t, helpers } = container;
        const { simpleContainer } = helpers.discord;
        const { QuestConfig, QuestGuildLog } = models;
        const guildId = interaction.guild.id;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const config = await QuestConfig.getCache({ guildId: guildId });
        if (!config) {
            const content = await t(interaction, 'questnotifier.unset.not_setup');
            return interaction.editReply({
                components: await simpleContainer(interaction, content, { color: 'Yellow' }),
                flags: MessageFlags.IsComponentsV2,
            });
        }

        await config.destroy();

        // const questLogs = await QuestGuildLog.getAllCache({ where: { guildId: guildId } });
        // await questLogs.destroy();

        const content = await t(interaction, 'questnotifier.unset.success');
        await interaction.editReply({
            components: await simpleContainer(interaction, content, { color: 'Red' }),
            flags: MessageFlags.IsComponentsV2,
        });
    },
};
