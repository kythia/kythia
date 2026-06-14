/**
 * @namespace: addons/ai/commands/ai/disable.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class DisableCommand extends BaseCommand {
	guildOnly = true;

	subcommand = true;
	aliases = ['aioff'];
	permissions = [PermissionFlagsBits.ManageChannels];

	slashCommand = (subcommand) =>
		subcommand.setName('disable').setDescription('Disable AI in this channel');

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const channelId = interaction.channel.id;
		const guildId = interaction.guild.id;

		const [setting] = await ServerSetting.findOrCreateCache({
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
	}
}

exports.default = DisableCommand;
