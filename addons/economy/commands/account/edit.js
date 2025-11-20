/**
 * @namespace: addons/economy/commands/account/edit.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');
const banks = require('../../helpers/banks');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('edit')
            .setDescription('👤 Edit your account and choose a bank type.')
            .addStringOption((option) =>
                option
                    .setName('bank')
                    .setDescription('Each bank offers unique benefits for your playstyle!')
                    .setRequired(true)
                    .addChoices(
                        ...banks.getAllBanks().map((bank) => ({
                            name: `${bank.emoji} ${bank.name}`,
                            value: bank.id,
                        }))
                    )
            ),
    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { KythiaUser } = models;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply();
        try {
            const bankType = interaction.options.getString('bank');
            const userId = interaction.user.id;
            const userBank = banks.getBank(bankType);
            const bankDisplay = `${userBank.emoji} ${userBank.name}`;

            // Check if user has an account
            const existingUser = await KythiaUser.getCache({ userId: userId });
            if (!existingUser) {
                const embed = new EmbedBuilder()
                    .setColor(kythiaConfig.bot.color)
                    .setDescription(await t(interaction, 'economy.withdraw.no.account.desc'))
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setFooter(await embedFooter(interaction));
                return interaction.editReply({ embeds: [embed] });
            }

            // Update user's bank type
            existingUser.bankType = bankType;
            existingUser.changed('bankType', true);
            await existingUser.saveAndUpdateCache('userId');

            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(await t(interaction, 'economy.account.edit.account.edit.success.desc', { bankType: bankDisplay }))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error during account edit command execution:', error);
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(await t(interaction, 'economy.account.edit.account.edit.error.desc'))
                .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }
    },
};
