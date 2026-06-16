/**
 * @namespace: addons/automod/commands/moderation/unlock.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class UnlockCommand extends BaseCommand {
	permissions = PermissionFlagsBits.ManageChannels;
	botPermissions = PermissionFlagsBits.ManageChannels;

	slashCommand = (subcommand) =>
		subcommand
			.setName('unlock')
			.setDescription('🔓 Unlocks the current channel.')
			.addStringOption((option) =>
				option
					.setName('reason')
					.setDescription('Reason for unlocking the channel')
					.setRequired(false),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, helpers, kythiaConfig } = container;
		const { createContainer, simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const reason =
			interaction.options.getString('reason') ||
			(await t(interaction, 'automod.moderation.unlock.default.reason'));

		try {
			await interaction.channel.permissionOverwrites.edit(
				interaction.guild.roles.everyone,
				{
					SendMessages: null,
				},
				{ reason },
			);

			const reply = await createContainer(interaction, {
				color: kythiaConfig.bot.color,
				title: await t(interaction, 'automod.moderation.unlock.success.title'),
				description: await t(
					interaction,
					'automod.moderation.unlock.success.desc',
					{
						channel: interaction.channel.toString(),
						reason,
					},
				),
				thumbnail: interaction.guild.iconURL(),
			});
			await interaction.channel.send({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});

			const confirmReply = await simpleContainer(
				interaction,
				await t(interaction, 'automod.moderation.unlock.confirm'),
				{ color: 'Green' },
			);
			return interaction.editReply({
				components: confirmReply,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'automod.moderation.unlock.failed', {
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

exports.default = UnlockCommand;
