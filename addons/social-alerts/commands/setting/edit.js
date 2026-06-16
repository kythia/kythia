/**
 * @namespace: addons/social-alerts/commands/setting/edit.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class EditCommand extends BaseCommand {
	subcommand = true;
	permissions = [PermissionFlagsBits.ManageGuild];

	slashCommand = (subcommand) =>
		subcommand
			.setName('edit')
			.setDescription('✍️ Edit Social Alerts settings.')
			.addRoleOption((option) =>
				option
					.setName('mention_role')
					.setDescription(
						'🔔 Role to mention in every alert. Leave empty to skip changes.',
					),
			);

	async execute(interaction) {
		const container = this.container;
		const { models, helpers, t } = container;
		const { SocialAlertSetting } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const [setting] = await SocialAlertSetting.getOrCreateCache(
			{
				guildId: interaction.guild.id,
			},
			{
				guildId: interaction.guild.id,
			},
		);

		const mentionRole = interaction.options.getRole('mention_role');
		const changes = [];

		if (mentionRole !== null) {
			setting.mentionRoleId = mentionRole.id;
			const line = await t(
				interaction,
				'social-alert.setting.edit.mention_role',
				{
					role: mentionRole.id,
				},
			);
			changes.push(line);
		}

		if (changes.length === 0) {
			return interaction.editReply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'social-alert.error.no_changes'),
					{ color: 'Yellow' },
				),
				flags: MessageFlags.IsComponentsV2,
			});
		}

		await setting.save();

		const desc = await t(interaction, 'social-alert.setting.edit.success', {
			changes: changes.join('\n'),
		});

		return interaction.editReply({
			components: await simpleContainer(interaction, desc, { color: 'Green' }),
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = EditCommand;
