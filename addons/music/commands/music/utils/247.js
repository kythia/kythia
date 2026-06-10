/**
 * @namespace: addons/music/commands/music/utils/247.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { GuildMember, MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	isPremium: 'cute',
	slashCommand: (subcommand) =>
		subcommand
			.setName('247')
			.setDescription(
				'🎧 Enable or disable 24/7 mode to keep the bot in the voice channel.',
			),

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

		return musicHandlers.handle247(interaction, player);
	},
};
