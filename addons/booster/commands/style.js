/**
 * @namespace: addons/booster/commands/style.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class StyleCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('style')
			.setDescription('Set booster message style (banner card or plain text)')
			.addStringOption((option) =>
				option
					.setName('style')
					.setDescription('Choose the message style')
					.setRequired(true)
					.addChoices(
						{
							name: '🖼️ Components V2 card (default)',
							value: 'components-v2',
						},
						{
							name: '💬 Plain text only',
							value: 'plain-text',
						},
					),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { BoosterSetting } = models;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const [boosterSetting] = await BoosterSetting.getOrCreateCache({
			guildId: interaction.guild.id,
		});
		const style = interaction.options.getString('style');
		// null = CV2 card (default); { style: 'plain-text' } = plain text only
		boosterSetting.boosterLayout =
			style === 'plain-text'
				? {
						style: 'plain-text',
					}
				: null;
		await boosterSetting.save();
		const styleLabel =
			style === 'components-v2'
				? await t(
						interaction,
						'booster.commands.style.booster.label.components.v2',
					)
				: await t(
						interaction,
						'booster.commands.style.booster.label.plain.text',
					);
		const components = await simpleContainer(
			interaction,
			await t(interaction, 'booster.commands.style.booster.set', {
				styleLabel,
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
exports.default = StyleCommand;
