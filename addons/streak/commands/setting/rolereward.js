/**
 * @namespace: addons/streak/commands/setting/rolereward.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class RolerewardCommand extends BaseCommand {
	subcommand = true;
	permissions = [PermissionFlagsBits.ManageGuild];

	slashCommand = (subcommand) =>
		subcommand
			.setName('rolereward')
			.setDescription('🔥 Set role reward for a specific streak')
			.addStringOption((opt) =>
				opt
					.setName('action')
					.setDescription('Add or remove role reward')
					.setRequired(true)
					.addChoices(
						{ name: 'Add', value: 'add' },
						{ name: 'Remove', value: 'remove' },
					),
			)
			.addIntegerOption((opt) =>
				opt
					.setName('streak')
					.setDescription('Required streak')
					.setRequired(true),
			)
			.addRoleOption((opt) =>
				opt
					.setName('role')
					.setDescription('Role to be given')
					.setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const guildId = interaction.guild.id;
		const guildName = interaction.guild.name;
		const role = interaction.options.getRole('role');
		const streak = interaction.options.getInteger('streak');
		const action = interaction.options.getString('action');

		const [serverSetting] = await ServerSetting.findOrCreateCache({
			where: { guildId },
			defaults: { guildId, guildName },
		});

		if (!serverSetting.streakRoleRewards) serverSetting.streakRoleRewards = [];

		let components;
		if (action === 'add') {
			serverSetting.streakRoleRewards = serverSetting.streakRoleRewards.filter(
				(r) => r.streak !== streak,
			);
			serverSetting.streakRoleRewards.push({ streak, role: role.id });
			components = await simpleContainer(
				interaction,
				await t(interaction, 'core.setting.setting.streak.rolereward.add', {
					role: `<@&${role.id}>`,
					streak,
				}),
				{ color: 'Green' },
			);
		} else if (action === 'remove') {
			const initial = serverSetting.streakRoleRewards.length;
			serverSetting.streakRoleRewards = serverSetting.streakRoleRewards.filter(
				(r) => r.streak !== streak,
			);
			if (serverSetting.streakRoleRewards.length === initial) {
				components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'core.setting.setting.streak.rolereward.notfound',
						{ streak },
					),
					{ color: 'Red' },
				);
			} else {
				components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'core.setting.setting.streak.rolereward.remove',
						{ streak },
					),
					{ color: 'Green' },
				);
			}
		}

		serverSetting.changed('streakRoleRewards', true);
		await serverSetting.save();

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = RolerewardCommand;
