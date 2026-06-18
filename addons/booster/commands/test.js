/**
 * @namespace: addons/booster/commands/test.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class TestCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('test')
			.setDescription('Test the booster message')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('User to test with (defaults to you)')
					.setRequired(false),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, helpers } = container;
		const { simpleContainer } = helpers.discord;
		const user = interaction.options.getUser('user') || interaction.user;
		const member = await helpers.discord.getMemberSafe(
			interaction.guild,
			user.id,
		);
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});

		// Simulate boost by creating proxy/clone member states
		const oldMember = Object.create(member);
		Object.defineProperty(oldMember, 'premiumSinceTimestamp', {
			value: null,
		});
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
			{
				color: 'Green',
			},
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = TestCommand;
