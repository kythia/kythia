/**
 * @namespace: addons/music/commands/utils/247.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { GuildMember, MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class Music247Command extends BaseCommand {
	premiumLocked = 'powerful';

	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('247')
			.setDescription(
				'🎧 Enable or disable 24/7 mode to keep the bot in the voice channel.',
			);

	async execute(interaction) {
		const container = this.container;
		const { client, member, guild } = interaction;
		const { t, musicHandlers } = container;

		if (!(member instanceof GuildMember) || !member.voice.channel) {
			return interaction.reply({
				content: await t(interaction, 'music.music.voice.channel.not.found'),
				flags: MessageFlags.Ephemeral,
			});
		}

		const player = client.poru.players.get(guild.id);

		return musicHandlers.handle247(interaction, player);
	}
}

exports.default = Music247Command;
