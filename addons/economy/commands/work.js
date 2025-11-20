/**
 * @namespace: addons/economy/commands/work.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');
const banks = require('../helpers/banks');
const jobs = require('../helpers/jobs');

module.exports = {
    subcommand: true,
    aliases: ['work'],
    data: (subcommand) => subcommand.setName('work').setDescription('⚒️ Work to earn money with various scenarios!'),

    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { KythiaUser, Inventory } = models;
        const { embedFooter } = helpers.discord;
        const { checkCooldown } = helpers.time;
        await interaction.deferReply();

        const user = await KythiaUser.getCache({ userId: interaction.user.id });
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(await t(interaction, 'economy.withdraw.no.account.desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const userInventory = await Inventory.getAllCache({ userId: user.userId });

        const cooldown = checkCooldown(user.lastWork, kythiaConfig.addons.economy.workCooldown || 28800, interaction);

        if (cooldown.remaining) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription(
                    `## ${await t(interaction, 'economy.work.work.cooldown.title')}\n${await t(interaction, 'economy.work.work.cooldown.desc', { time: cooldown.time })}`
                )
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        let availableJobs = [];
        const userItemNames = new Set(userInventory.map((item) => item.itemName));

        const tierKeys = Object.keys(jobs).sort().reverse();

        for (const tierKey of tierKeys) {
            const tier = jobs[tierKey];
            let hasRequirement = false;

            if (tier.requiredItem === null) {
                hasRequirement = true;
            } else if (Array.isArray(tier.requiredItem)) {
                if (tier.requiredItem.some((item) => userItemNames.has(item))) {
                    hasRequirement = true;
                }
            } else {
                if (userItemNames.has(tier.requiredItem)) {
                    hasRequirement = true;
                }
            }

            if (hasRequirement) {
                availableJobs = [...tier.jobs];
                break;
            }
        }

        if (availableJobs.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                    `## ${await t(interaction, 'economy.work.work.no.job.title')}\n${await t(interaction, 'economy.work.work.no.job.desc')}`
                )
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const job = availableJobs[Math.floor(Math.random() * availableJobs.length)];
        const scenario = job.scenarios[Math.floor(Math.random() * job.scenarios.length)];

        const jobName = await t(interaction, job.nameKey);
        const scenarioDesc = await t(interaction, scenario.descKey);

        const baseEarning = Math.floor(Math.random() * (job.basePay[1] - job.basePay[0] + 1)) + job.basePay[0];
        const careerBonus = Math.floor(baseEarning * (user.careerLevel || 0) * 0.05);

        const userBank = banks.getBank(user.bankType);
        const incomeBonusPercent = userBank.incomeBonusPercent;
        const bankBonus = Math.floor(baseEarning * (incomeBonusPercent / 100));

        const finalEarning = Math.floor(baseEarning * scenario.modifier) + careerBonus + bankBonus;

        user.kythiaCoin = BigInt(user.kythiaCoin) + BigInt(finalEarning);
        user.lastWork = new Date();

        let levelUpText = '';
        if (scenario.outcome === 'success' && (user.careerLevel || 0) < 50) {
            user.careerLevel = (user.careerLevel || 0) + 1;
            levelUpText = `\n\n${await t(interaction, 'economy.work.work.levelup.text', { level: user.careerLevel })}`;
        }

        user.changed('kythiaCoin', true);

        await user.saveAndUpdateCache();

        const outcomeColors = {
            success: 'Green',
            neutral: 'Blue',
            failure: 'Red',
        };

        const resultEmbed = new EmbedBuilder()
            .setColor(outcomeColors[scenario.outcome])
            .setAuthor({
                name: await t(interaction, 'economy.work.work.result.author', { job: jobName, emoji: job.emoji }),
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription(`${await t(interaction, 'eco.work.result.title.outcome')}\n*${scenarioDesc}*${levelUpText}`)
            .addFields(
                {
                    name: await t(interaction, 'economy.work.work.basepay.field'),
                    value: `🪙 ${baseEarning.toLocaleString()}`,
                    inline: true,
                },
                {
                    name: await t(interaction, 'economy.work.work.bonus.field', { modifier: scenario.modifier }),
                    value: `🪙 ${(finalEarning - baseEarning).toLocaleString()}`,
                    inline: true,
                },
                {
                    name: await t(interaction, 'economy.work.work.total.field'),
                    value: `**💰 ${finalEarning.toLocaleString()}**`,
                    inline: true,
                }
            )
            .setFooter(await embedFooter(interaction));

        await interaction.editReply({ embeds: [resultEmbed] });
    },
};
