/**
 * @namespace: addons/economy/commands/account/create.js
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
            .setName('create')
            .setDescription('👤 Create an account and choose a bank type.')
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
        const bankType = interaction.options.getString('bank');
        const userId = interaction.user.id;
        const userBank = banks.getBank(bankType);
        const bankDisplay = `${userBank.emoji} ${userBank.name}`;
        const existingUser = await KythiaUser.getCache({ userId: userId });
        if (existingUser) {
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(await t(interaction, 'economy.account.create.account.create.already.desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        // Create new user account
        await KythiaUser.create({ userId, bankType });

        const embed = new EmbedBuilder()
            .setColor(kythiaConfig.bot.color)
            .setDescription(await t(interaction, 'economy.account.create.account.create.success.desc', { bankType: bankDisplay }))
            .setThumbnail(interaction.user.displayAvatarURL())
            .setFooter(await embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
    },
};
