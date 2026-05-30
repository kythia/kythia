/**
 * @namespace: addons/checklist/commands/server/list.js
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
		subcommand.setName('list').setDescription('View all server checklist'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, helpers } = container;
		const { createContainer } = helpers.discord;

		const guildId = interaction.guild?.id;
		const userId = null; // Server scope
		const group = 'server';

		const { checklist, items } = await getChecklistAndItems({
			container,
			guildId,
			userId,
		});
		const { scopeKey, colorName, ephemeral } = getScopeMeta(
			container,
			userId,
			group,
		);

		if (!checklist || !Array.isArray(items) || items.length === 0) {
			await interaction.deferReply({ ephemeral });
			const msg =
				(await t(interaction, 'checklist.server.toggle.empty.title', {
					scope: await t(interaction, scopeKey),
				})) +
				'\n' +
				(await t(interaction, 'checklist.server.list.list.empty.desc'));
			const components = await createContainer(interaction, {
				description: msg,
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// Build checklist description
		let description = '';
		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			description += `${item.checked ? '✅' : '⬜'} \`${i + 1}\` ${item.text}\n`;
		}

		await interaction.deferReply({ ephemeral });
		const title = await t(interaction, 'checklist.server.list.list.title', {
			scope: await t(interaction, scopeKey),
		});
		const components = await createContainer(interaction, {
			title,
			description: description.trim(),
			color: colorName,
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
