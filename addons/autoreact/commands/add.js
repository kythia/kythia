/**
 * @namespace: addons/autoreact/commands/add.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { ChannelType, MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class AddCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) => {
		return subcommand
			.setName('add')
			.setDescription('Add a new auto-reaction.')
			.addStringOption((option) =>
				option
					.setName('emoji')
					.setDescription('The emoji to react with.')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('trigger')
					.setDescription('The text to trigger the reaction (Text Mode).')
					.setRequired(false),
			)
			.addChannelOption((option) =>
				option
					.setName('channel')
					.setDescription('The channel to watch (Channel Mode).')
					.addChannelTypes(
						ChannelType.GuildText,
						ChannelType.GuildAnnouncement,
						ChannelType.GuildVoice,
					)
					.setRequired(false),
			);
	};

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { AutoReact } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const emoji = interaction.options.getString('emoji');
		const triggerText = interaction.options.getString('trigger');
		const channel = interaction.options.getChannel('channel');

		// Validation: Must provide exactly one trigger type
		if ((triggerText && channel) || (!triggerText && !channel)) {
			const msg = await t(interaction, 'autoreact.add.error.ambiguous');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// Validation: Simple Emoji Regex (Basic check, not exhaustive)
		// Matches unicode emojis or <:name:id> or <a:name:id>
		const emojiRegex =
			/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|<a?:.+?:\d+>)/g;
		if (!emoji.match(emojiRegex)) {
			const msg = await t(interaction, 'autoreact.add.error.invalid_emoji');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const type = channel ? 'channel' : 'text';
		const triggerValue = channel ? channel.id : triggerText;

		// Check for specific duplicate
		const existing = await AutoReact.getCache({
			where: {
				guildId: interaction.guild.id,
				trigger: triggerValue,
				type: type,
			},
		});

		if (existing) {
			const msg = await t(interaction, 'autoreact.add.error.exists');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		await AutoReact.create({
			guildId: interaction.guild.id,
			userId: interaction.user.id,
			trigger: triggerValue,
			emoji: emoji,
			type: type,
		});

		const successMsg = await t(interaction, 'autoreact.add.success', {
			trigger: channel ? channel.toString() : `\`${triggerText}\``,
			emoji: emoji,
			type: type === 'channel' ? 'Channel' : 'Text',
		});

		const components = await simpleContainer(interaction, successMsg);
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = AddCommand;
