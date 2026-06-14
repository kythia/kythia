/**
 * @namespace: addons/server-stats/commands/category.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ChannelType,
	MessageFlags,
	SlashCommandBuilder,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

class CategoryCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('category')
		.setDescription('📈 Set category for server stats channels')
		.addChannelOption((opt) =>
			opt
				.setName('category')
				.setDescription('Category channel')
				.setRequired(true),
		);

	async execute(interaction) {
		const container = this.container;
		const { t, helpers, models, logger } = container;
		const { simpleContainer } = helpers.discord;
		const { ServerSetting } = models;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const guildId = interaction.guild.id;
		const guildName = interaction.guild.name;

		const [serverSetting, created] = await ServerSetting.findOrCreateCache({
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
	}
}

exports.default = CategoryCommand;
