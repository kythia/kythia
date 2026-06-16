/**
 * @namespace: addons/globalchat/commands/setup.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ChannelType,
	MessageFlags,
	PermissionFlagsBits,
} = require('discord.js');
const fetch = require('node-fetch');

const { BaseCommand } = require('kythia-core');

class SetupCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('setup')
			.setDescription(
				'Setup a global chat channel for cross-server interaction',
			)
			.addChannelOption((option) =>
				option
					.setName('channel')
					.setDescription('Select a channel for global chat (optional)')
					.addChannelTypes(ChannelType.GuildText)
					.setRequired(false),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers, logger, client } = container;
		const { GlobalChat } = models;
		const { simpleContainer, getChannelSafe } = helpers.discord;

		const apiUrl = kythiaConfig?.addons?.globalchat?.apiUrl;
		const webhookName = 'Kythia Global Chat';

		await interaction.deferReply();

		let alreadySetup = false;
		let existingChannelId = null;

		try {
			const res = await fetch(`${apiUrl}/list`);
			const resJson = await res.json();

			const found = resJson?.data?.guilds?.find(
				(g) => g.id === interaction.guild.id,
			);

			if (found) {
				alreadySetup = true;
				existingChannelId = found.globalChannelId;
			}
		} catch (error) {
			logger.error(
				`Failed to check existing guild from API: ${error.message || error}`,
				{
					label: 'globalchat',
				},
			);
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'globalchat.setup.check.failed'),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const localDbChat = await GlobalChat.getCache({
			guildId: interaction.guild.id,
		});
		if (alreadySetup || localDbChat) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'globalchat.setup.already.set', {
					channel: `<#${existingChannelId || localDbChat?.globalChannelId}>`,
				}),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		let channel = interaction.options.getChannel('channel');
		let usedChannelId;
		let webhook;

		if (channel) {
			usedChannelId = channel.id;
			try {
				webhook = await channel.createWebhook({
					name: webhookName,
					avatar: client.user.displayAvatarURL(),
				});

				// Send simple welcome message
				await channel.send({
					content: `${await t(interaction, 'globalchat.setup.title')}\n${await t(interaction, 'globalchat.setup.intro.desc')}`,
				});
			} catch (_err) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'globalchat.setup.webhook.failed'),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		} else {
			let createdChannel;
			try {
				createdChannel = await interaction.guild.channels.create({
					name: '🌏┃global・chat',
					type: ChannelType.GuildText,
					topic: `${webhookName} | Make friends, share memes, and bring your best vibes with kythia! `,
					permissionOverwrites: [
						{
							id: client.user.id,
							type: 1,
							allow: [
								PermissionFlagsBits.ViewChannel,
								PermissionFlagsBits.SendMessages,
								PermissionFlagsBits.EmbedLinks,
								PermissionFlagsBits.ReadMessageHistory,
								PermissionFlagsBits.ManageMessages,
							],
						},
						{
							id: interaction.guild.id,
							type: 0,
							allow: [
								PermissionFlagsBits.ViewChannel,
								PermissionFlagsBits.SendMessages,
								PermissionFlagsBits.ReadMessageHistory,
							],
						},
					],
				});

				try {
					channel = await getChannelSafe(interaction.guild, createdChannel.id);
				} catch (fetchError) {
					logger.error(
						`Failed to re-fetch the newly created channel: ${fetchError.message || fetchError}`,
						{ label: 'globalchat' },
					);
				}

				usedChannelId = channel.id;

				webhook = await channel.createWebhook({
					name: webhookName,
					avatar: client.user.displayAvatarURL(),
				});

				// Send simple welcome message
				await channel.send({
					content: `${await t(interaction, 'globalchat.setup.title')}\n${await t(interaction, 'globalchat.setup.intro.desc')}`,
				});
			} catch (err) {
				logger.error(
					`Failed to create global chat channel: ${err.message || err}`,
					{ label: 'globalchat' },
				);
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'globalchat.setup.create.channel.failed'),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}

		try {
			await GlobalChat.create({
				guildId: interaction.guild.id,
				globalChannelId: usedChannelId,
				webhookId: webhook.id,
				webhookToken: webhook.token,
			});
		} catch (err) {
			logger.error(`Failed to save GlobalChat to DB: ${err.message || err}`, {
				label: 'globalchat',
			});
		}

		try {
			await fetch(`${apiUrl}/add`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${kythiaConfig.addons.globalchat.apiKey}`,
				},
				body: JSON.stringify({
					guildId: interaction.guild.id,
					globalChannelId: usedChannelId,
					webhookId: webhook.id,
					webhookToken: webhook.token,
				}),
			});
		} catch (_err) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'globalchat.setup.register.api.failed'),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'globalchat.setup.success', {
				channel: `<#${usedChannelId}>`,
			}),
			{ color: 'Green' },
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = SetupCommand;
