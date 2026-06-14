/**
 * @namespace: addons/quest/commands/setup.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { ChannelType, MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class SetupCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('setup')
			.setDescription(
				'Set the channel to post new Discord Quest notifications.',
			)
			.addChannelOption((option) =>
				option
					.setName('channel')
					.setDescription('The text channel where notifications will be sent.')
					.setRequired(true)
					.addChannelTypes(ChannelType.GuildText),
			)
			.addRoleOption((option) =>
				option
					.setName('mention_role')
					.setDescription(
						'Optional: A role to ping when a new quest is posted.',
					)
					.setRequired(false),
			);

	async execute(interaction) {
		const container = this.container;
		const { models, t, helpers } = container;
		const { simpleContainer } = helpers.discord;
		const { QuestConfig } = models;
		const guildId = interaction.guild.id;
		const channel = interaction.options.getChannel('channel');
		const role = interaction.options.getRole('mention_role');

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		await QuestConfig.findOrCreateCache({
			where: { guildId: guildId },
			defaults: {
				guildId: guildId,
				channelId: channel.id,
				roleId: role ? role.id : null,
			},
		});

		const content = await t(interaction, 'questnotifier.setup.success', {
			channel: channel.id,
			role: role
				? `<@&${role.id}>`
				: await t(interaction, 'questnotifier.setup.no_role'),
		});

		await interaction.editReply({
			components: await simpleContainer(interaction, content, {
				color: 'Green',
			}),
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	}
}

exports.default = SetupCommand;
