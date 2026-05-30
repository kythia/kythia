/**
 * @namespace: addons/checklist/commands/personal/add.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { getChecklistAndItems, getScopeMeta } = require('../../helpers');
const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('add')
			.setDescription('Add item to personal checklist')
			.addStringOption((option) =>
				option
					.setName('item')
					.setDescription('Checklist item')
					.setRequired(true),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		// Dependency
		const { t, helpers } = container;
		const { simpleContainer } = helpers.discord;

		const guildId = interaction.guild?.id;
		const userId = interaction.user.id; // Personal scope
		const group = 'personal';

		const item = interaction.options.getString('item');
		if (!item || typeof item !== 'string' || !item.trim()) {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });
			const msg =
				(await t(interaction, 'checklist.server.add.invalid.item.title')) +
				'\n' +
				(await t(interaction, 'checklist.server.add.invalid.item.desc'));
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const { checklist, items } = await getChecklistAndItems({
			container,
			guildId,
			userId,
			createIfNotExist: true,
		});

		if (items.length >= 100) {
			// Limit checklist size
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });
			const msg =
				(await t(interaction, 'checklist.server.add.full.title')) +
				'\n' +
				(await t(interaction, 'checklist.server.add.full.desc'));
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		items.push({ text: item, checked: false });
		try {
			await checklist.update({ items: JSON.stringify(items) });
		} catch (_e) {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });
			const msg = await t(interaction, 'checklist.server.add.error');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const { scopeKey, color, ephemeral } = getScopeMeta(
			container,
			userId,
			group,
		);
		await interaction.deferReply({ ephemeral });
		const msg =
			(await t(interaction, 'checklist.server.add.add.success.title', {
				scope: await t(interaction, scopeKey),
			})) +
			'\n' +
			(await t(interaction, 'checklist.server.add.add.success.desc', { item }));
		const components = await simpleContainer(interaction, msg, { color });
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
