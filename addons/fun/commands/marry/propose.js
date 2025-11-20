/**
 * @namespace: addons/fun/commands/marry/propose.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
    Embed,
} = require('discord.js');
const { Op } = require('sequelize');

module.exports = {
    data: (subcommand) =>
        subcommand
            .setName('propose')
            .setDescription('💍 Propose to another user')
            .addUserOption((option) => option.setName('user').setDescription('The user you want to propose to').setRequired(true)),
    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { Marriage } = models;
        const { embedFooter } = helpers.discord;
        const { convertColor } = helpers.color;

        const targetUser = interaction.options.getUser('user');
        const proposer = interaction.user;
        const proposerId = proposer.id;
        const targetId = targetUser.id;

        const existingMarriages = await Marriage.getAllCache({
            where: {
                [Op.or]: [
                    { user1Id: proposerId, status: { [Op.in]: ['pending', 'married'] } },
                    { user2Id: proposerId, status: { [Op.in]: ['pending', 'married'] } },
                    { user1Id: targetId, status: { [Op.in]: ['pending', 'married'] } },
                    { user2Id: targetId, status: { [Op.in]: ['pending', 'married'] } },
                ],
            },
            limit: 1,
        });

        const existingMarriage = existingMarriages && existingMarriages.length > 0 ? existingMarriages[0] : null;

        if (existingMarriage) {
            return interaction.reply({
                content: await t(interaction, 'fun.marry.already.married'),
                ephemeral: true,
            });
        }

        if (targetUser.bot) {
            return interaction.reply({
                content: await t(interaction, 'fun.marry.bot.error'),
                ephemeral: true,
            });
        }

        if (targetId === proposerId) {
            return interaction.reply({
                content: await t(interaction, 'fun.marry.yourself.error'),
                ephemeral: true,
            });
        }

        const marriage = await Marriage.create({
            user1Id: proposerId,
            user2Id: targetId,
            status: 'pending',
        });

        const proposerAvatar =
            proposer.displayAvatarURL({ extension: 'png', size: 256 }) || 'https://cdn.discordapp.com/embed/avatars/0.png';
        const targetAvatar = targetUser.displayAvatarURL
            ? targetUser.displayAvatarURL({ extension: 'png', size: 256 })
            : 'https://cdn.discordapp.com/embed/avatars/0.png';

        const proposalTitle = `## ${await t(interaction, 'fun.marry.proposal.title')}`;
        const proposerBlock = `## ${proposer.username}\n-# ${proposerId}`;
        const targetBlock = `## ${targetUser.username}\n-# ${targetId}`;
        const proposalText = await t(interaction, 'fun.marry.proposal.description', {
            proposer: proposer.toString(),
            target: targetUser.toString(),
        });

        const acceptBtnLabel = await t(interaction, 'fun.marry.accept.button');
        const rejectBtnLabel = await t(interaction, 'fun.marry.reject.button');

        const proposeContainer = new ContainerBuilder()
            .setAccentColor(convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(proposalTitle))
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(proposerBlock))
                    .setThumbnailAccessory(
                        proposerAvatar ? new ThumbnailBuilder().setURL(proposerAvatar).setDescription(proposer.username) : null
                    )
            )
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(proposalText))
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(targetBlock))
                    .setThumbnailAccessory(
                        targetAvatar ? new ThumbnailBuilder().setURL(targetAvatar).setDescription(targetUser.username) : null
                    )
            )
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`marry_accept_${marriage.id}`)
                        .setLabel(acceptBtnLabel)
                        .setEmoji('❤️')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`marry_reject_${marriage.id}`)
                        .setLabel(rejectBtnLabel)
                        .setEmoji('❌')
                        .setStyle(ButtonStyle.Danger)
                )
            )
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    await t(interaction, 'common.container.footer', { username: interaction.client.user.username })
                )
            );

        await interaction.reply({
            flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
            components: [proposeContainer],
        });
    },
};
