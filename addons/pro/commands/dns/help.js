/**
 * @namespace: addons/pro/commands/dns/help.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } = require('discord.js');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('help').setDescription('📖 Information and examples about each DNS record type.'),

    async execute(interaction, container) {
        const { kythiaConfig, helpers, t } = container;
        const { convertColor } = helpers.color;

        await interaction.deferReply();

        const accentColor = convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' });
        const mainContainer = new ContainerBuilder().setAccentColor(accentColor);

        const title = await t(interaction, 'pro.dns.help.title');
        const description = await t(interaction, 'pro.dns.help.description');
        const labels = await t(interaction, 'pro.dns.help.labels');
        const recordTypes = await t(interaction, 'pro.dns.help.types');

        mainContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${title}\n${description}`));

        for (const recordType of recordTypes) {
            mainContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

            const content = [
                `**${labels.description}**`,
                recordType.desc,
                '',
                `**${labels.required_value}**`,
                `- **${labels.value}** ${recordType.value}`,
                `- **${labels.name}** ${recordType.name_host}`,
            ];

            if (recordType.priority) {
                content.push(`- **${labels.priority}** ${recordType.priority}`);
            }

            content.push('', `**${labels.example}**`);
            content.push(...recordType.example_lines);

            mainContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${recordType.name}\n${content.join('\n')}`));
        }

        mainContainer
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    await t(interaction, 'common.container.footer', { username: interaction.client.user.username })
                )
            );

        await interaction.editReply({
            components: [mainContainer],
            flags: MessageFlags.IsComponentsV2,
        });
    },
};
