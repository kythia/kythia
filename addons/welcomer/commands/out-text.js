/**
 * @namespace: addons/welcomer/commands/out-text.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class OutTextCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('out-text')
			.setDescription('Set farewell message text (supports placeholders)')
			.addStringOption((option) =>
				option
					.setName('text')
					.setDescription(
						'Farewell text. Placeholders: {username}, {guildName}, etc.',
					)
					.setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { WelcomeSetting } = models;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const [welcomeSetting] = await WelcomeSetting.getOrCreateCache({
			guildId: interaction.guild.id,
		});
		const text = interaction.options.getString('text');
		welcomeSetting.welcomeOutEmbedText = text;
		await welcomeSetting.save();
		const components = await simpleContainer(
			interaction,
			await t(interaction, 'welcomer.commands.out-text.welcomer.out.text.set', {
				text,
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
exports.default = OutTextCommand;
