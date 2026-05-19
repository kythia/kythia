/**
 * @namespace: addons/streak/commands/setting/quota.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');

const MIN_QUOTA = 0; // 0 = disable restores entirely
const MAX_QUOTA = 30;

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('quota')
			.setDescription(
				'🔄 Set monthly restore quota (how many times members can restore their streak per month)',
			)
			.addIntegerOption((opt) =>
				opt
					.setName('quota')
					.setDescription(
						`Restores allowed per month (${MIN_QUOTA}–${MAX_QUOTA}, 0 = disabled)`,
					)
					.setMinValue(MIN_QUOTA)
					.setMaxValue(MAX_QUOTA)
					.setRequired(true),
			),
	permissions: [PermissionFlagsBits.ManageGuild],

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, helpers } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const guildId = interaction.guild.id;
		const guildName = interaction.guild.name;
		const quota = interaction.options.getInteger('quota');

		const [serverSetting] = await ServerSetting.findOrCreateWithCache({
			where: { guildId },
			defaults: { guildId, guildName },
		});

		serverSetting.streakRestoreQuota = quota;
		await serverSetting.save();

		const isDisabled = quota === 0;
		const components = await simpleContainer(
			interaction,
			await t(
				interaction,
				isDisabled
					? 'core.setting.setting.streak.quota.disabled'
					: 'core.setting.setting.streak.quota.set',
				{ quota },
			),
			{ color: isDisabled ? 'Red' : 'Green' },
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
