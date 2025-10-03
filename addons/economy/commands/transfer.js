/**
 * @namespace: addons/economy/commands/transfer.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('@coreModels/User');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('transfer')
            .setDescription('Transfer your money to another user.')
            .addUserOption((option) => option.setName('target').setDescription('User to transfer money to').setRequired(true))
            .addIntegerOption((option) => option.setName('amount').setDescription('Amount of money to transfer').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        try {
            const target = interaction.options.getUser('target');
            const amount = interaction.options.getInteger('amount');

            const giver = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });
            const receiver = await User.getCache({ userId: target.id, guildId: interaction.guild.id });

            if (!giver) {
                const embed = new EmbedBuilder()
                    .setColor(kythia.bot.color)
                    .setDescription(await t(interaction, 'economy_withdraw_no_account_desc'))
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setTimestamp()
                    .setFooter(await embedFooter(interaction));
                return interaction.editReply({ embeds: [embed] });
            }

            if (giver.bank < amount) {
                const embed = new EmbedBuilder()
                    .setColor(kythia.bot.color)
                    .setDescription(await t(interaction, 'economy_transfer_transfer_not_enough_bank'))
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setTimestamp()
                    .setFooter(await embedFooter(interaction));
                return interaction.editReply({ embeds: [embed] });
            }
            if (!receiver) {
                const embed = new EmbedBuilder()
                    .setColor(kythia.bot.color)
                    .setDescription(await t(interaction, 'economy_transfer_transfer_target_no_account'))
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setTimestamp()
                    .setFooter(await embedFooter(interaction));
                return interaction.editReply({ embeds: [embed] });
            }
            if (giver.userId === receiver.userId) {
                const embed = new EmbedBuilder()
                    .setColor(kythia.bot.color)
                    .setDescription(await t(interaction, 'economy_transfer_transfer_self'))
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setTimestamp()
                    .setFooter(await embedFooter(interaction));
                return interaction.editReply({ embeds: [embed] });
            }
            let fee = 0;
            if (giver.bankType !== receiver.bankType) {
                fee = Math.floor(amount * 0.05);
            }
            if (giver.bank < amount + fee) {
                const embed = new EmbedBuilder()
                    .setColor(kythia.bot.color)
                    .setDescription(await t(interaction, 'economy_transfer_transfer_not_enough_bank_fee', { fee }))
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setTimestamp()
                    .setFooter(await embedFooter(interaction));
                return interaction.editReply({ embeds: [embed] });
            }

            // Prepare confirmation embed
            const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

            const confirmEmbed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(
                    await t(interaction, 'economy_transfer_transfer_confirm', {
                        amount,
                        target: target.username,
                        fee,
                    })
                )
                .setTimestamp()
                .setFooter(await embedFooter(interaction));

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel(await t(interaction, 'economy_transfer_transfer_btn_confirm'))
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel(await t(interaction, 'economy_transfer_transfer_btn_cancel'))
                    .setStyle(ButtonStyle.Danger)
            );

            await interaction.editReply({ embeds: [confirmEmbed], components: [row] });

            const filter = (i) => i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

            collector.on('collect', async (i) => {
                if (i.customId === 'confirm') {
                    // Do the transfer
                    giver.bank -= amount + fee;
                    receiver.bank += amount;

                    giver.changed('bank', true);
                    receiver.changed('bank', true);
                    await giver.saveAndUpdateCache('userId');
                    await receiver.saveAndUpdateCache('userId');

                    const embed = new EmbedBuilder()
                        .setColor(kythia.bot.color)
                        .setThumbnail(interaction.user.displayAvatarURL())
                        .setDescription(
                            await t(interaction, 'economy_transfer_transfer_success', {
                                amount,
                                target: target.username,
                                fee,
                            })
                        )
                        .setTimestamp()
                        .setFooter(await embedFooter(interaction));
                    await i.update({ embeds: [embed], components: [] });

                    const targetEmbed = new EmbedBuilder()
                        .setColor(kythia.bot.color)
                        .setThumbnail(interaction.user.displayAvatarURL())
                        .setDescription(
                            await t(interaction, 'economy_transfer_transfer_received', {
                                amount,
                                from: interaction.user.username,
                            })
                        )
                        .setTimestamp()
                        .setFooter(await embedFooter(interaction));
                    try {
                        await target.send({ embeds: [targetEmbed] });
                    } catch (e) {
                        // ignore DM errors
                    }
                } else if (i.customId === 'cancel') {
                    const embed = new EmbedBuilder()
                        .setColor(kythia.bot.color)
                        .setDescription(await t(interaction, 'economy_transfer_transfer_cancelled'))
                        .setTimestamp()
                        .setFooter(await embedFooter(interaction));
                    await i.update({ embeds: [embed], components: [] });
                }
            });

            collector.on('end', async (collected) => {
                if (collected.size === 0) {
                    const embed = new EmbedBuilder()
                        .setColor(kythia.bot.color)
                        .setDescription(await t(interaction, 'economy_transfer_transfer_timeout'))
                        .setTimestamp()
                        .setFooter(await embedFooter(interaction));
                    await interaction.editReply({ embeds: [embed], components: [] });
                }
            });
        } catch (error) {
            console.error('Error during transfer command execution:', error);
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t(interaction, 'economy_transfer_transfer_error'))
                .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }
    },
};
