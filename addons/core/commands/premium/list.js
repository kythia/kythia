/**
 * @namespace: addons/core/commands/premium/list.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Op } = require('sequelize');
module.exports = {
    data: (subcommand) => subcommand.setName('list').setDescription('View list of premium users'),
    async execute(interaction, container) {
        const { t, kythiaConfig, helpers, models } = container;
        const { embedFooter } = helpers.discord;
        const { KythiaUser } = models;

        await interaction.deferReply({ ephemeral: true });

        const now = new Date();
        const list = await KythiaUser.getAllCache({
            where: {
                isPremium: true,
                premiumExpiresAt: { [Op.gt]: now },
            },
            order: [['premiumExpiresAt', 'ASC']],
            cacheTags: ['KythiaUser:premium:list'],
        });

        if (!list.length) {
            return interaction.editReply(await t(interaction, 'core.premium.premium.list.empty'));
        }

        const embed = new EmbedBuilder()
            .setColor(kythiaConfig.bot.color)
            .setTitle(await t(interaction, 'core.premium.premium.list.title'))
            .setDescription(
                (
                    await Promise.all(
                        list.map(
                            async (p, i) =>
                                await t(interaction, 'core.premium.premium.list.item', {
                                    index: i + 1,
                                    user: `<@${p.userId}>`,
                                    expires: `<t:${Math.floor(new Date(p.premiumExpiresAt).getTime() / 1000)}:R>`,
                                })
                        )
                    )
                ).join('\n')
            )
            .setFooter(await embedFooter(interaction));

        return interaction.editReply({ embeds: [embed] });
    },
};
