/**
 * @namespace: addons/core/commands/tools/sticky/remove.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('Removes the sticky message from this channel.'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, helpers, models } = container;
		const { simpleContainer } = helpers.discord;
		const { StickyMessage } = models;

		const channelId = interaction.channel.id;
		const sticky = await StickyMessage.getCache({ channelId });

		if (!sticky) {
			const msg = await t(
				interaction,
				'core.tools.sticky.remove.error.not.found',
			);
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		if (sticky?.messageId) {
			try {
				const oldMsg = await interaction.channel.messages
					.fetch(sticky.messageId)
					.catch(() => null);
				if (oldMsg) await oldMsg.delete().catch(() => {});
			} catch (_e) {}
		}
		await sticky.destroy({ individualHooks: true });

		const msg = await t(interaction, 'core.tools.sticky.remove.success');
		const components = await simpleContainer(interaction, msg, {
			color: 'Red',
		});

		return interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	},
};
