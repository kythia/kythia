/**
 * @namespace: addons/music/commands/music/utils/history.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { GuildMember, MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('history')
			.setDescription('📜 Show the history of played songs'),

	async execute(interaction, container) {
		const { client, member, guild } = interaction;
		const { t, musicHandlers, music } = container;

		if (!(member instanceof GuildMember) || !member.voice.channel) {
			return interaction.reply({
				content: await t(interaction, 'music.music.voice.channel.not.found'),
				flags: MessageFlags.Ephemeral,
			});
		}

		const player = client.poru.players.get(guild.id);

		return musicHandlers.handleHistory(interaction, player, music.guildStates);
	},
};
