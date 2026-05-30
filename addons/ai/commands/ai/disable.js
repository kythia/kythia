/**
 * @namespace: addons/ai/commands/ai/disable.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand.setName('disable').setDescription('Disable AI in this channel'),
	permissions: [PermissionFlagsBits.ManageChannels],
	aliases: ['aioff'],

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, helpers } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const channelId = interaction.channel.id;
		const [setting] = await ServerSetting.findOrCreateWithCache({
			where: { guildId: interaction.guild.id },
			defaults: {
				guildId: interaction.guild.id,
				guildName: interaction.guild.name,
			},
		});

		const aiChannelIds = Array.isArray(setting?.aiChannelIds)
			? [...setting.aiChannelIds]
			: [];

		const index = aiChannelIds.indexOf(channelId);
		if (index === -1) {
			const msg = await t(interaction, 'ai.ai.manage.not.enabled');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		aiChannelIds.splice(index, 1);
		setting.aiChannelIds = aiChannelIds;
		setting.changed('aiChannelIds', true);
		await setting.save();

		const msg = await t(interaction, 'ai.ai.manage.disable.success');
		const components = await simpleContainer(interaction, msg, {
			color: 'Green',
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
