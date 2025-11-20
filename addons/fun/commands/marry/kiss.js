/**
 * @namespace: addons/fun/commands/marry/kiss.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { EmbedBuilder } = require('discord.js');
const { Op } = require('sequelize');

const KISS_COOLDOWN = 3600;

module.exports = {
    data: (subcommand) => subcommand.setName('kiss').setDescription('😘 Kiss your partner'),
    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { Marriage } = models;
        const { embedFooter } = helpers.discord;
        const { convertColor } = helpers.color;
        const userId = interaction.user.id;
        const now = new Date();

        const marriages = await Marriage.getAllCache({
            where: {
                [Op.or]: [
                    { user1Id: userId, status: 'married' },
                    { user2Id: userId, status: 'married' },
                ],
            },
            limit: 1,
        });

        const marriage = marriages && marriages.length > 0 ? marriages[0] : null;

        if (!marriage) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'fun.marry.not.married'))
                .setFooter(await embedFooter(interaction));
            return interaction.reply({
                embeds: [embed],
            });
        }

        if (marriage.lastKiss && now - marriage.lastKiss < KISS_COOLDOWN) {
            const remaining = Math.ceil((KISS_COOLDOWN - (now - marriage.lastKiss)) / 60000);
            return interaction.reply({
                content: await t(interaction, 'fun.marry.kiss.cooldown', { minutes: remaining }),
                ephemeral: true,
            });
        }

        await marriage.update({
            lastKiss: now,
            loveScore: marriage.loveScore + 1,
        });

        const partnerId = marriage.user1Id === userId ? marriage.user2Id : marriage.user1Id;
        const partner = await interaction.client.users.fetch(partnerId).catch(() => null);

        const kissMessages = [
            await t(interaction, 'fun.marry.kiss.1', { user: interaction.user.toString(), partner: partner?.toString() || 'Unknown' }),
            await t(interaction, 'fun.marry.kiss.2', { user: interaction.user.toString(), partner: partner?.toString() || 'Unknown' }),
            await t(interaction, 'fun.marry.kiss.3', { user: interaction.user.toString(), partner: partner?.toString() || 'Unknown' }),
        ];

        const randomMessage = kissMessages[Math.floor(Math.random() * kissMessages.length)];

        const embed = new EmbedBuilder()
            .setColor(kythiaConfig.bot.color)
            .setDescription(randomMessage)
            .setFooter(await embedFooter(interaction));

        await interaction.reply({ embeds: [embed] });
    },
};
