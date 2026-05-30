/**
 * @namespace: addons/tempvoice/commands/repair.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	SeparatorSpacingSize,
	TextDisplayBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	ButtonBuilder,
	MessageFlags,
	ButtonStyle,
} = require('discord.js');
const { buildInterface } = require('../helpers/interface');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('repair')
			.setDescription('Repair TempVoice configuration.'),
	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { models, t, helpers, kythiaConfig } = container;
		const { TempVoiceConfig, TempVoiceChannel } = models;
		const { convertColor } = helpers.color;
		const { simpleContainer } = helpers.discord;
		const guild = interaction.guild;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const config = await TempVoiceConfig.getCache({
			where: { guildId: guild.id },
		});

		if (!config) {
			return interaction.editReply({
				components: await simpleContainer(
					interaction,

					await t(interaction, 'tempvoice.repair.no_config'),
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		const logs = [];
		const missingItems = [];

		logs.push(
			await t(interaction, 'tempvoice.repair.start_log', {
				guildName: guild.name,
			}),
		);

		try {
			await guild.channels.fetch(config.categoryId);
			logs.push(await t(interaction, 'tempvoice.repair.category.found'));
		} catch (_e) {
			logs.push(
				await t(interaction, 'tempvoice.repair.category.not_found', {
					id: config.categoryId,
				}),
			);
			missingItems.push('category');
		}

		try {
			await guild.channels.fetch(config.triggerChannelId);
			logs.push(await t(interaction, 'tempvoice.repair.trigger.found'));
		} catch (_e) {
			logs.push(
				await t(interaction, 'tempvoice.repair.trigger.not_found', {
					id: config.triggerChannelId,
				}),
			);
			missingItems.push('trigger');
		}

		let interfaceChannel = null;
		if (config.controlPanelChannelId) {
			try {
				interfaceChannel = await guild.channels.fetch(
					config.controlPanelChannelId,
				);
				logs.push(await t(interaction, 'tempvoice.repair.interface.found'));
			} catch (_e) {
				logs.push(
					await t(interaction, 'tempvoice.repair.interface.not_found', {
						id: config.controlPanelChannelId,
					}),
				);
				missingItems.push('interface');
			}
		}

		if (
			interfaceChannel &&
			config.interfaceMessageId &&
			!missingItems.includes('interface')
		) {
			try {
				await interfaceChannel.messages.fetch(config.interfaceMessageId);
				logs.push(await t(interaction, 'tempvoice.repair.interface.msg_found'));
			} catch (_e) {
				logs.push(
					await t(interaction, 'tempvoice.repair.interface.msg_missing'),
				);

				try {
					const { components, flags } = await buildInterface(interaction);
					const interfaceMessage = await interfaceChannel.send({
						components,
						flags,
					});
					if (interfaceMessage) {
						config.interfaceMessageId = interfaceMessage.id;
						await config.save();
						logs.push(
							await t(interaction, 'tempvoice.repair.interface.msg_sent'),
						);
					}
				} catch (sendErr) {
					logs.push(
						await t(interaction, 'tempvoice.repair.interface.msg_fail', {
							error: sendErr.message,
						}),
					);
				}
			}
		}

		const activeChannels = await TempVoiceChannel.getAllCache({
			where: { guildId: guild.id },
		});
		logs.push(
			await t(interaction, 'tempvoice.repair.scan_active', {
				count: activeChannels.length,
			}),
		);
		let fixed = 0;
		let cleaned = 0;

		for (const dbChannel of activeChannels) {
			try {
				const discordChannel = await guild.channels
					.fetch(dbChannel.channelId)
					.catch(() => null);
				if (!discordChannel) {
					await dbChannel.destroy();
					cleaned++;
				} else {
					if (discordChannel.manageable) {
						fixed++;
					}
				}
			} catch (_e) {
				/* silent */
			}
		}

		logs.push(await t(interaction, 'tempvoice.repair.result.header'));
		logs.push(
			await t(interaction, 'tempvoice.repair.result.cleaned', {
				count: cleaned,
			}),
		);
		logs.push(
			await t(interaction, 'tempvoice.repair.result.fixed', { count: fixed }),
		);

		const kythiaColor = convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});
		const finalContainer = new ContainerBuilder().setAccentColor(kythiaColor);

		finalContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(logs.join('\n')),
		);

		if (missingItems.length > 0) {
			finalContainer.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'tempvoice.repair.critical_missing'),
				),
			);
			finalContainer.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			);
			finalContainer.addActionRowComponents(
				new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('tv_fix_config')
						.setLabel(await t(interaction, 'tempvoice.repair.button_label'))
						.setStyle(ButtonStyle.Danger),
				),
			);
		}

		await interaction.editReply({
			components: [finalContainer],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	},
};
