/**
 * @namespace: addons/booster/commands/text.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class TextCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('text')
			.setDescription('🚀 Set booster message text (supports placeholders)')
			.addStringOption((option) =>
				option
					.setName('text')
					.setDescription(
						'Booster text. Placeholders: {username}, {guildName}, {boosts}, {boostLevel}, etc.',
					)
					.setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { BoosterSetting } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const [boosterSetting] = await BoosterSetting.getOrCreateCache({
			guildId: interaction.guild.id,
		});

		const text = interaction.options.getString('text');
		boosterSetting.boosterEmbedText = text;
		await boosterSetting.save();

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'booster.booster.text.set', { text }),
			{ color: 'Green' },
		);

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = TextCommand;
