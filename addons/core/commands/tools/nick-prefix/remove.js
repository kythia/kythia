/**
 * @namespace: addons/core/commands/tools/nick-prefix/remove.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { roleUnprefix } = require('../../../helpers');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('📛 Removes the prefix from member nicknames.'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t } = container;

		await interaction.deferReply();

		const updated = await roleUnprefix(interaction.guild, container);
		await interaction.editReply({
			content: await t(interaction, 'core.tools.prefix.remove.success', {
				count: updated,
			}),
		});
	},
};
