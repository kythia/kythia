/**
 * @namespace: addons/automod/commands/moderation/mute.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
	slashCommand: (subcommand) =>
		subcommand
			.setName('mute')
			.setDescription('🔇 Mutes a user in voice channels.')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to mute')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('reason')
					.setDescription('Reason for the mute')
					.setRequired(false),
			),
	permissions: PermissionFlagsBits.MuteMembers,
	botPermissions: PermissionFlagsBits.MuteMembers,

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, helpers } = container;
		const { createContainer } = helpers.discord;

		await interaction.deferReply();

		const user = interaction.options.getUser('user');

		const reply = await createContainer(interaction, {
			color: 'Red',
			description: await t(interaction, 'core.moderation.mute.embed.desc', {
				tag: user.tag,
				moderator: interaction.user.tag,
			}),
			thumbnail: interaction.client.user.displayAvatarURL(),
		});

		return interaction.editReply({
			components: reply,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
