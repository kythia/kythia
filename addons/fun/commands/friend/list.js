/**
 * @namespace: addons/fun/commands/friend/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
} = require('discord.js');
const { Op } = require('sequelize');

const { BaseCommand } = require('kythia-core');

class ListCommand extends BaseCommand {
	slashCommand = (subcommand) =>
		subcommand.setName('list').setDescription('🤝 List your friends');

	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { Friend } = models;
		const { convertColor } = helpers.color;

		const userId = interaction.user.id;

		const existingFriendships = await Friend.getAllCache({
			where: {
				[Op.or]: [{ user1Id: userId }, { user2Id: userId }],
				status: 'accepted',
			},
		});

		let formattedList = '';
		if (!existingFriendships || existingFriendships.length === 0) {
			formattedList = await t(interaction, 'fun.friend.list.empty');
		} else {
			const arr = [];
			for (const f of existingFriendships) {
				const targetId = f.user1Id === userId ? f.user2Id : f.user1Id;
				arr.push(
					await t(interaction, 'fun.friend.list.format', {
						user: `<@${targetId}>`,
					}),
				);
			}
			formattedList = arr.join('\n');
		}

		const listContainer = new ContainerBuilder()
			.setAccentColor(
				convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'fun.friend.list.title'),
				),
			)
			.addSeparatorComponents(new SeparatorBuilder().setDivider(true))
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(formattedList),
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
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			components: [listContainer],
		});
	}
}

exports.default = ListCommand;
