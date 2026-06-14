/**
 * @namespace: addons/social-alerts/commands/setting/view.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const { BaseCommand } = require('kythia-core');
const constantsHelper = require('../../helpers/constants');

// Constants extracted to addons/social-alerts/helpers/constants.js

class ViewCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('view')
			.setDescription('👁️ View current Social Alerts settings for this server.');
	async execute(interaction) {
		const container = this.container;
		const { models, helpers, kythiaConfig, t } = container;
		const { SocialAlertSetting, SocialAlertSubscription } = models;
		const { convertColor } = helpers.color;
		await interaction.deferReply();
		const { MAX_SUBSCRIPTIONS_PER_GUILD } = constantsHelper;
		const [setting, subs] = await Promise.all([
			SocialAlertSetting.getCache({
				guildId: interaction.guild.id,
			}),
			SocialAlertSubscription.getAllCache({
				guildId: interaction.guild.id,
			}),
		]);
		const accentColor = convertColor(kythiaConfig?.bot?.color || '#FF0000', {
			from: 'hex',
			to: 'decimal',
		});
		const noRole = await t(interaction, 'social-alert.setting.view.no_role');
		const roleText = setting?.mentionRoleId
			? `<@&${setting.mentionRoleId}>`
			: noRole;
		const header = await t(interaction, 'social-alert.setting.view.header', {
			role: roleText,
			count: subs?.length ?? 0,
			limit: MAX_SUBSCRIPTIONS_PER_GUILD,
		});
		const footer = await t(interaction, 'social-alert.setting.view.footer');
		const builder = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(header))
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(footer));
		return interaction.editReply({
			components: [builder],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = ViewCommand;
