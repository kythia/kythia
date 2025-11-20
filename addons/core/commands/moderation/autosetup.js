/**
 * @namespace: addons/core/commands/moderation/autosetup.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Helper: Create rule with retry, up to 10x using exponential backoff.
 */
async function createRuleWithRetry(guild, ruleOptions, ruleNameForLog, container) {
    const { t, logger } = container;
    let lastError = null;
    const retryLimit = 10;
    for (let attempt = 1; attempt <= retryLimit; attempt++) {
        try {
            await guild.autoModerationRules.create(ruleOptions);
            logger.info(`Success: Rule "${ruleNameForLog}" on attempt ${attempt}.`);
            return true;
        } catch (error) {
            lastError = error;
            if (error.message.includes('Invalid Form Body') && error.message.includes('Value must be one of (1,)')) {
                if (attempt < retryLimit) {
                    const waitTime = attempt * 1000;
                    logger.warn(
                        `Failed attempt ${attempt}/${retryLimit} (Race Condition) rule "${ruleNameForLog}". Retrying in ${waitTime / 1000} seconds...`
                    );
                    await wait(waitTime);
                }
            } else {
                logger.error(`Permanent failure creating rule "${ruleNameForLog}": ${error.message}`);
                throw error;
            }
        }
    }

    logger.error(`Total failure creating rule "${ruleNameForLog}" after ${retryLimit} attempts.`);
    throw lastError;
}

