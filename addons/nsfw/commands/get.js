/**
 * @namespace: addons/nsfw/commands/get.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { buildComponentRows } = require('../helpers/buttons.js');
const { fetchContent } = require('../helpers/api.js');
const { BaseCommand } = require('kythia-core');

// Constants extracted to addons/nsfw/helpers/constants.js

class GetCommand extends BaseCommand {
	subcommand = true;
	voteLocked = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('get')
			.setDescription('Get random mature content (only in 18+ channels)')
			.addStringOption((option) =>
				option
					.setName('category')
					.setDescription('Content category')
					.setRequired(true)
					.addChoices(
						...require('../helpers/constants').ALLOWED_CATEGORIES.map(
							(cat) => ({
								name: cat,
								value: cat,
							}),
						),
					),
			)
			.addBooleanOption((option) =>
				option
					.setName('private')
					.setDescription('Make the message private?')
					.setRequired(true),
			)
			.addIntegerOption((option) =>
				option
					.setName('amount')
					.setDescription('Amount of images to send (1-3)')
					.setMinValue(1)
					.setMaxValue(3)
					.setRequired(false),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, models, logger } = container;
		const { NsfwUser } = models;
		const ephemeral = interaction.options.getBoolean('private') ?? false;
		const amount = interaction.options.getInteger('amount') ?? 1;
		const category = interaction.options.getString('category');
		await interaction.deferReply({
			ephemeral,
		});
		const [user] = await NsfwUser.getOrCreateCache(
			{
				userId: interaction.user.id,
			},
			{
				userId: interaction.user.id,
				nsfwFav: [],
				nsfwCount: 0,
			},
		);

		// State for current images
		let currentImages = [];
		const sendContent = async () => {
			const fetchPromises = Array.from(
				{
					length: amount,
				},
				() => fetchContent(category, logger),
			);
			const fetched = await Promise.all(fetchPromises);
			currentImages = fetched.filter((img) => img !== null);
			if (currentImages.length === 0) {
				return interaction.editReply({
					content:
						'Oops, the image servers seem to be down right now 😭. Please try again later!',
				});
			}

			// Update nsfwCount only for successfully fetched images
			if (user) {
				user.nsfwCount = (user.nsfwCount || 0) + currentImages.length;
				await user.save();
			}
			const [containerBody] = await helpers.discord.createContainer(
				interaction,
				{
					title: category,
					media: currentImages,
					components: buildComponentRows(
						currentImages,
						user?.nsfwFav || [],
						false,
						await interaction.client.container.t(
							interaction,
							'nsfw.ui.refresh',
						),
						await t(interaction, 'nsfw.shared.ui.delete'),
					),
				},
			);
			await interaction.editReply({
				components: [containerBody],
				flags: MessageFlags.IsComponentsV2,
			});
			try {
				const replyMsg = await interaction.fetchReply();
				if (replyMsg && container.redis) {
					await container.redis.set(
						`nsfw:msg:${replyMsg.id}:cat`,
						category,
						'EX',
						86400 * 3,
					);
					await container.redis.set(
						`nsfw:msg:${replyMsg.id}:img`,
						JSON.stringify(currentImages),
						'EX',
						86400 * 3,
					);
				}
			} catch (_e) {}
		};

		// Send initial content
		await sendContent();
	}
}
exports.default = GetCommand;
