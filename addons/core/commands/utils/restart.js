/**
 * @namespace: addons/core/commands/utils/restart.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */
const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
    InteractionContextType,
} = require('discord.js');
const { t } = require('@utils/translator');
const convertColor = require('@utils/color');

module.exports = {
    data: new SlashCommandBuilder().setName('restart').setDescription('🔁 Restarts the bot.').setContexts(InteractionContextType.BotDM),
    ownerOnly: true,
    async execute(interaction) {
        const container = new ContainerBuilder().setAccentColor(convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' }));
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(await t(interaction, 'core_utils_restart_embed_confirm_desc'))
        );
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
        container.addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm_restart')
                    .setLabel(await t(interaction, 'core_utils_restart_button_confirm'))
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('cancel_restart')
                    .setLabel(await t(interaction, 'core_utils_restart_button_cancel'))
                    .setStyle(ButtonStyle.Secondary)
            )
        );

        await interaction.reply({ components: [container], flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2 });

        const collector = interaction.channel.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
            time: 15000,
        });

        collector.on('collect', async (i) => {
            // Prevent double-acknowledgement by stopping the collector after a button is pressed
            collector.stop('handled');

            if (i.customId === 'cancel_restart') {
                const container = new ContainerBuilder().setAccentColor(convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' }));
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(await t(interaction, 'core_utils_restart_embed_cancelled_desc'))
                );
                container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        await t(interaction, 'common_container_footer', { username: interaction.client.user.username })
                    )
                );
                try {
                    await i.update({ components: [container], flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2 });
                } catch (err) {
                    // Ignore if already acknowledged
                }
            } else if (i.customId === 'confirm_restart') {
                const container = new ContainerBuilder().setAccentColor(convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' }));
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(await t(interaction, 'core_utils_restart_embed_restarting_desc'))
                );
                container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        await t(interaction, 'common_container_footer', { username: interaction.client.user.username })
                    )
                );
                try {
                    await i.update({ components: [container], flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2 });
                } catch (err) {
                    // Ignore if already acknowledged
                }
                setTimeout(() => process.exit(0), 1000);
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                const container = new ContainerBuilder().setAccentColor(convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' }));
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(await t(interaction, 'core_utils_restart_embed_timeout_desc'))
                );
                container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        await t(interaction, 'common_container_footer', { username: interaction.client.user.username })
                    )
                );
                await interaction.editReply({ components: [container], flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2 });
            }
        });
    },
};
