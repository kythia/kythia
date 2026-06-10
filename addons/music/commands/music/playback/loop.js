/**
 * @namespace: addons/music/commands/music/playback/loop.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { GuildMember, MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('loop')
			.setDescription('🔁 Set repeat mode')
			.addStringOption((option) =>
				option
					.setName('mode')
					.setDescription('Choose repeat mode')
					.setRequired(true)
					.addChoices(
						{ name: '❌ Off', value: 'none' },
						{ name: '🔂 Track', value: 'track' },
						{ name: '🔁 Queue', value: 'queue' },
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

		return musicHandlers.handleLoop(interaction, player);
	},
};
