/**
 * @namespace: addons/tempvoice/commands/setup.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags, ChannelType } = require('discord.js');
const { buildInterface } = require('../helpers/interface');

const { BaseCommand } = require('kythia-core');

class SetupCommand extends BaseCommand {
	subcommand = true;
	voteLocked = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('setup')
			.setDescription(
				'Set up "Join to Create" and send the static control panel.',
			)
			.addChannelOption((option) =>
				option
					.setName('trigger_channel')
					.setDescription(
						'Voice channel. (If empty, one will be created automatically)',
					)
					.setRequired(false)
					.addChannelTypes(ChannelType.GuildVoice),
			)
			.addChannelOption((option) =>
				option
					.setName('category')
					.setDescription(
						'Category. (If empty, one will be created automatically)',
					)
					.setRequired(false)
					.addChannelTypes(ChannelType.GuildCategory),
			)
			.addChannelOption((option) =>
				option
					.setName('control_panel')
					.setDescription(
						'Text channel. (If empty, one will be created automatically)',
					)
					.setRequired(false)
					.addChannelTypes(ChannelType.GuildText),
			);

	async execute(interaction) {
		const container = this.container;
		const { models, logger, client, helpers, t } = container;
		const { TempVoiceConfig } = models;
		const { simpleContainer } = helpers.discord;
		const guildId = interaction.guild.id;

		await interaction.deferReply();

		let triggerChannel = interaction.options.getChannel('trigger_channel');
		let category = interaction.options.getChannel('category');
		let controlPanel = interaction.options.getChannel('control_panel');

		const autoReason = await t(interaction, 'tempvoice.setup.auto_reason');

		if (!category) {
			category = await interaction.guild.channels.create({
				name: await t(interaction, 'tempvoice.setup.auto_category_name'),
				type: ChannelType.GuildCategory,
				reason: autoReason,
			});
		}
		if (!triggerChannel) {
			triggerChannel = await interaction.guild.channels.create({
				name: await t(interaction, 'tempvoice.setup.auto_trigger_name'),
				type: ChannelType.GuildVoice,
				parent: category.id,
				reason: autoReason,
			});
		} else if (
			!triggerChannel.parentId ||
			triggerChannel.parentId !== category.id
		) {
			await triggerChannel.setParent(category.id, { lockPermissions: false });
		}
		if (!controlPanel) {
			controlPanel = await interaction.guild.channels.create({
				name: await t(interaction, 'tempvoice.setup.auto_control_name'),
				type: ChannelType.GuildText,
				parent: category.id,
				reason: autoReason,
			});
		} else if (
			!controlPanel.parentId ||
			controlPanel.parentId !== category.id
		) {
			await controlPanel.setParent(category.id, { lockPermissions: false });
		}

		const oldConfig = await TempVoiceConfig.getCache({ guildId });
		if (oldConfig?.interfaceMessageId) {
			try {
				const oldChannel = await client.channels.fetch(
					oldConfig.controlPanelChannelId,
					{ force: true },
				);
				const oldMsg = await oldChannel.messages.fetch(
					oldConfig.interfaceMessageId,
				);
				await oldMsg.delete();
			} catch (e) {
				logger.warn(`Failed to delete old panel: ${e.message}`, {
					label: 'tempvoice',
				});
			}
		}

		const { components, flags } = await buildInterface(interaction);
		const interfaceMessage = await controlPanel.send({ components, flags });

		if (!interfaceMessage) {
			return interaction.editReply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.setup.panel_send_fail'),
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		await TempVoiceConfig.findOrCreateWithCache({
			where: { guildId: guildId },
			defaults: {
				guildId: guildId,
				triggerChannelId: triggerChannel.id,
				categoryId: category.id,
				controlPanelChannelId: controlPanel.id,
				interfaceMessageId: interfaceMessage.id,
			},
		});

		const setupSuccessContent = await t(
			interaction,
			'tempvoice.setup.success_content',
			{
				triggerChannel: triggerChannel.id,
				categoryName: category.name,
				controlPanel: controlPanel.id,
			},
		);

		return interaction.editReply({
			components: await simpleContainer(interaction, setupSuccessContent, {
				color: 'Green',
			}),
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	}
}

exports.default = SetupCommand;
