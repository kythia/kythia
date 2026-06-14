/**
 * @namespace: addons/ai/commands/ai/enable.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class EnableCommand extends BaseCommand {
	subcommand = true;
	voteLocked = true;
	aliases = ['aion'];
	guildOnly = true;
	permissions = [PermissionFlagsBits.ManageChannels];

	slashCommand = (subcommand) =>
		subcommand.setName('enable').setDescription('Enable AI in this channel');

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const channelId = interaction.channel.id;
		const guildId = interaction.guild.id;

		const [setting] = await ServerSetting.findOrCreateWithCache({
			where: {
				guildId,
			},
			defaults: {
				guildId,
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
	}
}

exports.default = EnableCommand;
