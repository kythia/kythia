/**
 * @namespace: addons/welcomer/commands/dm-text.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class DmTextCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('dm-text')
			.setDescription('Set DM message sent to new members on join')
			.addStringOption((option) =>
				option
					.setName('text')
					.setDescription(
						'DM text. Supports placeholders like {username}, {guildName}.',
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
		welcomeSetting.welcomeDmText = text;
		await welcomeSetting.save();
		const components = await simpleContainer(
			interaction,
			await t(interaction, 'welcomer.welcomer.dm.text.set', {
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
exports.default = DmTextCommand;
