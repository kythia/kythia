/**
 * @namespace: addons/fun/commands/summon.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SlashCommandBuilder,
} = require('discord.js');
const { Op } = require('sequelize');
const { BaseCommand } = require('kythia-core');
class SummonCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('summon')
		.setDescription('Summon a friend to your current channel')
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription('The friend you want to summon')
				.setRequired(true),
		);
	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { Friend } = models;
		const { convertColor } = helpers.color;
		const targetUser = interaction.options.getUser('user');
		const author = interaction.user;
		if (targetUser.bot || targetUser.id === author.id) {
			return interaction.reply({
				content: await t(interaction, 'fun.shared.summon.not.friend'),
				flags: MessageFlags.Ephemeral,
			});
		}
		const existingFriendships = await Friend.getAllCache({
			where: {
				[Op.or]: [
					{
						user1Id: author.id,
						user2Id: targetUser.id,
					},
					{
						user1Id: targetUser.id,
						user2Id: author.id,
					},
				],
				status: 'accepted',
			},
			limit: 1,
		});
		if (!existingFriendships || existingFriendships.length === 0) {
			return interaction.reply({
				content: await t(interaction, 'fun.shared.summon.not.friend'),
				flags: MessageFlags.Ephemeral,
			});
		}
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		try {
			const targetMember = await helpers.discord.getMemberSafe(
				interaction.guild,
				targetUser.id,
			);
			if (!targetMember) throw new Error('Not in guild');
			const jumpUrl = `https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`;
			const dmContainer = new ContainerBuilder()
				.setAccentColor(
					convertColor(kythiaConfig.bot.color, {
						from: 'hex',
						to: 'decimal',
					}),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(interaction, 'fun.commands.summon.dm.title'),
					),
				)
				.addSeparatorComponents(new SeparatorBuilder().setDivider(true))
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(interaction, 'fun.commands.summon.dm.description', {
							author: author.username,
							server: interaction.guild.name,
						}),
					),
				)
				.addSeparatorComponents(new SeparatorBuilder().setDivider(true))
				.addActionRowComponents(
					new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setStyle(ButtonStyle.Link)
							.setLabel(await t(interaction, 'fun.commands.summon.button.jump'))
							.setURL(jumpUrl),
					),
				)
				.addSeparatorComponents(new SeparatorBuilder().setDivider(true))
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(interaction, 'common.container.footer', {
							username: interaction.client.user.username,
						}),
					),
				);
			await targetUser.send({
				components: [dmContainer],
				flags: MessageFlags.IsComponentsV2,
			});
			await interaction.editReply({
				content: await t(interaction, 'fun.commands.summon.success', {
					user: targetUser.toString(),
				}),
			});
		} catch (_e) {
			await interaction.editReply({
				content: await t(interaction, 'fun.commands.summon.dm.failed', {
					user: targetUser.toString(),
				}),
			});
		}
	}
}
exports.default = SummonCommand;
