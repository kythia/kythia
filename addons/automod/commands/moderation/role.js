/**
 * @namespace: addons/automod/commands/moderation/role.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class RoleCommand extends BaseCommand {
	permissions = PermissionFlagsBits.ManageRoles;
	botPermissions = PermissionFlagsBits.ManageRoles;

	slashCommand = (subcommand) =>
		subcommand
			.setName('role')
			.setDescription('🎭 Manage roles for a user.')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to modify roles for')
					.setRequired(true),
			)
			.addRoleOption((option) =>
				option
					.setName('role')
					.setDescription('The role to add or remove')
					.setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, helpers, kythiaConfig } = container;
		const { createContainer, simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const user = interaction.options.getUser('user');
		const role = interaction.options.getRole('role');

		try {
			const member = await interaction.guild.members.fetch(user.id);

			if (member.roles.cache.has(role.id)) {
				await member.roles.remove(role);
				const reply = await createContainer(interaction, {
					color: kythiaConfig.bot.color,
					title: await t(interaction, 'core.moderation.role.removed.title'),
					description: await t(
						interaction,
						'core.moderation.role.removed.desc',
						{
							user: user.tag,
							role: role.name,
						},
					),
					thumbnail: user.displayAvatarURL(),
				});
				return interaction.editReply({
					components: reply,
					flags: MessageFlags.IsComponentsV2,
				});
			} else {
				await member.roles.add(role);
				const reply = await createContainer(interaction, {
					color: kythiaConfig.bot.color,
					title: await t(interaction, 'core.moderation.role.added.title'),
					description: await t(interaction, 'core.moderation.role.added.desc', {
						user: user.tag,
						role: role.name,
					}),
					thumbnail: user.displayAvatarURL(),
				});
				return interaction.editReply({
					components: reply,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		} catch (error) {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'core.moderation.role.failed', {
					error: error.message,
				}),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}

exports.default = RoleCommand;
