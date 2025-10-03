/**
 * @namespace: addons/economy/commands/account/edit.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedFooter } = require('@utils/discord');
const User = require('@coreModels/User');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('edit')
            .setDescription('👤 Edit your account and choose a bank type.')
            .addStringOption((option) =>
                option
                    .setName('bank')
                    .setDescription('Choose a new bank type')
                    .setRequired(true)
                    .addChoices(
                        { name: 'BCA', value: 'bca' },
                        { name: 'BNI', value: 'bni' },
                        { name: 'BRI', value: 'bri' },
                        { name: 'Mandiri', value: 'mandiri' },
                        { name: 'Danamon', value: 'danamon' },
                        { name: 'Permata', value: 'permata' },
                        { name: 'CIMB Niaga', value: 'cimbniaga' },
                        { name: 'Maybank', value: 'maybank' },
                        { name: 'HSBC', value: 'hsbc' },
                        { name: 'DBS', value: 'dbs' },
                        { name: 'OCBC', value: 'ocbc' },
                        { name: 'UOB', value: 'uob' }
                    )
            ),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const bankType = interaction.options.getString('bank');
            const userId = interaction.user.id;

            // Check if user has an account
            const existingUser = await User.getCache({ userId: userId, guildId: interaction.guild.id });
            if (!existingUser) {
                const embed = new EmbedBuilder()
                    .setColor(kythia.bot.color)
                    .setDescription(await t(interaction, 'economy_withdraw_no_account_desc'))
                    .setThumbnail(interaction.user.displayAvatarURL())
                    // .setTimestamp()
                    .setFooter(await embedFooter(interaction));
                return interaction.editReply({ embeds: [embed] });
            }

            // Update user's bank type
            existingUser.bankType = bankType;
            existingUser.changed('bankType', true);
            await existingUser.saveAndUpdateCache('userId');

            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(
                    await t(interaction, 'economy_account_edit_account_edit_success_desc', { bankType: bankType.toUpperCase() })
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error during account edit command execution:', error);
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t(interaction, 'economy_account_edit_account_edit_error_desc'))
                .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }
    },
};