module.exports = {
    data: (subcommand) => subcommand.setName('autosetup').setDescription('Installs/re-installs a set of 6 core AutoMod rules.'),
    permissions: PermissionFlagsBits.ManageGuild,
    botPermissions: PermissionFlagsBits.ManageGuild,

    async execute(interaction, container) {
        const { t, logger } = container;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const { guild, client } = interaction;
        const botId = client.user.id;
        const totalRules = 6;

        const createdRuleNames = [];
        const failedRules = [];

        try {
            // ===== 1. CLEANING OLD RULES =====
            const cleaningEmbed = new EmbedBuilder()
                .setColor('Blurple')
                .setDescription(
                    `## ${await t(interaction, 'core.moderation.autosetup.embed.cleaning.title')}\n` +
                        (await t(interaction, 'core.moderation.autosetup.embed.cleaning.desc'))
                );
            await interaction.editReply({ content: '', embeds: [cleaningEmbed] });

            const existingRules = await guild.autoModerationRules.fetch();
            const kythiaRules = existingRules.filter((rule) => rule.name.startsWith('[Kythia]'));

            if (kythiaRules.size > 0) {
                for (const rule of kythiaRules.values()) {
                    await rule.delete('Re-installing Kythia AutoMod rules.');
                    await wait(500);
                }
            }

            await wait(3000);

            // ===== 2. INSTALLING NEW RULES (WITH RETRY) =====
            const installingEmbed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription(
                    `## ${await t(interaction, 'core.moderation.autosetup.embed.installing.title')}\n` +
                        (await t(interaction, 'core.moderation.autosetup.embed.installing.desc', { total: totalRules }))
                );
            await interaction.editReply({ content: '', embeds: [installingEmbed] });
            await wait(1000);

            // --- Rule 1: Bad Words (Presets) ---
            try {
                const options = {
                    name: '[Kythia] Block Bad Words (Presets)',
                    creatorId: botId,
                    enabled: true,
                    eventType: 1,
                    triggerType: 4,
                    triggerMetadata: { presets: [1, 2, 3] },
                    actions: [{ type: 1 }],
                };
                await createRuleWithRetry(guild, options, 'Bad Words', container);
                createdRuleNames.push(await t(interaction, 'core.moderation.autosetup.embed.rules.badwords'));
            } catch (e) {
                failedRules.push({ name: await t(interaction, 'core.moderation.autosetup.embed.rules.badwords'), error: e.message });
            }

            // --- Rule 2: Suspected Spam ---
            try {
                const options = {
                    name: '[Kythia] Block Suspected Spam',
                    creatorId: botId,
                    enabled: true,
                    eventType: 1,
                    triggerType: 3,
                    triggerMetadata: {},
                    actions: [{ type: 1 }],
                };
                await createRuleWithRetry(guild, options, 'Suspected Spam', container);
                createdRuleNames.push(await t(interaction, 'core.moderation.autosetup.embed.rules.suspectedspam'));
            } catch (e) {
                failedRules.push({ name: await t(interaction, 'core.moderation.autosetup.embed.rules.suspectedspam'), error: e.message });
            }

            // --- Rule 3: Mass Mentions ---
            try {
                const options = {
                    name: '[Kythia] Block Mass Mentions (Users & Roles)',
                    creatorId: botId,
                    enabled: true,
                    eventType: 1,
                    triggerType: 5,
                    triggerMetadata: { mentionTotalLimit: 6 },
                    actions: [{ type: 1 }],
                };
                await createRuleWithRetry(guild, options, 'Mass Mentions', container);
                createdRuleNames.push(await t(interaction, 'core.moderation.autosetup.embed.rules.massmentions'));
            } catch (e) {
                failedRules.push({ name: await t(interaction, 'core.moderation.autosetup.embed.rules.massmentions'), error: e.message });
            }

            // --- Rule 4: Discord Invites ---
            try {
                const options = {
                    name: '[Kythia] Block Discord Invites',
                    creatorId: botId,
                    enabled: true,
                    eventType: 1,
                    triggerType: 1,
                    triggerMetadata: { keywordFilter: ['discord.gg/', 'discord.com/invite/'] },
                    actions: [{ type: 1 }],
                };
                await createRuleWithRetry(guild, options, 'Discord Invites', container);
                createdRuleNames.push(await t(interaction, 'core.moderation.autosetup.embed.rules.invites'));
            } catch (e) {
                failedRules.push({ name: await t(interaction, 'core.moderation.autosetup.embed.rules.invites'), error: e.message });
            }

            // --- Rule 5: Scam Links ---
            try {
                const options = {
                    name: '[Kythia] Block Scam & Phishing Links',
                    creatorId: botId,
                    enabled: true,
                    eventType: 1,
                    triggerType: 1,
                    triggerMetadata: {
                        keywordFilter: [
                            'nitro for free',
                            'free steam',
                            'steamcommunily',
                            'disord.gift',
                            '.ru/gift',
                            '.xyz/gift',
                            '.gift',
                            'airdrop',
                            'steamgift',
                        ],
                    },
                    actions: [{ type: 1 }],
                };
                await createRuleWithRetry(guild, options, 'Scam Links', container);
                createdRuleNames.push(await t(interaction, 'core.moderation.autosetup.embed.rules.scamlinks'));
            } catch (e) {
                failedRules.push({ name: await t(interaction, 'core.moderation.autosetup.embed.rules.scamlinks'), error: e.message });
            }

            // --- Rule 6: Excessive Caps ---
            try {
                const options = {
                    name: '[Kythia] Block Excessive Caps',
                    creatorId: botId,
                    enabled: true,
                    eventType: 1,
                    triggerType: 1,
                    triggerMetadata: {
                        regexPatterns: ['^[A-Z0-9\\s!@#$%^&*()_+\\-=\\[\\]{}|;\':",.<>/?`~]{30,}$'],
                        allowList: [],
                    },
                    actions: [{ type: 1 }],
                };
                await createRuleWithRetry(guild, options, 'Excessive Caps', container);
                createdRuleNames.push(await t(interaction, 'core.moderation.autosetup.embed.rules.caps'));
            } catch (e) {
                failedRules.push({ name: await t(interaction, 'core.moderation.autosetup.embed.rules.caps'), error: e.message });
            }

            // ===== 3. FINAL REPORT =====

            const isFullySuccessful = failedRules.length === 0;
            const finalEmbed = new EmbedBuilder()
                .setColor(isFullySuccessful ? 'Green' : 'Orange')
                .setDescription(
                    `## ${
                        isFullySuccessful
                            ? await t(interaction, 'core.moderation.autosetup.embed.final.success.title', { total: totalRules })
                            : await t(interaction, 'core.moderation.autosetup.embed.final.failed.title', { count: failedRules.length })
                    }\n${
                        isFullySuccessful
                            ? await t(interaction, 'core.moderation.autosetup.embed.final.success.desc')
                            : await t(interaction, 'core.moderation.autosetup.embed.final.failed.desc')
                    }`
                )
                .addFields({
                    name: await t(interaction, 'core.moderation.autosetup.embed.final.installed.title', { count: createdRuleNames.length }),
                    value:
                        createdRuleNames.length > 0
                            ? createdRuleNames.map((r) => `• ${r}`).join('\n')
                            : await t(interaction, 'core.moderation.autosetup.embed.final.installed.empty'),
                });

            if (!isFullySuccessful) {
                finalEmbed.addFields({
                    name: await t(interaction, 'core.moderation.autosetup.embed.final.failedrules.title', { count: failedRules.length }),
                    value: failedRules.map((f) => `• **${f.name}**\n  \`${f.error}\``).join('\n'),
                });
                finalEmbed.setFooter({
                    text: await t(interaction, 'core.moderation.autosetup.embed.final.failedrules.footer'),
                });
            } else {
                finalEmbed.setFooter({ text: await t(interaction, 'core.moderation.autosetup.embed.final.footer') });
            }

            await interaction.editReply({ content: '', embeds: [finalEmbed] });
        } catch (error) {
            // Only for an error during CLEANING/STAGE 1
            logger.error('Error during AutoMod CLEANING:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                    `## ${await t(interaction, 'core.moderation.autosetup.embed.error.title')}\n` +
                        (await t(interaction, 'core.moderation.autosetup.embed.error.desc'))
                );
            await interaction.editReply({ content: '', embeds: [errorEmbed] });
        }
    },
};
