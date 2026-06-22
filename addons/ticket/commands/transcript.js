/**
 * @namespace: addons/ticket/commands/transcript.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	FileBuilder,
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	AttachmentBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const { createTicketTranscript } = require('../helpers');
const { BaseCommand } = require('kythia-core');
class TranscriptCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('transcript')
			.setDescription('Get the transcript of the ticket.');
	async execute(interaction) {
		const container = this.container;
		const { models, t, kythiaConfig, helpers, logger } = container;
		const { Ticket, TicketConfig } = models;
		const { convertColor } = helpers.color;
		const { simpleContainer, getChannelSafe, chunkTextDisplay } =
			helpers.discord;
		const ticket = await Ticket.getCache({
			channelId: interaction.channelId,
			status: 'open',
		});
		if (!ticket) {
			const desc = await t(
				interaction,
				'ticket.helpers.index.errors.not_a_ticket',
			);
			return interaction.reply({
				components: await simpleContainer(interaction, desc, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		const ticketConfig = await TicketConfig.getCache({
			id: ticket.ticketConfigId,
		});
		if (!ticketConfig) {
			const desc = await t(
				interaction,
				'ticket.helpers.index.errors.config_missing',
			);
			return interaction.reply({
				components: await simpleContainer(interaction, desc, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		const transcriptChannel = await getChannelSafe(
			interaction.guild,
			ticketConfig.transcriptChannelId,
		);
		if (!transcriptChannel) {
			const desc = await t(
				interaction,
				'ticket.commands.transcript.errors.transcript_channel_missing_cmd',
				{
					channelId: ticketConfig.transcriptChannelId,
				},
			);
			return interaction.reply({
				components: await simpleContainer(interaction, desc, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		try {
			const transcriptText = await createTicketTranscript(
				interaction.channel,
				container,
			);
			let transcriptBuffer = Buffer.from(transcriptText, 'utf-8');
			const maxTranscriptSize = 6 * 1024 * 1024;
			if (transcriptBuffer.length > maxTranscriptSize) {
				transcriptBuffer = transcriptBuffer.slice(0, maxTranscriptSize);
			}
			const filename = `transcript-${ticket.id}.txt`;
			const accentColor = convertColor(kythiaConfig.bot.color, {
				from: 'hex',
				to: 'decimal',
			});
			const title = await t(
				interaction,
				'ticket.helpers.index.transcript.title',
				{
					ticketId: ticket.id,
					typeName: ticketConfig.typeName,
				},
			);
			const userLine = await t(
				interaction,
				'ticket.helpers.index.transcript.user',
				{
					userId: ticket.userId,
				},
			);
			const footerText = await t(interaction, 'common.container.footer', {
				username: interaction.client.user.username,
			});
			const attachment = new AttachmentBuilder(transcriptBuffer)
				.setName(filename)
				.setDescription(
					`Transcript for ticket #${ticket.id} (${ticketConfig.typeName})`,
				);
			const fileComponent = new FileBuilder()
				.setURL(`attachment://${filename}`)
				.setSpoiler(false);
			const v2Components = [
				new ContainerBuilder()
					.setAccentColor(accentColor)
					.addTextDisplayComponents(...chunkTextDisplay(title))
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(...chunkTextDisplay(userLine))
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(false),
					)
					.addFileComponents(fileComponent)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(...chunkTextDisplay(footerText)),
			];
			await transcriptChannel.send({
				components: v2Components,
				files: [attachment],
				flags: MessageFlags.IsComponentsV2,
			});
			const desc = await t(
				interaction,
				'ticket.commands.transcript.util.transcript_success',
				{
					channel: transcriptChannel.toString(),
				},
			);
			return await interaction.reply({
				components: await simpleContainer(interaction, desc, {
					color: 'Green',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		} catch (error) {
			logger.error(`Failed to create transcript: ${error.message || error}`, {
				label: 'ticket',
			});
			const desc = await t(
				interaction,
				'ticket.commands.transcript.errors.transcript_failed',
			);
			return interaction.reply({
				components: await simpleContainer(interaction, desc, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
	}
}
exports.default = TranscriptCommand;
