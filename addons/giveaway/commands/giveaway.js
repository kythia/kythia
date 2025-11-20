/**
 * @namespace: addons/giveaway/commands/giveaway.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.16-beta (UX IMPROVEMENT)
 */

const { SlashCommandBuilder, PermissionFlagsBits, InteractionContextType } = require('discord.js');
const { Op } = require('sequelize');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('🎉 Create a giveaway event')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('start')
                .setDescription('Start a giveaway')
                .addStringOption((option) => option.setName('duration').setDescription('Duration (1d 2h)').setRequired(true))
                .addIntegerOption((option) => option.setName('winners').setDescription('Count').setRequired(true))
                .addStringOption((option) => option.setName('prize').setDescription('Prize').setRequired(true))
                .addStringOption((option) => option.setName('description').setDescription('Description for the giveaway').setRequired(false))
                .addStringOption((option) => option.setName('color').setDescription('Hex Color').setRequired(false))
                .addRoleOption((option) => option.setName('role').setDescription('Req Role').setRequired(false))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('end')
                .setDescription('End a giveaway manually')
                .addStringOption((option) =>
                    option.setName('giveaway').setDescription('Search active giveaway').setAutocomplete(true).setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('cancel')
                .setDescription('Cancel a running giveaway')
                .addStringOption((option) =>
                    option.setName('giveaway').setDescription('Search active giveaway').setAutocomplete(true).setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('reroll')
                .setDescription('Reroll winners for a finished giveaway')
                .addStringOption((option) =>
                    option.setName('giveaway').setDescription('Search ended giveaway').setAutocomplete(true).setRequired(true)
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setContexts(InteractionContextType.Guild),

    async autocomplete(interaction, container) {
        const focusedValue = interaction.options.getFocused();
        const subcommand = interaction.options.getSubcommand();
        const { Giveaway } = container.models;

        let whereClause = {
            guildId: interaction.guild.id,
            prize: { [Op.like]: `%${focusedValue}%` },
        };

        if (['end', 'cancel'].includes(subcommand)) {
            whereClause.ended = false;
        } else if (subcommand === 'reroll') {
            whereClause.ended = true;

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            whereClause.endTime = {
                [Op.gte]: sevenDaysAgo,
            };
        }

        try {
            const choices = await Giveaway.findAll({
                where: whereClause,
                limit: 20,
                order: [['endTime', 'DESC']],
            });

            const result = choices.map((g) => {
                const dateStr = new Date(g.endTime).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                });

                let prizeName = g.prize.length > 25 ? g.prize.substring(0, 25) + '...' : g.prize;

                return {
                    name: `🎁 ${prizeName} (${dateStr}) #${g.messageId.slice(-4)}`,
                    value: g.messageId,
                };
            });

            await interaction.respond(result);
        } catch (error) {
            console.error('[Giveaway Autocomplete] Error:', error);
            await interaction.respond([]);
        }
    },

    async execute(interaction, container) {
        const { giveawayManager } = container;
        const subcommand = interaction.options.getSubcommand();

        const messageId = interaction.options.getString('giveaway');

        if (subcommand === 'start') {
            return giveawayManager.createGiveaway(interaction);
        }
        if (subcommand === 'end') {
            return giveawayManager.endGiveaway(messageId, interaction);
        }
        if (subcommand === 'cancel') {
            return giveawayManager.cancelGiveaway(messageId, interaction);
        }
        if (subcommand === 'reroll') {
            return giveawayManager.rerollGiveaway(messageId, interaction);
        }
    },
};
