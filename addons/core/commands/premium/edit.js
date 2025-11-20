/**
 * @namespace: addons/core/commands/premium/edit.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

module.exports = {
    data: (subcommand) =>
        subcommand
            .setName('edit')
            .setDescription('Edit a premium user')
            .addUserOption((opt) => opt.setName('user').setDescription('User to edit premium access').setRequired(true)),
    async execute(interaction, container) {
        const { t, models } = container;
        const { KythiaUser } = models;

        const user = interaction.options.getUser('user');
        const days = interaction.options.getInteger('days');

        const kythiaUser = await KythiaUser.getCache({ userId: user.id });
        if (!kythiaUser) {
            return interaction.editReply(await t(interaction, 'core.premium.premium.not.premium'));
        }
        const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        kythiaUser.premiumExpiresAt = expiresAt;
        await kythiaUser.save();
        return interaction.editReply(
            await t(interaction, 'core.premium.premium.edit.success', {
                user: `<@${user.id}>`,
                days,
                expires: `<t:${Math.floor(expiresAt.getTime() / 1000)}:R>`,
            })
        );
    },
};
