/**
 * @namespace: addons/image/commands/list.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');

// const convertColor = require('kythia-core').utils.color;
// const { t } = require('@coreHelpers/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('list').setDescription('List all your uploaded images'),
    async execute(interaction) {
        const { models, helpers, translator, kythiaConfig } = interaction.client.container;
        const { Image } = models;
        const { convertColor } = helpers.color;
        const { t } = translator;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        let images = await Image.getAllCache({
            where: { userId: interaction.user.id },
        });

        if (!Array.isArray(images)) {
            images = Array.isArray(images?.rows) ? images.rows : [];
        }
        if (!images.length) {
            return interaction.editReply(await t(interaction, 'image.commands.list.empty'));
        }
        const baseUrl = kythiaConfig.addons.dashboard.url || 'https://localhost:3000';

        const items = images.map((img) => ({
            code: img.filename,
            url: `${baseUrl}/files/${img.storagePath}`,
        }));
        const color = convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' });

        const chunkSize = 25;
        for (let i = 0; i < items.length; i += chunkSize) {
            const pageItems = items.slice(i, i + chunkSize);

            const container = new ContainerBuilder()
                .setAccentColor(color)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        i === 0
                            ? await t(interaction, 'image.commands.list.title.text')
                            : await t(interaction, 'image.commands.list.title.empty')
                    )
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

            for (const img of pageItems) {
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(await t(interaction, 'image.commands.list.item', { code: img.code, url: img.url }))
                );
                container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false));
            }

            if (i + chunkSize >= items.length) {
                container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(await t(interaction, 'image.commands.list.footer.help'))
                );
            }
            container
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        await t(interaction, 'common.container.footer', { username: interaction.client.user.username })
                    )
                );

            if (i === 0) {
                await interaction.editReply({
                    components: [container],
                    flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                });
            } else {
                await interaction.followUp({
                    components: [container],
                    flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                });
            }
        }
    },
};
