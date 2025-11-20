/**
 * @namespace: addons/pro/commands/dns/list.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } = require('discord.js');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('list')
            .setDescription('🌐 Show all DNS records for one of your subdomains.')
            .addStringOption((option) =>
                option
                    .setName('subdomain')
                    .setDescription('The subdomain name you want to view (e.g. my-project)')
                    .setRequired(true)
                    .setAutocomplete(true)
            ),
    async autocomplete(interaction, container) {
        const { models } = container;
        const { Subdomain } = models;
        const focusedValue = interaction.options.getFocused();

        const userSubdomains = await Subdomain.getAllCache({
            where: { userId: interaction.user.id },
            limit: 10,
        });

        const filtered = userSubdomains.filter((s) => s.name.startsWith(focusedValue));

        await interaction.respond(filtered.map((subdomain) => ({ name: subdomain.name, value: subdomain.name })));
    },

    async execute(interaction, container) {
        const { logger, kythiaConfig, models, helpers, t } = container;
        const { KythiaUser, Subdomain, DnsRecord } = models;
        const { simpleContainer, isPremium, isVoterActive } = helpers.discord;
        const { convertColor } = helpers.color;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const isPremiumDonor = await isPremium(interaction.user.id);
        const isVoter = await isVoterActive(interaction.user.id);

        if (!isPremiumDonor && !isVoter) {
            const desc = await t(interaction, 'pro.dns.list.not_allowed');
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
            const desc = await t(interaction, 'pro.dns.list.not_found', { subdomain: subdomainName });
            return interaction.editReply({
                components: await simpleContainer(interaction, desc, { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        const records = await DnsRecord.getAllCache({
            where: { subdomainId: targetSubdomain.id },
        });

        const domainName = kythiaConfig.addons.pro.cloudflare.domain;
        const fqdn = `${targetSubdomain.name}.${domainName}`;

        const accentColor = convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' });
        const mainContainer = new ContainerBuilder().setAccentColor(accentColor);

        const title = await t(interaction, 'pro.dns.list.title', { fqdn: fqdn });
        let description;

        if (records.length === 0) {
            description = await t(interaction, 'pro.dns.list.no_record');
        } else {
            description = await t(interaction, 'pro.dns.list.has_record', { count: records.length });
        }

        mainContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${title}\n${description}`));

        for (const record of records) {
            mainContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

            const fieldTitle = await t(interaction, 'pro.dns.list.record_title', {
                id: record.id,
                type: record.type,
            });
            const fieldValue = await t(interaction, 'pro.dns.list.record_value', {
                name: record.name,
                value: record.value,
            });

            mainContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**${fieldTitle}**\n${fieldValue}`));
        }

        mainContainer
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    await t(interaction, 'common.container.footer', { username: interaction.client.user.username })
                )
            );

        return interaction.editReply({
            components: [mainContainer],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
    },
};
