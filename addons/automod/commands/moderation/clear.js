/**
 * @namespace: addons/automod/commands/moderation/clear.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const {
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	ComponentType,
	ActionRowBuilder,
	PermissionFlagsBits,
} = require('discord.js');

module.exports = {
	slashCommand: (subcommand) =>
		subcommand
			.setName('clear')
			.setDescription('🗑️ Delete messages from a channel.')
			.addIntegerOption((option) =>
				option
					.setName('amount')
					.setDescription('Amount of messages to delete (0 = all)')
					.setRequired(true),
			),

	permissions: PermissionFlagsBits.ManageMessages,
	botPermissions: PermissionFlagsBits.ManageMessages,

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, helpers } = container;
		const { simpleContainer } = helpers.discord;

		const amount = interaction.options.getInteger('amount');

		if (amount === 0) {
			return await showClearOptions(interaction, t, container);
		}

		await interaction.deferReply();

		if (typeof interaction.channel.bulkDelete !== 'function') {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'core.moderation.clear.text.only'),
				{ color: 'Orange' },
			);
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		try {
			const deleted = await interaction.channel.bulkDelete(amount, true);
			const totalDeleted = deleted.size;

			if (totalDeleted === 0) {
				const reply = await simpleContainer(
					interaction,
					await t(interaction, 'core.moderation.clear.nothing.deleted'),
					{ color: 'Orange' },
				);
				return interaction.editReply({
					components: reply,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'core.moderation.clear.embed.desc', {
					count: totalDeleted,
				}),
				{ color: 'Green' },
			);
			await interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (_e) {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'core.moderation.clear.error'),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};

// Show options for clear (Nuke/Bulk)
async function showClearOptions(interaction, t, container) {
	const { helpers } = container;
	const { createContainer, simpleContainer } = helpers.discord;
	await interaction.deferReply({ flags: MessageFlags.Ephemeral });

	const row = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('confirmNuke')
			.setLabel('Nuke Channel')
			.setStyle(ButtonStyle.Danger),
		new ButtonBuilder()
			.setCustomId('confirmBulk')
			.setLabel('Bulk Delete All')
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId('cancelClear')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary),
	);

	// Re-creating description with fields info
	const desc =
		(await t(interaction, 'core.moderation.clear.options.desc')) +
		'\n\n' +
		`**💥 Nuke Channel**\n${await t(interaction, 'core.moderation.clear.options.nuke.value')}\n\n` +
		`**🗑️ Bulk Delete**\n${await t(interaction, 'core.moderation.clear.options.bulk.value')}`;

	const replyWithFields = await createContainer(interaction, {
		color: 'Orange',
		title: await t(interaction, 'core.moderation.clear.options.title'),
		description: desc,
		components: [row],
	});

	const message = await interaction.editReply({
		components: replyWithFields,
		flags: MessageFlags.IsComponentsV2,
	});

	const collector = message.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: 60000,
	});

	collector.on('collect', async (i) => {
		if (i.user.id !== interaction.user.id) {
			const reply = await simpleContainer(
				i,
				await t(i, 'core.moderation.clear.not.allowed'),
				{ color: 'Red' },
			);
			return i.reply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (i.customId === 'confirmNuke') {
			await i.deferUpdate();
			await handleNuke(interaction, t, container);
			collector.stop();
		} else if (i.customId === 'confirmBulk') {
			await i.deferUpdate();
			await handleBulkDelete(interaction, t, container);
			collector.stop();
		} else if (i.customId === 'cancelClear') {
			await i.deferUpdate();
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'core.moderation.clear.cancelled'),
				{ color: 'Red' },
			);
			await interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
			collector.stop();
		}
	});

	collector.on('end', async (_collected, reason) => {
		if (reason === 'time') {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'core.moderation.clear.timeout'),
				{ color: 'Red' },
			);
			await interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	});
}

async function handleNuke(interaction, t, container) {
	const { logger, helpers } = container;
	const { simpleContainer } = helpers.discord;
	const channel = interaction.channel;

	try {
		const oldPosition = channel.position;
		const newChannel = await channel.clone();
		await channel.delete();
		await newChannel.setPosition(oldPosition);

		const successReply = await simpleContainer(
			interaction,
			await t(interaction, 'core.moderation.clear.nuked.success'),
			{ color: 'Green' },
		);
		await newChannel.send({ components: successReply });
	} catch (err) {
		logger.error(`Nuke error: ${err.message || err}`, {
			label: 'automod',
		});
		const reply = await simpleContainer(
			interaction,
			await t(interaction, 'core.moderation.clear.failed', {
				error: err.message,
			}),
			{ color: 'Red' },
		);
		await interaction.editReply({
			components: reply,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

async function handleBulkDelete(interaction, t, container) {
	const { logger, helpers } = container;
	const { simpleContainer } = helpers.discord;

	try {
		let totalDeleted = 0;
		let hasMore = true;

		while (hasMore) {
			const messages = await interaction.channel.messages.fetch({ limit: 100 });
			const deletableMessages = messages.filter(
				(msg) => Date.now() - msg.createdTimestamp < 1209600000,
			);

			if (deletableMessages.size > 0) {
				const deleted = await interaction.channel.bulkDelete(
					deletableMessages,
					true,
				);
				totalDeleted += deleted.size;
			}

			if (deletableMessages.size < 100 || messages.size === 0) {
				hasMore = false;
			}
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		const doneReply = await simpleContainer(
			interaction,
			await t(interaction, 'core.moderation.clear.embed.desc', {
				count: totalDeleted,
			}),
			{ color: 'Green' },
		);
		await interaction.editReply({
			components: doneReply,
			flags: MessageFlags.IsComponentsV2,
		});
	} catch (err) {
		logger.error(`Bulk delete all error: ${err.message || err}`, {
			label: 'automod',
		});
		const reply = await simpleContainer(
			interaction,
			await t(interaction, 'core.moderation.clear.error'),
			{ color: 'Red' },
		);
		await interaction.followUp({
			components: reply,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
