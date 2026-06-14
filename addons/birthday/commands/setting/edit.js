/**
 * @namespace: addons/birthday/commands/setting/edit.js
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

class EditCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('edit')
			.setDescription('✍️ Edit birthday settings.')
			.addChannelOption((option) =>
				option
					.setName('channel')
					.setDescription('📢 Channel for announcements.')
					.addChannelTypes(ChannelType.GuildText),
			)
			.addRoleOption((option) =>
				option
					.setName('role')
					.setDescription('🎁 Role to give to the birthday user.'),
			)
			.addRoleOption((option) =>
				option
					.setName('ping_role')
					.setDescription('🔔 Role to ping in the announcement.'),
			)
			.addBooleanOption((option) =>
				option
					.setName('show_age')
					.setDescription('🎂 Show age in announcements/list?'),
			)
			.addStringOption((option) =>
				option
					.setName('message')
					.setDescription(
						'✉️ Custom message (Variables: {user}, {age}, {zodiac}).',
					),
			)
			.addStringOption((option) =>
				option
					.setName('color')
					.setDescription('🎨 Embed Hex Color (e.g. #FF00FF).'),
			)
			.addStringOption((option) =>
				option
					.setName('image')
					.setDescription('🖼️ Background/Banner Image URL.'),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { BirthdaySetting } = models;
		const { simpleContainer } = helpers.discord;

		// Permission Check
		if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
			const msg = await t(interaction, 'common.error.no_permission');
			return interaction.reply({
				content: msg,
				flags: MessageFlags.Ephemeral,
			});
		}

		await interaction.deferReply();

		let setting = await BirthdaySetting.getCache({
			guildId: interaction.guild.id,
		});

		if (!setting) {
			setting = await BirthdaySetting.create({
				guildId: interaction.guild.id,
			});
		}

		const channel = interaction.options.getChannel('channel');
		const role = interaction.options.getRole('role');
		const pingRole = interaction.options.getRole('ping_role');
		const showAge = interaction.options.getBoolean('show_age');
		const message = interaction.options.getString('message');
		const color = interaction.options.getString('color');
		const image = interaction.options.getString('image');

		const changes = [];

		if (channel) {
			setting.channelId = channel.id;
			changes.push(
				await t(interaction, 'birthday.setting.edit.channel_set', { channel }),
			);
		}
		if (role) {
			setting.roleId = role.id;
			changes.push(
				await t(interaction, 'birthday.setting.edit.role_set', { role }),
			);
		}
		if (pingRole) {
			setting.pingRoleId = pingRole.id;
			changes.push(
				await t(interaction, 'birthday.setting.edit.ping_role_set', {
					role: pingRole,
				}),
			);
		}
		if (showAge !== null) {
			setting.showAge = showAge;
			const yes = await t(interaction, 'birthday.setting.view.yes');
			const no = await t(interaction, 'birthday.setting.view.no');
			changes.push(
				await t(interaction, 'birthday.setting.edit.show_age_set', {
					status: showAge ? yes : no,
				}),
			);
		}
		if (message) {
			setting.message = message;
			changes.push(
				await t(interaction, 'birthday.setting.edit.message_updated'),
			);
		}
		if (color) {
			setting.embedColor = color;
			changes.push(
				await t(interaction, 'birthday.setting.edit.color_set', { color }),
			);
		}
		if (image) {
			setting.bgUrl = image;
			changes.push(await t(interaction, 'birthday.setting.edit.image_updated'));
		}

		if (changes.length === 0) {
			return interaction.editReply({
				content: await t(interaction, 'common.error.no_changes'),
				flags: MessageFlags.Ephemeral,
			});
		}

		await setting.save();

		const title = await t(interaction, 'birthday.setting.edit.title');
		const components = await simpleContainer(
			interaction,
			`${title}\n${changes.join('\n')}`,
		);

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = EditCommand;
