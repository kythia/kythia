/**
 * @namespace: addons/automod/commands/moderation/autosetup.js
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

const { BaseCommand } = require('kythia-core');

class AutosetupCommand extends BaseCommand {
	permissions = PermissionFlagsBits.Administrator;
	botPermissions = PermissionFlagsBits.Administrator;

	slashCommand = (subcommand) =>
		subcommand
			.setName('autosetup')
			.setDescription('🤖 Automatically setup moderation channels and roles.');

	async execute(interaction) {
		const container = this.container;
		const { t, helpers, models, kythiaConfig } = container;
		const { createContainer, simpleContainer } = helpers.discord;
		const { ServerSetting } = models;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		try {
			const guild = interaction.guild;
			let modLogChannel = guild.channels.cache.find(
				(c) => c.name === 'mod-log',
			);
			let muteRole = guild.roles.cache.find((r) => r.name === 'Muted');

			const createdItems = [];

			if (!modLogChannel) {
				modLogChannel = await guild.channels.create({
					name: 'mod-log',
					type: ChannelType.GuildText,
					permissionOverwrites: [
						{
							id: guild.id,
							deny: [PermissionFlagsBits.ViewChannel],
						},
					],
				});
				createdItems.push(
					await t(interaction, 'core.moderation.autosetup.created.channel', {
						channel: modLogChannel.toString(),
					}),
				);
			}

			if (!muteRole) {
				muteRole = await guild.roles.create({
					name: 'Muted',
					color: 'Grey',
					permissions: [],
				});
				createdItems.push(
					await t(interaction, 'core.moderation.autosetup.created.role', {
						role: muteRole.name,
					}),
				);

				// Apply mute role to all channels
				guild.channels.cache.forEach(async (channel) => {
					if (channel.type === ChannelType.GuildText) {
						await channel.permissionOverwrites.create(muteRole, {
							SendMessages: false,
							AddReactions: false,
						});
					} else if (channel.type === ChannelType.GuildVoice) {
						await channel.permissionOverwrites.create(muteRole, {
							Speak: false,
						});
					}
				});
			}

			// Save to DB
			const setting = await ServerSetting.getCache({ guildId: guild.id });
			setting.modLogChannelId = modLogChannel.id;
			setting.muteRoleId = muteRole.id;
			await setting.save();

			const description =
				createdItems.length > 0
					? createdItems.join('\n')
					: await t(interaction, 'core.moderation.autosetup.nothing.new');

			const reply = await createContainer(interaction, {
				color: kythiaConfig.bot.color,
				title: await t(interaction, 'core.moderation.autosetup.success.title'),
				description,
				thumbnail: guild.iconURL(),
			});
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'core.moderation.autosetup.failed', {
					error: error.message,
				}),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
	}
}

exports.default = AutosetupCommand;
