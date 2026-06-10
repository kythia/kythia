/**
 * @namespace: addons/music/commands/music/playback/autoplay.js
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
			.setName('autoplay')
			.setDescription('🔄 Enable or disable autoplay')
			.addStringOption((option) =>
				option
					.setName('status')
					.setDescription('Enable or disable autoplay')
					.addChoices(
						{ name: 'Enable', value: 'enable' },
						{ name: 'Disable', value: 'disable' },
					),
			),

	async execute(interaction, container) {
		const { client, member, guild } = interaction;
		const { t, musicHandlers, helpers } = container;
		const { simpleContainer } = helpers.discord;

		if (!(member instanceof GuildMember) || !member.voice.channel) {
			return interaction.reply({
				content: await t(interaction, 'music.music.voice.channel.not.found'),
				flags: MessageFlags.Ephemeral,
			});
		}

		const player = client.poru.players.get(guild.id);
		if (!player) {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'music.music.player.not.found'),
				{ color: 'Red' },
			);
			return interaction.reply({
				components: reply.components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (member.voice.channel.id !== player.voiceChannel) {
			return interaction.reply({
				content: await t(interaction, 'music.music.required'),
				flags: MessageFlags.Ephemeral,
			});
		}

		return musicHandlers.handleAutoplay(interaction, player);
	},
};
