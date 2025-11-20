/**
 * @namespace: addons/fun/commands/marry/divorce.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { EmbedBuilder } = require('discord.js');
const { Op } = require('sequelize');

const divorceConfirmations = new Map();
const DIVORCE_CONFIRM_EXPIRE = 1000 * 60 * 2;

module.exports = {
    data: (subcommand) => subcommand.setName('divorce').setDescription('💔 End your current marriage'),
    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { Marriage } = models;
        const { embedFooter } = helpers.discord;
        const { convertColor } = helpers.color;
        const userId = interaction.user.id;

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

        const partnerId = marriage.user1Id === userId ? marriage.user2Id : marriage.user1Id;
        const key = [marriage.user1Id, marriage.user2Id].sort().join('-');
        const now = Date.now();

        let confirmation = divorceConfirmations.get(key);

        if (!confirmation || now - confirmation.startedAt > DIVORCE_CONFIRM_EXPIRE) {
            divorceConfirmations.set(key, {
                confirmedBy: new Set([userId]),
                startedAt: now,
            });

            let partner;
            try {
                partner = await interaction.client.users.fetch(partnerId);
            } catch {
                partner = null;
            }

            if (partner) {
                const embed = new EmbedBuilder()
                    .setColor(kythiaConfig.bot.color)
                    .setDescription(
                        await t(interaction, 'fun.marry.divorce.partner.confirm', {
                            partnerName: interaction.user.username,
                            serverName: interaction.guild ? interaction.guild.name : 'the server',
                        })
                    )
                    .setFooter(await embedFooter(interaction));
                partner
                    .send({
                        embeds: [embed],
                    })
                    .catch(() => {});
            }

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                    await t(interaction, 'fun.marry.divorce.confirmation.needed', { partner: partner ? partner.tag : `ID: ${partnerId}` })
                )
                .setFooter(await embedFooter(interaction));
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (confirmation.confirmedBy.has(userId)) {
            return interaction.reply({
                content: await t(interaction, 'fun.marry.divorce.already.confirmed'),
                ephemeral: true,
            });
        }

        confirmation.confirmedBy.add(userId);

        if (confirmation.confirmedBy.has(marriage.user1Id) && confirmation.confirmedBy.has(marriage.user2Id)) {
            await marriage.update({ status: 'divorced' });
            divorceConfirmations.delete(key);

            let userA, userB;
            try {
                userA = await interaction.client.users.fetch(marriage.user1Id);
            } catch {}
            try {
                userB = await interaction.client.users.fetch(marriage.user2Id);
            } catch {}

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle(await t(interaction, 'fun.marry.divorced.title'))
                .setDescription(await t(interaction, 'fun.marry.divorced.description'))
                .setFooter(await embedFooter(interaction));

            for (let user of [userA, userB]) {
                if (user) {
                    user.send({ embeds: [embed] }).catch(() => {});
                }
            }

            return interaction.reply({ embeds: [embed] });
        } else {
            return interaction.reply({
                content: await t(interaction, 'fun.marry.divorce.confirmed.on.your.side'),
                ephemeral: true,
            });
        }
    },
};
