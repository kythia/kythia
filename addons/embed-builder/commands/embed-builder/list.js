/**
 * @namespace: addons/embed-builder/commands/embed-builder/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, SlashCommandSubcommandBuilder } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class ListCommand extends BaseCommand {
	slashCommand = new SlashCommandSubcommandBuilder()
		.setName('list')
		.setDescription('📋 List all saved embeds for this server');

	async execute(interaction) {
		const container = this.container;
		const { models } = container;
		const { EmbedBuilder: EmbedModel } = models;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const embeds = await EmbedModel.getAllCache({
			where: { guildId: interaction.guild.id },
			order: [['createdAt', 'DESC']],
		});

		if (embeds.length === 0) {
			const { simpleContainer } = container.helpers.discord;
			const { t } = container;
			return interaction.editReply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'embed-builder.list.empty'),
					{ color: 'Yellow' },
				),
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// Chunk into pages of 10
		const perPage = 10;
		const page = embeds.slice(0, perPage);

		const lines = page.map((e) => {
			const modeIcon = e.mode === 'components_v2' ? '🧩' : '📋';
			const sentInfo = e.messageId
				? ` · [sent](https://discord.com/channels/${interaction.guild.id}/${e.channelId}/${e.messageId})`
				: '';
			return `${modeIcon} **${e.name}** \`#${e.id}\`${sentInfo}`;
		});

		const footer =
			embeds.length > perPage
				? `\n\n_...and ${embeds.length - perPage} more. Use the dashboard to see all._`
				: '';

		const { createContainer } = container.helpers.discord;
		const { t } = container;
		return interaction.editReply({
			components: await createContainer(interaction, {
				title: await t(interaction, 'embed-builder.list.title'),
				description: lines.join('\n') + footer,
				color: '#5865F2',
				footer: {
					text: `${embeds.length} embed${embeds.length !== 1 ? 's' : ''} total`,
				},
			}),
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = ListCommand;
