/**
 * @namespace: addons/core/commands/premium/add.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

module.exports = {
    data: (subcommand) =>
        subcommand
            .setName('add')
            .setDescription('Add a user to premium')
            .addUserOption((opt) => opt.setName('user').setDescription('User to grant premium').setRequired(true))
            .addIntegerOption((opt) => opt.setName('days').setDescription('Number of premium days (default 30)').setRequired(false)),
    async execute(interaction, container) {
        const { t, models } = container;
        const { KythiaUser } = models;

        await interaction.deferReply({ ephemeral: true });

        const user = interaction.options.getUser('user');
        const days = interaction.options.getInteger('days') ?? 30;
        const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

        let kythiaUser = await KythiaUser.getCache({ userId: user.id });
        if (kythiaUser) {
            kythiaUser.isPremium = true;
            kythiaUser.premiumExpiresAt = expiresAt;
            await kythiaUser.save();
        } else {
            kythiaUser = await KythiaUser.create({
                userId: user.id,
                isPremium: true,
                premiumExpiresAt: expiresAt,
            });
        }

        return interaction.editReply(
            await t(interaction, 'core.premium.premium.add.success', {
                user: `<@${user.id}>`,
                days,
                expires: `<t:${Math.floor(expiresAt.getTime() / 1000)}:R>`,
            })
        );
    },
};
