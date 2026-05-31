/**
 * @namespace: addons/verification/commands/setup/type.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const CAPTCHA_TYPES = [
	{ name: 'Math (multiple choice buttons)', value: 'math' },
	{ name: 'Emoji click (buttons)', value: 'emoji' },
	{ name: 'Image text (type the code)', value: 'image' },
];

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('type')
			.setDescription('Captcha challenge type')
			.addStringOption((o) =>
				o
					.setName('type')
					.setDescription('Type of captcha')
					.setRequired(true)
					.addChoices(...CAPTCHA_TYPES),
			),
	async execute(interaction, container) {
		const { models, helpers, kythiaConfig, t } = container;
		const { simpleContainer } = helpers.discord;
		const { VerificationConfig } = models;
		const guildId = interaction.guild.id;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const [config] = await VerificationConfig.findOrCreate({
			where: { guildId },
			defaults: { guildId },
		});

		const type = interaction.options.getString('type');
		config.captchaType = type;
		await config.save();

		const label = CAPTCHA_TYPES.find((t) => t.value === type)?.name;
		const components = await simpleContainer(
			interaction,
			await t(interaction, 'verify.setup.type.success', { type: label }),
			{
				color: kythiaConfig.bot.color,
			},
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
