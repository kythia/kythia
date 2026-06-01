/**
 * @namespace: addons/ai/commands/ai/enable.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand.setName('enable').setDescription('Enable AI in this channel'),
	permissions: [PermissionFlagsBits.ManageChannels],
	aliases: ['aion'],
	guildOnly: true,
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

		if (aiChannelIds.includes(channelId)) {
			const msg = await t(interaction, 'ai.ai.manage.already.enabled');
			const components = await simpleContainer(interaction, msg, {
				color: 'Yellow',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		aiChannelIds.push(channelId);
		setting.aiChannelIds = aiChannelIds;

		setting.changed('aiChannelIds', true);
		await setting.save();

		const msg = await t(interaction, 'ai.ai.manage.enable.success');
		const components = await simpleContainer(interaction, msg, {
			color: 'Green',
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
