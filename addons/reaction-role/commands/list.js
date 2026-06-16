/**
 * @namespace: addons/reaction-role/commands/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags, ContainerBuilder } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class ListCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('list')
			.setDescription('📜 List all reaction roles in this server.');

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers, logger } = container;
		const { ReactionRole } = models;
		const { chunkTextDisplay } = helpers.discord;
		const { convertColor } = helpers.color;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		try {
			const roles = await ReactionRole.getAllCache({
				where: {
					guildId: interaction.guildId,
				},
			});

			if (!roles || roles.length === 0) {
				return interaction.editReply({
					content: await t(interaction, 'reaction-role.list.empty'),
				});
			}

			// Group by channel -> message
			const grouped = {};
			for (const rr of roles) {
				const key = `${rr.channelId}-${rr.messageId}`;
				if (!grouped[key]) {
					grouped[key] = {
						channelId: rr.channelId,
						messageId: rr.messageId,
						roles: [],
					};
				}
				grouped[key].roles.push({
					emoji: rr.emoji,
					roleId: rr.roleId,
				});
			}

			let description = '';
			for (const group of Object.values(grouped)) {
				const jumpLink = `https://discord.com/channels/${interaction.guildId}/${group.channelId}/${group.messageId}`;
				description += `**Message:** [Link](${jumpLink}) in <#${group.channelId}>\n`;
				for (const rr of group.roles) {
					description += `• ${rr.emoji} <@&${rr.roleId}>\n`;
				}
				description += '\n';
			}

			const title = await t(interaction, 'reaction-role.list.title');
			const fullContent = await t(
				interaction,
				'reaction-role.list.content_md',
				{ title, description },
			);

			const chunks = chunkTextDisplay(fullContent);
			const listContainer = new ContainerBuilder()
				.setAccentColor(
					convertColor('Blue', { from: 'discord', to: 'decimal' }),
				)
				.addTextDisplayComponents(...chunks);

			return interaction.editReply({
				components: [listContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Error: ${error.message || error}`, {
				label: 'reaction-role:list',
			});
			return interaction.editReply({
				content: await t(interaction, 'common.error.generic'),
			});
		}
	}
}

exports.default = ListCommand;
