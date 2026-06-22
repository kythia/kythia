/**
 * @namespace: addons/fun/commands/friend/remove.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
} = require('discord.js');
const { Op } = require('sequelize');
const { BaseCommand } = require('kythia-core');
class RemoveCommand extends BaseCommand {
	slashCommand = (subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('Remove someone from your friends list')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user you want to remove from your friends')
					.setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { Friend } = models;
		const { convertColor } = helpers.color;
		const targetUser = interaction.options.getUser('user');
		const userId = interaction.user.id;
		const targetId = targetUser.id;
		const existingFriendships = await Friend.getAllCache({
			where: {
				[Op.or]: [
					{
						user1Id: userId,
						user2Id: targetId,
					},
					{
						user1Id: targetId,
						user2Id: userId,
					},
				],
				status: 'accepted',
			},
			limit: 1,
		});
		const existingFriendship =
			existingFriendships && existingFriendships.length > 0
				? existingFriendships[0]
				: null;
		if (!existingFriendship) {
			return interaction.reply({
				content: await t(interaction, 'fun.commands.friend.remove.not.friends'),
				flags: MessageFlags.Ephemeral,
			});
		}
		await existingFriendship.destroy(); // Remove the relationship from DB

		const removeContainer = new ContainerBuilder()
			.setAccentColor(
				convertColor(kythiaConfig.bot.color, {
					from: 'hex',
					to: 'decimal',
				}),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'fun.commands.friend.remove.removed.title'),
				),
			)
			.addSeparatorComponents(new SeparatorBuilder().setDivider(true))
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(
						interaction,
						'fun.commands.friend.remove.removed.description',
						{
							user: targetUser.toString(),
						},
					),
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
		await interaction.reply({
			flags: MessageFlags.IsComponentsV2,
			components: [removeContainer],
		});
	}
}
exports.default = RemoveCommand;
