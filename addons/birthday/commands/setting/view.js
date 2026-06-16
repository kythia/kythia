/**
 * @namespace: addons/birthday/commands/setting/view.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class ViewCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('view')
			.setDescription('👀 View current birthday settings.');

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { BirthdaySetting } = models;
		const { simpleContainer } = helpers.discord;

		// Permission Check
		if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
			const msg = await t(interaction, 'common.error.no_permission');
			return interaction.reply({
				components: await simpleContainer(interaction, msg),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		await interaction.deferReply();

		const [setting] = await BirthdaySetting.firstOrCreateCache({
			guildId: interaction.guild.id,
		});

		const notSet = await t(interaction, 'birthday.setting.view.not_set');
		const systemDefault = await t(
			interaction,
			'birthday.setting.view.system_default',
		);
		const yes = await t(interaction, 'birthday.setting.view.yes');
		const no = await t(interaction, 'birthday.setting.view.no');

		const channelVal = setting.channelId
			? `<#${setting.channelId}>`
			: systemDefault;
		const roleVal = setting.roleId ? `<@&${setting.roleId}>` : notSet;
		const pingRoleVal = setting.pingRoleId
			? `<@&${setting.pingRoleId}>`
			: notSet;
		const showAgeVal = setting.showAge ? yes : no;
		const messageVal = setting.message || '🎉 Default';
		const colorVal = setting.embedColor || '🎨 Gold (Default)';
		const imageVal = setting.bgUrl ? `[Link](${setting.bgUrl})` : notSet;

		const desc = [
			await t(interaction, 'birthday.setting.view.channel', {
				channel: channelVal,
			}),
			await t(interaction, 'birthday.setting.view.role', { role: roleVal }),
			await t(interaction, 'birthday.setting.view.ping_role', {
				role: pingRoleVal,
			}),
			await t(interaction, 'birthday.setting.view.show_age', {
				status: showAgeVal,
			}),
			await t(interaction, 'birthday.setting.view.color', { color: colorVal }),
			await t(interaction, 'birthday.setting.view.image', { url: imageVal }),
			await t(interaction, 'birthday.setting.view.message', {
				message: messageVal,
			}),
		].join('\n');

		const components = await simpleContainer(interaction, desc, {
			title: await t(interaction, 'birthday.setting.view.title'),
		});

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: {
				parse: [],
			},
		});
	}
}

exports.default = ViewCommand;
