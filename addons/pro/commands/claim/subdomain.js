/**
 * @namespace: addons/pro/commands/claim/subdomain.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { MessageFlags } = require('discord.js');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('subdomain')
            .setDescription('🌐 Claim a new .kyth.me subdomain (Max 5).')
            .addStringOption((option) =>
                option.setName('name').setDescription('Unique subdomain name (e.g.: kythia-cool)').setRequired(true)
            ),

    async execute(interaction, container) {
        const { logger, kythiaConfig, models, helpers, t } = container;
        const { KythiaUser, Subdomain } = models;
        const { simpleContainer } = helpers.discord;
        const MAX_SUBDOMAINS = kythiaConfig.addons.pro.maxSubdomains || 5;

        await interaction.deferReply({ ephemeral: true });
        const user = await KythiaUser.getCache({ userId: interaction.user.id });

        if (!user) {
            const desc = await t(interaction, 'pro.claim.subdomain.error_mustHaveAccount');
            return interaction.editReply({
                components: await simpleContainer(interaction, desc, { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        const isPremiumActive = user.isPremium && new Date(user.premiumExpiresAt) > new Date();
        const isVoterActive = user.isVoted && new Date(user.voteExpiresAt) > new Date();

        if (!isPremiumActive && !isVoterActive) {
            const desc = await t(interaction, 'pro.claim.subdomain.error_proOrVoterRequired');
            return interaction.editReply({
                components: await simpleContainer(interaction, desc, { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        const userSubdomains = await Subdomain.count({ where: { userId: interaction.user.id } });
        if (userSubdomains >= MAX_SUBDOMAINS) {
            const desc = await t(interaction, 'pro.claim.subdomain.error_maxReached', { max: MAX_SUBDOMAINS });
            return interaction.editReply({
                components: await simpleContainer(interaction, desc, { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        const namaSubdomain = interaction.options.getString('name').toLowerCase();
        if (!/^[a-z0-9-]+$/.test(namaSubdomain) || namaSubdomain.length < 3 || namaSubdomain.length > 32) {
            const desc = await t(interaction, 'pro.claim.subdomain.error_invalidName');
            return interaction.editReply({
                components: await simpleContainer(interaction, desc, { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        const forbiddenNames = ['www', 'mail', 'api', 'bot', 'admin', 'dashboard', 'kythia', 'kyth', 'avalon', 'hyperion'];
        if (forbiddenNames.includes(namaSubdomain)) {
            const desc = await t(interaction, 'pro.claim.subdomain.error_forbidden', { name: namaSubdomain });
            return interaction.editReply({
                components: await simpleContainer(interaction, desc, { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        try {
            await Subdomain.create({
                userId: interaction.user.id,
                name: namaSubdomain,
            });

            const title = await t(interaction, 'pro.claim.subdomain.success_title');
            const desc = await t(interaction, 'pro.claim.subdomain.success_desc', {
                subdomain: namaSubdomain,
                domain: kythiaConfig.addons.pro.cloudflare.domain,
                used: userSubdomains + 1,
                max: MAX_SUBDOMAINS,
            });

            return interaction.editReply({
                components: await simpleContainer(interaction, desc, { color: 'Green', title: title }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                const desc = await t(interaction, 'pro.claim.subdomain.error_taken', { name: namaSubdomain });
                return interaction.editReply({
                    components: await simpleContainer(interaction, desc, { color: 'Red' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            }
            logger.error(`[pro/claim] Gagal klaim subdomain untuk user ${interaction.user.id}:`, error);

            const desc = await t(interaction, 'pro.claim.subdomain.error_technical');
            return interaction.editReply({
                components: await simpleContainer(interaction, desc, { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }
    },
};
