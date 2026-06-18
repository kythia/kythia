/**
 * @namespace: addons/welcomer/commands/test.js
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
			.setDescription('Test the welcome or farewell messages')
			.addStringOption((option) =>
				option
					.setName('type')
					.setDescription('Which event to test')
					.setRequired(true)
					.addChoices(
						{
							name: 'Welcome',
							value: 'in',
						},
						{
							name: 'Farewell',
							value: 'out',
						},
					),
			)
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
		const type = interaction.options.getString('type');
		const user = interaction.options.getUser('user') || interaction.user;
		const member = await helpers.discord.getMemberSafe(
			interaction.guild,
			user.id,
		);
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
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
