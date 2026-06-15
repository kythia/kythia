/**
 * @namespace: addons/core/commands/utils/kyth/team/list.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class ListCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand.setName('list').setDescription('Show all Kythia Team members');
	async execute(interaction) {
		const container = this.container;
		const { t, models, logger, helpers } = container;
		const { KythiaTeam } = models;
		const { createContainer } = helpers.discord;
		await interaction.deferReply();
		try {
			const teamMembers = await KythiaTeam.getAllCache();
			if (teamMembers.length === 0) {
				const components = await createContainer(interaction, {
					description: await t(interaction, 'core.utils.kyth.team.list.empty'),
					color: 'Blurple',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			const noRole = await t(interaction, 'core.utils.kyth.team.list.no.role');
			const unknownUser = await t(
				interaction,
				'core.utils.kyth.team.list.unknown',
			);
			const memberList = [];
			for (const member of teamMembers) {
				try {
					const user = await helpers.discord.getUserSafe(
						interaction.client,
						member.userId,
					);
					const userName = user
						? user.tag
						: `${unknownUser} (${member.userId})`;
					const nameRole = member.name || noRole;
					memberList.push(
						await t(interaction, 'core.utils.kyth.team.list.row', {
							name: userName,
							id: member.userId,
							role: nameRole,
						}),
					);
				} catch (err) {
					logger.warn(
						`Failed to fetch user ${member.userId}: ${err.message || err}`,
						{
							label: 'core',
						},
					);
					memberList.push(
						await t(interaction, 'core.utils.kyth.team.list.row', {
							name: `${unknownUser}`,
							id: member.userId,
							role: member.name || noRole,
						}),
					);
				}
			}
			const description =
				(await t(interaction, 'core.utils.kyth.team.list.total', {
					count: teamMembers.length,
				})) +
				'\n\n' +
				memberList.join('\n\n');
			const components = await createContainer(interaction, {
				title: await t(interaction, 'core.utils.kyth.team.list.title'),
				description,
				color: 'Blurple',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
			logger.info(`Kythia Team list viewed by ${interaction.user.tag}`, {
				label: 'core',
			});
		} catch (error) {
			logger.error(`Failed to list team members: ${error.message || error}`, {
				label: 'core',
			});
			const components = await createContainer(interaction, {
				description: await t(interaction, 'core.utils.kyth.team.list.error', {
					error: error.message,
				}),
				color: 'Red',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
exports.default = ListCommand;
