/**
 * @namespace: addons/economy/commands/give.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('give')
            .setDescription('💰 Give kythia coin to another user.')
            .addUserOption((option) => option.setName('target').setDescription('User to give kythia coin to').setRequired(true))
            .addIntegerOption((option) => option.setName('amount').setDescription('Amount of kythia coin to give').setRequired(true)),
    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { KythiaUser } = models;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply();

        const target = interaction.options.getUser('target');
        const amount = interaction.options.getInteger('amount');

        const giver = await KythiaUser.getCache({ userId: interaction.user.id });
        if (!giver) {
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(await t(interaction, 'economy.withdraw.no.account.desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        if (amount <= 0) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription(await t(interaction, 'economy.give.give.invalid.amount'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        if (target.id === interaction.user.id) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription(await t(interaction, 'economy.give.give.self'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const receiver = await KythiaUser.getCache({ userId: target.id });
        if (!receiver) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'economy.give.give.no.target.account'))
                .setThumbnail(target.displayAvatarURL ? target.displayAvatarURL() : null)
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        if (giver.kythiaCoin < amount) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'economy.give.give.not.enough.cash'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const confirmEmbed = new EmbedBuilder()
            .setColor(kythiaConfig.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(
                await t(interaction, 'economy.give.give.confirm', {
                    amount,
                    target: target.username,
                })
            )
            .setFooter(await embedFooter(interaction));

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel(await t(interaction, 'economy.give.give.btn.confirm'))
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel(await t(interaction, 'economy.give.give.btn.cancel'))
                .setStyle(ButtonStyle.Danger)
        );

        await interaction.editReply({ embeds: [confirmEmbed], components: [row] });

        const filter = (i) => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'confirm') {
                giver.kythiaCoin = BigInt(giver.kythiaCoin) - BigInt(amount);
                receiver.kythiaCoin = BigInt(receiver.kythiaCoin) + BigInt(amount);

                giver.changed('kythiaCoin', true);
                receiver.changed('kythiaCoin', true);

                await giver.saveAndUpdateCache('userId');
                await receiver.saveAndUpdateCache('userId');

                const successEmbed = new EmbedBuilder()
                    .setColor(kythiaConfig.bot.color)
                    .setDescription(
                        await t(interaction, 'economy.give.give.success', {
                            amount,
                            target: target.username,
                        })
                    )
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setFooter(await embedFooter(interaction));
                await i.update({ embeds: [successEmbed], components: [] });

                const receiverEmbed = new EmbedBuilder()
                    .setColor(kythiaConfig.bot.color)
                    .setDescription(
                        await t(interaction, 'economy.give.give.received', {
                            amount,
                            from: interaction.user.username,
                        })
                    )
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setFooter(await embedFooter(interaction));
                try {
                    const member = await interaction.client.users.fetch(target.id);
                    await member.send({ embeds: [receiverEmbed] });
                } catch (e) {}
            } else if (i.customId === 'cancel') {
                const cancelEmbed = new EmbedBuilder()
                    .setColor(kythiaConfig.bot.color)
                    .setDescription(await t(interaction, 'economy.give.give.cancelled'))
                    .setFooter(await embedFooter(interaction));
                await i.update({ embeds: [cancelEmbed], components: [] });
            }
        });

        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setColor(kythiaConfig.bot.color)
                    .setDescription(await t(interaction, 'economy.give.give.timeout'))
                    .setFooter(await embedFooter(interaction));
                await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
            }
        });
    },
};
