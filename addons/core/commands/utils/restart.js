/**
 * @namespace: addons/core/commands/utils/restart.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
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

module.exports = {
    data: new SlashCommandBuilder().setName('restart').setDescription('🔁 Restarts the bot.').setContexts(InteractionContextType.BotDM),
    ownerOnly: true,
    async execute(interaction, container) {
        const { t, kythiaConfig, helpers } = container;
        const { convertColor } = helpers.color;

        const restartContainer = new ContainerBuilder().setAccentColor(convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }));
        restartContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(await t(interaction, 'core.utils.restart.embed.confirm.desc'))
        );
        restartContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
        restartContainer.addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm_restart')
                    .setLabel(await t(interaction, 'core.utils.restart.button.confirm'))
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('cancel_restart')
                    .setLabel(await t(interaction, 'core.utils.restart.button.cancel'))
                    .setStyle(ButtonStyle.Secondary)
            )
        );

        await interaction.reply({ components: [restartContainer], flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2 });

        const collector = interaction.channel.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
            time: 15000,
        });

        collector.on('collect', async (i) => {
            // Prevent double-acknowledgement by stopping the collector after a button is pressed
            collector.stop('handled');

            if (i.customId === 'cancel_restart') {
                const restartContainer = new ContainerBuilder().setAccentColor(
                    convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' })
                );
                restartContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(await t(interaction, 'core.utils.restart.embed.cancelled.desc'))
                );
                restartContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
                restartContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        await t(interaction, 'common.container.footer', { username: interaction.client.user.username })
                    )
                );
                try {
                    await i.update({ components: [restartContainer], flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2 });
                } catch (err) {
                    // Ignore if already acknowledged
                }
            } else if (i.customId === 'confirm_restart') {
                const restartContainer = new ContainerBuilder().setAccentColor(
                    convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' })
                );
                restartContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(await t(interaction, 'core.utils.restart.embed.restarting.desc'))
                );
                restartContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
                restartContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        await t(interaction, 'common.container.footer', { username: interaction.client.user.username })
                    )
                );
                try {
                    await i.update({ components: [restartContainer], flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2 });
                } catch (err) {
                    // Ignore if already acknowledged
                }
                setTimeout(() => process.exit(0), 1000);
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                const restartContainer = new ContainerBuilder().setAccentColor(
                    convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' })
                );
                restartContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(await t(interaction, 'core.utils.restart.embed.timeout.desc'))
                );
                restartContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
                restartContainer.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        await t(interaction, 'common.container.footer', { username: interaction.client.user.username })
                    )
                );
                await interaction.editReply({ components: [restartContainer], flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2 });
            }
        });
    },
};
