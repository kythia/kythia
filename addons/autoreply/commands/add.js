/**
 * @namespace: addons/autoreply/commands/add.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) => {
		return subcommand
			.setName('add')
			.setDescription('➕ Add a new auto-reply.')
			.addStringOption((option) =>
				option
					.setName('trigger')
					.setDescription('The text that triggers the auto-reply.')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('response')
					.setDescription('The response text.')
					.setRequired(false),
			)
			.addAttachmentOption((option) =>
				option
					.setName('media')
					.setDescription('An image to attach to the response.')
					.setRequired(false),
			)
			.addBooleanOption((option) =>
				option
					.setName('use_container')
					.setDescription('Use Advanced Components V2 Container style?')
					.setRequired(false),
			);
	},

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, helpers } = container;
		const { AutoReply } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const trigger = interaction.options.getString('trigger');
		const response = interaction.options.getString('response');
		const media = interaction.options.getAttachment('media');
		const useContainer =
			interaction.options.getBoolean('use_container') || false;

		if (!response && !media) {
			const msg = await t(interaction, 'autoreply.add.error.no_content');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		const existing = await AutoReply.getCache({
			guildId: interaction.guild.id,
			trigger: trigger,
		});

		if (existing) {
			const msg = await t(interaction, 'autoreply.add.error.exists');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		let mediaUrl = null;
		if (media) {
			mediaUrl = media.url;
		}

		await AutoReply.create({
			guildId: interaction.guild.id,
			userId: interaction.user.id,
			trigger,
			response,
			media: mediaUrl,
			useContainer,
		});

		const msg = await t(interaction, 'autoreply.add.success.plain', {
			trigger: trigger,
		});

		const components = await simpleContainer(interaction, msg);
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
