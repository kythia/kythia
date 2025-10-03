/**
 * @namespace: addons/economy/commands/work.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedFooter } = require('@utils/discord');
const { checkCooldown } = require('@utils/time');
const Inventory = require('@coreModels/Inventory');
const User = require('@coreModels/User');
const ServerSetting = require('@coreModels/ServerSetting');
const jobs = require('../helpers/jobs');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('work').setDescription('⚒️ Work to earn money with various scenarios!'),

    async execute(interaction, container) {
        await interaction.deferReply();
        // const { t } = container || {}; // now always require from @utils/translator

        const user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t?.(interaction, 'economy_withdraw_no_account_desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const serverSetting = await ServerSetting.getCache({ guildId: interaction.guild.id });
        const userInventory = await Inventory.getAllCache({ where: { userId: user.userId } });

        // --- Cek Cooldown (tidak dipengaruhi item lagi) ---
        const cooldown = checkCooldown(user.lastWork, serverSetting.workCooldown);
        if (cooldown.remaining) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription(
                    `## ${await t(interaction, 'economy_work_work_cooldown_title')}\n${await t(interaction, 'economy_work_work_cooldown_desc', { time: cooldown.time })}`
                )
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        let availableJobs = [];
        const userItemNames = new Set(userInventory.map((item) => item.itemName));

        // 1. Ambil semua kunci tier (tier1, tier2, dst) dan urutkan dari TERTINGGI ke terendah
        const tierKeys = Object.keys(jobs).sort().reverse();

        // 2. Loop dari tier tertinggi
        for (const tierKey of tierKeys) {
            const tier = jobs[tierKey];
            let hasRequirement = false;

            // Logika pengecekan item tetap sama
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

            // 3. JIKA syarat terpenuhi, langsung isi daftarnya dan HENTIKAN PENCARIAN!
            if (hasRequirement) {
                availableJobs = [...tier.jobs];
                break; // <-- Ini kuncinya! Loop berhenti setelah menemukan tier tertinggi yang valid.
            }
        }

        // Fallback jika user benar-benar tidak punya pekerjaan (seharusnya tidak terjadi)
        if (availableJobs.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                    `## ${await t(interaction, 'economy_work_work_no_job_title')}\n${await t(interaction, 'economy_work_work_no_job_desc')}`
                )
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const job = availableJobs[Math.floor(Math.random() * availableJobs.length)];
        const scenario = job.scenarios[Math.floor(Math.random() * job.scenarios.length)];

        // --- Penerjemahan Dinamis ---
        const jobName = await t(interaction, job.nameKey);
        const scenarioDesc = await t(interaction, scenario.descKey);

        // --- Kalkulasi Gaji ---
        const baseEarning = Math.floor(Math.random() * (job.basePay[1] - job.basePay[0] + 1)) + job.basePay[0];
        const careerBonus = Math.floor(baseEarning * (user.careerLevel || 0) * 0.05);
        const finalEarning = Math.floor(baseEarning * scenario.modifier) + careerBonus;

        user.cash += finalEarning;
        user.lastWork = new Date();

        // --- Sistem Level Up Karir ---
        let levelUpText = '';
        if (scenario.outcome === 'success' && (user.careerLevel || 0) < 50) {
            user.careerLevel = (user.careerLevel || 0) + 1;
            levelUpText = `\n\n${await t(interaction, 'economy_work_work_levelup_text', { level: user.careerLevel })}`;
        }

        await user.saveAndUpdateCache();

        // --- Embed Hasil Kerja yang Dinamis & Keren ---
        const outcomeColors = {
            success: 'Green',
            neutral: 'Blue',
            failure: 'Red',
        };

        const resultEmbed = new EmbedBuilder()
            .setColor(outcomeColors[scenario.outcome])
            .setAuthor({
                name: await t(interaction, 'economy_work_work_result_author', { job: jobName, emoji: job.emoji }),
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription(`${await t(interaction, `eco_work_result_title_outcome`)}\n*${scenarioDesc}*${levelUpText}`)
            .addFields(
                {
                    name: await t(interaction, 'economy_work_work_basepay_field'),
                    value: `🪙 ${baseEarning.toLocaleString()}`,
                    inline: true,
                },
                {
                    name: await t(interaction, 'economy_work_work_bonus_field', { modifier: scenario.modifier }),
                    value: `🪙 ${(finalEarning - baseEarning).toLocaleString()}`,
                    inline: true,
                },
                {
                    name: await t(interaction, 'economy_work_work_total_field'),
                    value: `**💰 ${finalEarning.toLocaleString()}**`,
                    inline: true,
                }
            )
            .setFooter(await embedFooter(interaction));

        await interaction.editReply({ embeds: [resultEmbed] });
    },
};
