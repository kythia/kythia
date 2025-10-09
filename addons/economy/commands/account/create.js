/**
 * @namespace: addons/economy/commands/account/create.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedFooter } = require('@utils/discord');
const User = require('@coreModels/User');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('create')
            .setDescription('👤 Create an account and choose a bank type.')
            .addStringOption((option) =>
                option
                    .setName('bank')
                    .setDescription('Choose a bank type')
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
        const bankType = interaction.options.getString('bank');
        const userId = interaction.user.id;

        const existingUser = await User.getCache({ userId: userId, guildId: interaction.guild.id });
        if (existingUser) {
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t(interaction, 'economy_account_create_account_create_already_desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        // Create new user account
        await User.create({ userId, guildId: interaction.guild.id, bankType, cash: 0, bank: 0 });

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(await t(interaction, 'economy_account_create_account_create_success_desc', { bankType: bankType.toUpperCase() }))
            .setThumbnail(interaction.user.displayAvatarURL())
            // .setTimestamp()
            .setFooter(await embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
    },
};
