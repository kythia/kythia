/**
 * @namespace: addons/core/commands/premium/info.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: (subcommand) =>
        subcommand
            .setName('info')
            .setDescription('View premium info for a user')
            .addUserOption((opt) => opt.setName('user').setDescription('User to check').setRequired(true)),
    async execute(interaction, container) {
        const { t, kythiaConfig, helpers, models } = container;
        const { embedFooter } = helpers.discord;
        const { KythiaUser } = models;

        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser('user');
        const kythiaUser = await KythiaUser.getCache({ userId: user.id });
        if (!kythiaUser || !kythiaUser.isPremium || new Date(kythiaUser.premiumExpiresAt) < new Date()) {
            return interaction.editReply(
                await t(interaction, 'core.premium.premium.info.not.active', {
                    user: `<@${user.id}>`,
                })
            );
        }
        const embed = new EmbedBuilder()
            .setColor(kythiaConfig.bot.color)
            .setTitle(await t(interaction, 'core.premium.premium.info.title', { tag: user.tag }))
            .addFields(
                {
                    name: await t(interaction, 'core.premium.premium.info.field.user'),
                    value: `<@${user.id}> (${user.id})`,
                },
                {
                    name: await t(interaction, 'core.premium.premium.info.field.status'),
                    value: kythiaUser.isPremium
                        ? await t(interaction, 'core.premium.premium.info.status.active')
                        : await t(interaction, 'core.premium.premium.info.status.inactive'),
                },
                {
                    name: await t(interaction, 'core.premium.premium.info.field.expires'),
                    value: `<t:${Math.floor(new Date(kythiaUser.premiumExpiresAt).getTime() / 1000)}:F>`,
                    inline: false,
                }
            );
        return interaction.editReply({ embeds: [embed] });
    },
};
