/**
 * @namespace: src/middlewares/ephemeralReplies.js
 * @type: Middleware
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 *
 * @description
 * Middleware to force all replies from a command to be ephemeral if the server has
 * the `ephemeralReplies` setting enabled in their dashboard.
 */

const { MessageFlags, MessageFlagsBitField } = require('discord.js');

module.exports = {
	name: 'ephemeralReplies',
	priority: 95,
	execute: async (interaction, _command, container) => {
		if (!interaction.isRepliable()) return true;
		if (!interaction.guildId) return true;

		try {
			const { ServerSetting } = container.models;
			const settings = await ServerSetting.getCache({
				guildId: interaction.guildId,
			}).catch(() => null);

			if (settings?.ephemeralReplies) {
				const originalReply = interaction.reply.bind(interaction);
				const originalDeferReply = interaction.deferReply.bind(interaction);
				const originalEditReply = interaction.editReply.bind(interaction);
				const originalFollowUp = interaction.followUp.bind(interaction);

				const injectEphemeral = (options) => {
					if (!options) return { flags: MessageFlags.Ephemeral };
					if (typeof options === 'string') {
						return { content: options, flags: MessageFlags.Ephemeral };
					}

					const newOptions = { ...options };
					const bitfield = new MessageFlagsBitField(newOptions.flags || 0);
					bitfield.add(MessageFlags.Ephemeral);

					newOptions.flags = bitfield.bitfield;
					return newOptions;
				};

				interaction.reply = (options) =>
					originalReply(injectEphemeral(options));
				interaction.deferReply = (options) =>
					originalDeferReply(injectEphemeral(options));
				interaction.editReply = (options) =>
					originalEditReply(injectEphemeral(options));
				interaction.followUp = (options) =>
					originalFollowUp(injectEphemeral(options));
			}
		} catch (error) {
			container.logger.error('Error in ephemeralReplies middleware:', error);
		}

		return true;
	},
};
