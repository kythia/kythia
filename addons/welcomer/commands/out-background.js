/**
 * @namespace: addons/welcomer/commands/out-background.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('out-background')
			.setDescription('👋 Set farewell banner background URL')
			.addStringOption((option) =>
				option
					.setName('url')
					.setDescription(
						'Direct URL to the background image (must start with http)',
					)
					.setRequired(true),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, helpers } = container;
		const { WelcomeSetting } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const url = interaction.options.getString('url');

		if (!url.startsWith('http')) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'welcomer.welcomer.out.background.invalid.url'),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const [welcomeSetting] = await WelcomeSetting.getOrCreateCache({
			guildId: interaction.guild.id,
		});

		welcomeSetting.welcomeOutBackgroundUrl = url;
		await welcomeSetting.save();

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'welcomer.welcomer.out.background.set', { url }),
			{ color: 'Green' },
		);

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
