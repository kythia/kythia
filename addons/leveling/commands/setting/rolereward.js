/**
 * @namespace: addons/leveling/commands/setting/rolereward.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class RolerewardCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('rolereward')
			.setDescription('🎮 Set role reward for a specific level')
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
				opt.setName('level').setDescription('Required level').setRequired(true),
			)
			.addRoleOption((opt) =>
				opt
					.setName('role')
					.setDescription('Role to be given')
					.setRequired(true),
			);

	permissions = [PermissionFlagsBits.ManageGuild];

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const guildId = interaction.guild.id;
		const guildName = interaction.guild.name;
		const role = interaction.options.getRole('role');
		const level = interaction.options.getInteger('level');
		const action = interaction.options.getString('action');

		const [serverSetting] = await ServerSetting.findOrCreateWithCache({
			where: { guildId },
			defaults: { guildId, guildName },
		});

		if (!serverSetting.roleRewards) serverSetting.roleRewards = [];

		let components;
		if (action === 'add') {
			serverSetting.roleRewards = serverSetting.roleRewards.filter(
				(r) => r.level !== level,
			);
			serverSetting.roleRewards.push({ level, role: role.id });
			components = await simpleContainer(
				interaction,
				await t(interaction, 'core.setting.setting.leveling.rolereward.add', {
					role: `<@&${role.id}>`,
					level,
				}),
				{ color: 'Green' },
			);
		} else if (action === 'remove') {
			const initial = serverSetting.roleRewards.length;
			serverSetting.roleRewards = serverSetting.roleRewards.filter(
				(r) => r.level !== level,
			);
			if (serverSetting.roleRewards.length === initial) {
				components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'core.setting.setting.leveling.rolereward.notfound',
						{ level },
					),
					{ color: 'Red' },
				);
			} else {
				components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'core.setting.setting.leveling.rolereward.remove',
						{ level },
					),
					{ color: 'Green' },
				);
			}
		}

		serverSetting.changed('roleRewards', true);
		await serverSetting.save();

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = RolerewardCommand;
