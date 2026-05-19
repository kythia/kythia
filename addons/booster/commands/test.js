/**
 * @namespace: addons/booster/commands/test.js
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
			.setDescription('👋 Test the booster message')
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
		const user = interaction.options.getUser('user') || interaction.user;
		const member = await interaction.guild.members
			.fetch(user.id)
			.catch(() => interaction.member);

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		// Simulate boost by creating proxy/clone member states
		const oldMember = Object.create(member);
		Object.defineProperty(oldMember, 'premiumSinceTimestamp', { value: null });

		const newMember = Object.create(member);
		Object.defineProperty(newMember, 'premiumSinceTimestamp', {
			value: Date.now(),
		});

		interaction.client.emit('guildMemberUpdate', oldMember, newMember);

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'booster.booster.test.success', {
				type: 'guildMemberUpdate (booster)',
			}),
			{ color: 'Green' },
		);

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
