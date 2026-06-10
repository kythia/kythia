/**
 * @namespace: addons/music/commands/music/utils/join.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { GuildMember, MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	aliases: ['join'],
	slashCommand: (subcommand) =>
		subcommand
			.setName('join')
			.setDescription('🌸 Make Kythia Join the voice channel'),

	async execute(interaction, container) {
		const { client, member, guild } = interaction;
		const { t, musicHandlers } = container;

		if (!(member instanceof GuildMember) || !member.voice.channel) {
			return interaction.reply({
				content: await t(interaction, 'music.music.voice.channel.not.found'),
				flags: MessageFlags.Ephemeral,
			});
		}

		const player = client.poru.players.get(guild.id);

		return musicHandlers.handleJoin(interaction, player);
	},
};
