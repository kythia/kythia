/**
 * @namespace: addons/pro/commands/dns/set.js
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
            .setName('set')
            .setDescription('🌐 Create or update a DNS record.')

            .addStringOption((option) =>
                option
                    .setName('subdomain')
                    .setDescription('The subdomain you want to manage (e.g. amazing-project)')
                    .setRequired(true)
                    .setAutocomplete(true)
            )

            .addStringOption((option) =>
                option
                    .setName('type')
                    .setDescription('Record type (A, CNAME, TXT, MX)')
                    .setRequired(true)
                    .setChoices(
                        { name: 'A (IP Address)', value: 'A' },
                        { name: 'CNAME (Alias to another domain)', value: 'CNAME' },
                        { name: 'TXT (Verification, etc)', value: 'TXT' },
                        { name: 'MX (Mail Server)', value: 'MX' }
                    )
            )
            .addStringOption((option) =>
                option.setName('name').setDescription('Host name. Type "@" for root (e.g. amazing-project.kyth.me)').setRequired(true)
            )
            .addStringOption((option) =>
                option.setName('value').setDescription('The value/content of the record (IP, domain, text)').setRequired(true)
            )
            .addIntegerOption((option) => option.setName('priority').setDescription('For MX only. (Default: 10).')),

    async autocomplete(interaction, container) {
        const { models } = container;
        const { Subdomain } = models;
        const focusedValue = interaction.options.getFocused();

        const userSubdomains = await Subdomain.getAllCache({
            where: {
                userId: interaction.user.id,
            },
            limit: 25,
        });

        const filtered = userSubdomains.filter((s) => s.name.startsWith(focusedValue));

        await interaction.respond(filtered.map((subdomain) => ({ name: subdomain.name, value: subdomain.name })));
    },

    async execute(interaction, container) {
        const { t, logger, kythiaConfig, models, helpers } = container;
        const cloudflareApi = container.services.cloudflare;
        const { KythiaUser, Subdomain, DnsRecord } = models;
        const { simpleContainer, isPremium, isVoterActive } = helpers.discord;

        await interaction.deferReply({ ephemeral: true });

        const user = await KythiaUser.getCache({ userId: interaction.user.id });

        if (!user) {
            const desc = await t(interaction, 'pro.dns.set.error_need_account');
            return interaction.editReply({
                components: await simpleContainer(interaction, desc, { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        const isPremiumDonatur = await isPremium(interaction.user.id);
        const isVoter = await isVoterActive(interaction.user.id);

        if (!isPremiumDonatur && !isVoter) {
            const desc = await t(interaction, 'pro.dns.set.error_need_premium_or_vote');
            return interaction.editReply({
                components: await simpleContainer(interaction, desc, { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        const subdomainName = interaction.options.getString('subdomain');
        const targetSubdomain = await Subdomain.getCache({
            name: subdomainName,
            userId: interaction.user.id,
        });

        if (!targetSubdomain) {
            const desc = await t(interaction, 'pro.dns.set.error_subdomain_not_found', { subdomain: subdomainName });
            return interaction.editReply({
                components: await simpleContainer(interaction, desc, { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        const type = interaction.options.getString('type');
        const name = interaction.options.getString('name');
        const value = interaction.options.getString('value');
        const priority = interaction.options.getInteger('priority') ?? 10;

        const existingRecord = await DnsRecord.getCache({
            subdomainId: targetSubdomain.id,
            type: type,
            name: name,
        });

        let result;
        let action;

        if (existingRecord) {
            action = 'updated';
            result = await cloudflareApi.updateRecord(existingRecord, {
                value,
                priority,
            });
        } else {
            action = 'created';
            result = await cloudflareApi.createRecord(targetSubdomain.id, targetSubdomain.name, { type, name, value, priority });
        }

        if (result.success) {
            const fqdn =
                name === '@'
                    ? `${targetSubdomain.name}.${cloudflareApi.domainName}`
                    : `${name}.${targetSubdomain.name}.${cloudflareApi.domainName}`;

            const title = await t(
                interaction,
                action === 'created' ? 'pro.dns.set.success_title_created' : 'pro.dns.set.success_title_updated'
            );
            const desc = await t(interaction, 'pro.dns.set.success_desc', {
                action_past: await t(
                    interaction,
                    action === 'created' ? 'pro.dns.set.action_created_past' : 'pro.dns.set.action_updated_past'
                ),
                type,
                fqdn,
                value,
            });

            return interaction.editReply({
                components: await simpleContainer(interaction, desc, { title: title, color: 'Green' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        } else {
            const title = await t(interaction, 'pro.dns.set.error_fail_title');
            const desc = await t(interaction, 'pro.dns.set.error_fail_desc', { error: result.error });

            return interaction.editReply({
                components: await simpleContainer(interaction, desc, { title: title, color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }
    },
};
