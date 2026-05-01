/**
 * @namespace: addons/server-stats/commands/server-stats/category.js
 * @type: Subcommand
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const {
	SlashCommandBuilder,
	ChannelType,
	MessageFlags,
} = require('discord.js');

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('category')
		.setDescription('📈 Set category for server stats channels')
		.addChannelOption((opt) =>
			opt
				.setName('category')
				.setDescription('Category channel')
				.setRequired(true),
		),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, helpers, models, logger } = container;
		const { simpleContainer } = helpers.discord;
		const { ServerSetting } = models;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const guildId = interaction.guild.id;
		const guildName = interaction.guild.name;

		const [serverSetting, created] = await ServerSetting.findOrCreateWithCache({
			where: { guildId: guildId },
			defaults: { guildId: guildId, guildName: guildName },
		});

		if (created) {
			await ServerSetting.clearNegativeCache({ where: { guildId: guildId } });
			logger.info(
				`[CACHE] Cleared negative cache for new ServerSetting: ${guildId}`,
				{ label: 'server-stats' },
			);
		}

		const cat = interaction.options.getChannel('category');
		if (!cat || cat.type !== ChannelType.GuildCategory) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.setting.setting.stats.category.invalid'),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		serverSetting.serverStatsCategoryId = cat.id;
		await serverSetting.save();

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'core.setting.setting.stats.category.set', {
				category: `<#${cat.id}>`,
			}),
			{ color: 'Green' },
		);

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
