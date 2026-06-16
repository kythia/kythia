/**
 * @namespace: addons/minecraft/commands/player/help.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

class HelpCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('help')
			.setDescription('📖 View all Minecraft addon commands and features');

	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers } = container;

		const accentColor = helpers.color.convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});

		const sections = [
			// ── Header ────────────────────────────────────────────────────────
			await t(interaction, 'minecraft.player.help.header'),
			await t(interaction, 'minecraft.player.help.header_sub'),

			// ── Player commands ────────────────────────────────────────────────
			'',
			await t(interaction, 'minecraft.player.help.player_commands_title'),
			await t(interaction, 'minecraft.player.help.player_commands_desc'),
			'',
			await t(interaction, 'minecraft.player.help.cmd_avatar'),
			await t(interaction, 'minecraft.player.help.cmd_head'),
			await t(interaction, 'minecraft.player.help.cmd_body'),
			await t(interaction, 'minecraft.player.help.cmd_skin'),
			await t(interaction, 'minecraft.player.help.cmd_pose'),
			await t(interaction, 'minecraft.player.help.pose_list'),
			'',
			await t(interaction, 'minecraft.player.help.cmd_wallpaper'),

			// ── Server commands ────────────────────────────────────────────────
			'',
			await t(interaction, 'minecraft.player.help.server_commands_title'),
			'',
			await t(interaction, 'minecraft.player.help.cmd_status'),

			// ── Settings commands ──────────────────────────────────────────────
			'',
			await t(interaction, 'minecraft.player.help.settings_commands_title'),
			await t(interaction, 'minecraft.player.help.settings_commands_desc'),
			'',
			await t(interaction, 'minecraft.player.help.cmd_autosetup'),
			'',
			await t(interaction, 'minecraft.player.help.cmd_set_ip'),
			'',
			await t(interaction, 'minecraft.player.help.enable_feature'),

			// ── Cron info ──────────────────────────────────────────────────────
			'',
			await t(interaction, 'minecraft.player.help.live_stats_title'),
			await t(interaction, 'minecraft.player.help.live_stats_desc'),
		];

		const responseContainer = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(sections.join('\n')),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'common.container.footer', {
						username: interaction.client.user.username,
					}),
				),
			);

		return interaction.reply({
			components: [responseContainer],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = HelpCommand;
