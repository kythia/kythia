/**
 * @namespace: addons/counting/commands/reset.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand.setName('reset').setDescription('Reset the counting channel.'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { models, t, helpers } = container;
		const { Counting } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const guildId = interaction.guild.id;
		const counting = await Counting.getCache({
			guildId,
		});
		if (!counting) {
			const desc = await t(interaction, 'counting.reset.not_enabled');
			await interaction.editReply({
				components: await simpleContainer(interaction, desc, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2,
			});
			return;
		}

		counting.currentCount = 0;
		counting.lastUserId = null;
		let reset = false;

		try {
			await counting.save();
			reset = true;
		} catch (_e) {
			reset = false;
		}

		if (reset) {
			const desc = await t(interaction, 'counting.reset.success');
			await interaction.editReply({
				components: await simpleContainer(interaction, desc, {
					color: 'Green',
				}),
				flags: MessageFlags.IsComponentsV2,
			});
		} else {
			const desc = await t(interaction, 'counting.reset.fail');
			await interaction.editReply({
				components: await simpleContainer(interaction, desc, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
