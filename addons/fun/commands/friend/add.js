/**
 * @namespace: addons/fun/commands/friend/add.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	SectionBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	ThumbnailBuilder,
	TextDisplayBuilder,
} = require('discord.js');
const { Op } = require('sequelize');

const { BaseCommand } = require('kythia-core');

class AddCommand extends BaseCommand {
	slashCommand = (subcommand) =>
		subcommand
			.setName('add')
			.setDescription('🤝 Add someone as a friend')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user you want to add as a friend')
					.setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { Friend } = models;
		const { convertColor } = helpers.color;

		const targetUser = interaction.options.getUser('user');
		const proposer = interaction.user;
		const proposerId = proposer.id;
		const targetId = targetUser.id;

		if (targetUser.bot) {
			return interaction.reply({
				content: await t(interaction, 'fun.friend.bot.error'),
				flags: MessageFlags.Ephemeral,
			});
		}

		if (targetId === proposerId) {
			return interaction.reply({
				content: await t(interaction, 'fun.friend.yourself.error'),
				flags: MessageFlags.Ephemeral,
			});
		}

		const existingFriendships = await Friend.getAllCache({
			where: {
				[Op.or]: [
					{ user1Id: proposerId, user2Id: targetId },
					{ user1Id: targetId, user2Id: proposerId },
				],
			},
			limit: 1,
		});

		const existingFriendship =
			existingFriendships && existingFriendships.length > 0
				? existingFriendships[0]
				: null;

		if (
			existingFriendship &&
			['pending', 'accepted'].includes(existingFriendship.status)
		) {
			return interaction.reply({
				content: await t(interaction, 'fun.friend.already.friends'),
				flags: MessageFlags.Ephemeral,
			});
		}

		// If there is an existing rejected request, we can just update it or create a new one.
		// For simplicity, we just create a new one.

		const friendReq = await Friend.create({
			user1Id: proposerId,
			user2Id: targetId,
			status: 'pending',
		});

		const proposerAvatar =
			proposer.displayAvatarURL({ extension: 'png', size: 256 }) ||
			'https://cdn.discordapp.com/embed/avatars/0.png';
		const targetAvatar = targetUser.displayAvatarURL
			? targetUser.displayAvatarURL({ extension: 'png', size: 256 })
			: 'https://cdn.discordapp.com/embed/avatars/0.png';

		const requestTitle = `## ${await t(interaction, 'fun.friend.request.title')}`;
		const proposerBlock = `## ${proposer.username}\n-# ${proposerId}`;
		const targetBlock = `## ${targetUser.username}\n-# ${targetId}`;
		const requestText = await t(interaction, 'fun.friend.request.description', {
			proposer: proposer.toString(),
			target: targetUser.toString(),
		});

		const acceptBtnLabel = await t(interaction, 'fun.friend.accept.button');
		const rejectBtnLabel = await t(interaction, 'fun.friend.reject.button');

		const addContainer = new ContainerBuilder()
			.setAccentColor(
				convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(requestTitle),
			)
			.addSeparatorComponents(new SeparatorBuilder().setDivider(true))
			.addSectionComponents(
				new SectionBuilder()
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(proposerBlock),
					)
					.setThumbnailAccessory(
						proposerAvatar
							? new ThumbnailBuilder()
									.setURL(proposerAvatar)
									.setDescription(proposer.username)
							: null,
					),
			)
			.addSeparatorComponents(new SeparatorBuilder().setDivider(true))
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(requestText),
			)
			.addSeparatorComponents(new SeparatorBuilder().setDivider(true))
			.addSectionComponents(
				new SectionBuilder()
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(targetBlock),
					)
					.setThumbnailAccessory(
						targetAvatar
							? new ThumbnailBuilder()
									.setURL(targetAvatar)
									.setDescription(targetUser.username)
							: null,
					),
			)
			.addSeparatorComponents(new SeparatorBuilder().setDivider(true))
			.addActionRowComponents(
				new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId(`friend:accept:${friendReq.id}`)
						.setLabel(acceptBtnLabel)
						.setEmoji('🤝')
						.setStyle(ButtonStyle.Success),
					new ButtonBuilder()
						.setCustomId(`friend:reject:${friendReq.id}`)
						.setLabel(rejectBtnLabel)
						.setEmoji('❌')
						.setStyle(ButtonStyle.Danger),
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
			components: [addContainer],
		});
	}
}

exports.default = AddCommand;
