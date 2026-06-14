/**
 * @namespace: addons/music/commands/utils/download.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { GuildMember, MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class DownloadCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('download')
			.setDescription('📥 Download the current song')
			.addStringOption((option) =>
				option
					.setName('query')
					.setDescription(
						'The song to download (optional, if not specified, the current song will be downloaded)',
					)
					.setRequired(false),
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

		return musicHandlers.handleDownload(interaction, player);
	}
}

exports.default = DownloadCommand;
