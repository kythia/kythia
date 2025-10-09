/**
 * @namespace: addons/economy/commands/lootbox.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */
const { checkCooldown } = require('@utils/time');
const { embedFooter } = require('@utils/discord');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('@coreModels/User');
const ServerSetting = require('@coreModels/ServerSetting');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('lootbox').setDescription('🎁 Open a lootbox to get a random reward.'),
    async execute(interaction) {
        await interaction.deferReply();

        let user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t(interaction, 'economy_withdraw_no_account_desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const serverSetting = await ServerSetting.getCache({ guildId: interaction.guild.id });
        const cooldown = checkCooldown(user.lastLootbox, serverSetting.lootboxCooldown);
        if (cooldown.remaining) {
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t(interaction, 'economy_lootbox_lootbox_cooldown', { time: cooldown.time }))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        // Randomize lootbox reward between 100 and 500
        const randomReward = Math.floor(Math.random() * 401) + 100;
        user.cash += randomReward;
        user.lastLootbox = Date.now();
        user.changed('cash', true);
        user.changed('lastLootbox', true);
        await user.saveAndUpdateCache('userId');

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setTitle(await t(interaction, 'economy_lootbox_lootbox_title'))
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(await t(interaction, 'economy_lootbox_lootbox_success', { amount: randomReward }))
            // .setTimestamp()
            .setFooter(await embedFooter(interaction));
        await interaction.editReply({ embeds: [embed] });
    },
};
