/**
 * @namespace: addons/pro/commands/dns/delete.js
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
            .setName('delete')
            .setDescription('🌐 Delete a DNS record from your subdomain.')
            .addStringOption((option) =>
                option.setName('record').setDescription('Select the record you want to delete').setRequired(true).setAutocomplete(true)
            ),

    async autocomplete(interaction, container) {
        const { models, logger, kythiaConfig } = container;
        const { Subdomain, DnsRecord } = models;
        const focusedValue = interaction.options.getFocused()?.toLowerCase?.() || '';

        const baseDomain = kythiaConfig.addons.pro.cloudflare.domain || 'kyth.me';

        try {
            const userRecords = await DnsRecord.getAllCache({
                include: {
                    model: Subdomain,
                    as: 'subdomain',
                    where: { userId: interaction.user.id },
                    attributes: ['name'],
                },
            });

            if (!userRecords || userRecords.length === 0) {
                return interaction.respond([{ name: 'You have no DNS records to delete.', value: 'none' }]);
            }

            const filtered = userRecords
                .filter(
                    (record) =>
                        record.subdomain?.name?.toLowerCase().includes(focusedValue) ||
                        record.name?.toLowerCase().includes(focusedValue) ||
                        record.value?.toLowerCase().includes(focusedValue) ||
                        record.type?.toLowerCase().includes(focusedValue)
                )
                .slice(0, 25);

            if (filtered.length === 0) {
                return interaction.respond([{ name: 'No matching DNS records.', value: 'none' }]);
            }

            await interaction.respond(
                filtered.map((record) => {
                    const fqdn = `${record.subdomain.name}.${baseDomain}`;
                    const recordName = record.name === '@' ? fqdn : `${record.name}.${fqdn}`;
                    const truncatedValue = record.value.length > 30 ? record.value.substring(0, 30) + '...' : record.value;

                    return {
                        name: `[${record.type}] ${recordName} -> ${truncatedValue}`,
                        value: record.id.toString(),
                    };
                })
            );
        } catch (err) {
            logger.error(`[DNS Delete Autocomplete] Error: ${err.message}`);
            await interaction.respond([{ name: 'Error loading DNS records.', value: 'none' }]);
        }
    },

    async execute(interaction, container) {
        const { logger, kythiaConfig, models, helpers, t } = container;
        const cloudflareApi = container.services.cloudflare;
        const { Subdomain, DnsRecord } = models;
        const { simpleContainer, isPremium, isVoterActive } = helpers.discord;

        await interaction.deferReply({ ephemeral: true });

        const isPremiumDonatur = await isPremium(interaction.user.id);
        const isVoter = await isVoterActive(interaction.user.id);

        if (!isPremiumDonatur && !isVoter) {
            const desc = await t(interaction, 'pro.dns.delete.error_notPremium');
            return interaction.editReply({
                components: await simpleContainer(interaction, desc, { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        const databaseRecordId = interaction.options.getString('record');

        if (databaseRecordId === 'none') {
            const desc = await t(interaction, 'pro.dns.delete.error_noRecords');
            return interaction.editReply({
                components: await simpleContainer(interaction, desc, { color: 'Yellow' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        const recordToDelete = await DnsRecord.getCache({
            id: databaseRecordId,
            include: {
                model: Subdomain,
                as: 'subdomain',
                attributes: ['userId', 'name'],
            },
        });

        if (!recordToDelete) {
            const desc = await t(interaction, 'pro.dns.delete.error_notFound');
            return interaction.editReply({
                components: await simpleContainer(interaction, desc, { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        if (recordToDelete.subdomain.userId !== interaction.user.id) {
            const desc = await t(interaction, 'pro.dns.delete.error_notOwner');
            return interaction.editReply({
                components: await simpleContainer(interaction, desc, { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        if (!recordToDelete.cloudflareId) {
            logger.warn(`[DNS Delete] Record ID ${recordToDelete.id} adalah zombie (tidak ada cloudflareId). Menghapus dari DB...`);
            await recordToDelete.destroy();

            const title = await t(interaction, 'pro.dns.delete.success_title');
            const desc = await t(interaction, 'pro.dns.delete.orphaned_desc');
            return interaction.editReply({
                components: await simpleContainer(interaction, desc, { title: title, color: 'Green' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        const recordIdAsNumber = parseInt(databaseRecordId, 10);

        const result = await cloudflareApi.deleteRecord(recordIdAsNumber);

        if (result.success) {
            try {
                await recordToDelete.destroy();
            } catch (e) {
                logger.warn(`[DNS Delete] Gagal destroy record (mungkin udah di-destroy service): ${e.message}`);
            }

            const title = await t(interaction, 'pro.dns.delete.success_title');
            const baseDomain = kythiaConfig.addons.pro.cloudflare.domain || 'kyth.me';
            const recordName =
                recordToDelete.name === '@'
                    ? `${recordToDelete.subdomain.name}.${baseDomain}`
                    : `${recordToDelete.name}.${recordToDelete.subdomain.name}.${baseDomain}`;

            const desc = await t(interaction, 'pro.dns.delete.success_desc', {
                type: recordToDelete.type,
                name: recordName,
                value: recordToDelete.value,
            });
            return interaction.editReply({
                components: await simpleContainer(interaction, desc, { title: title, color: 'Green' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        } else {
            const title = await t(interaction, 'pro.dns.delete.error_failedTitle');
            const desc = await t(interaction, 'pro.dns.delete.error_failedDesc', { error: result.error });
            return interaction.editReply({
                components: await simpleContainer(interaction, desc, { title: title, color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }
    },
};
