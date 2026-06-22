/**
 * @namespace: addons/music/commands/utils/247.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class Music247Command extends BaseCommand {
	premiumLocked = 'powerful';
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('247')
			.setDescription(
				'Enable or disable 24/7 mode to keep the bot in the voice channel.',
			)
			.addBooleanOption((option) =>
				option
					.setName('lock')
					.setDescription('Lock the bot to this channel so it cannot be moved.')
					.setRequired(false),
			);
	async execute(interaction) {
		const { simpleContainer } = interaction.client.container.helpers.discord;
		const container = this.container;
		const { client, member, guild } = interaction;
		const { t, musicHandlers } = container;
		if (!member?.voice?.channel) {
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(
						interaction,
						'music.helpers.index.music.voice.channel.not.found',
					),
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		const player = client.poru.players.get(guild.id);
		const lock = interaction.options.getBoolean('lock') ?? false;
		return musicHandlers.handle247(interaction, player, lock);
	}
}
exports.default = Music247Command;
