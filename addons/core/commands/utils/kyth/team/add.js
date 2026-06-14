/**
 * @namespace: addons/core/commands/utils/kyth/team/add.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class AddCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('add')
			.setDescription('Add a member to Kythia Team')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('User to add to the team')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('name')
					.setDescription('Name/role of the team member')
					.setRequired(false),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, logger, helpers } = container;
		const { KythiaTeam } = models;
		const { createContainer } = helpers.discord;

		await interaction.deferReply();

		const user = interaction.options.getUser('user');
		const name = interaction.options.getString('name') || null;

		try {
			const existing = await KythiaTeam.getCache({ userId: user.id });
			if (existing) {
				const components = await createContainer(interaction, {
					description: await t(
						interaction,
						'core.utils.kyth.team.add.already',
						{ tag: user.tag },
					),
					color: 'Red',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			await KythiaTeam.create({ userId: user.id, name });

			const components = await createContainer(interaction, {
				title: await t(interaction, 'core.utils.kyth.team.add.title'),
				description: await t(interaction, 'core.utils.kyth.team.add.success', {
					tag: user.tag,
					id: user.id,
					name:
						name || (await t(interaction, 'core.utils.kyth.team.list.no.role')),
				}),
				color: 'Green',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
			logger.info(
				`Added ${user.tag} (${user.id}) to Kythia Team by ${interaction.user.tag}`,
				{ label: 'core' },
			);
		} catch (error) {
			logger.error(`Failed to add team member: ${error.message || error}`, {
				label: 'core',
			});
			const components = await createContainer(interaction, {
				description: await t(interaction, 'core.utils.kyth.team.add.error', {
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

exports.default = AddCommand;
