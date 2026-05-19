/**
 * @namespace: addons/welcomer/commands/test.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('test')
			.setDescription('👋 Test the welcome or farewell messages')
			.addStringOption((option) =>
				option
					.setName('type')
					.setDescription('Which event to test')
					.setRequired(true)
					.addChoices(
						{ name: 'Welcome', value: 'in' },
						{ name: 'Farewell', value: 'out' },
					),
			)
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('User to test with (defaults to you)')
					.setRequired(false),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, helpers } = container;
		const { simpleContainer } = helpers.discord;
		const type = interaction.options.getString('type');
		const user = interaction.options.getUser('user') || interaction.user;
		const member = await interaction.guild.members
			.fetch(user.id)
			.catch(() => interaction.member);

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		if (type === 'in') {
			interaction.client.emit('guildMemberAdd', member);
		} else {
			interaction.client.emit('guildMemberRemove', member);
		}

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'welcomer.welcomer.test.success', {
				type: type === 'in' ? 'guildMemberAdd' : 'guildMemberRemove',
			}),
			{ color: 'Green' },
		);

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
