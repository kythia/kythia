/**
 * @namespace: addons/economy/commands/marry/profile.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	SectionBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	ThumbnailBuilder,
	TextDisplayBuilder,
} = require('discord.js');
const { Op } = require('sequelize');

const { BaseCommand } = require('kythia-core');

class ProfileCommand extends BaseCommand {
	slashCommand = (subcommand) =>
		subcommand
			.setName('profile')
			.setDescription('👰 View your marriage profile');

	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { Marriage } = models;
		const { convertColor } = helpers.color;

		const userId = interaction.user.id;

		const marriages = await Marriage.getAllCache({
			where: {
				[Op.or]: [
					{ user1Id: userId, status: 'married' },
					{ user2Id: userId, status: 'married' },
				],
			},
			limit: 1,
		});

		const marriage = marriages && marriages.length > 0 ? marriages[0] : null;

		if (!marriage) {
			const components = await helpers.discord.simpleContainer(
				interaction,
				await t(interaction, 'fun.marry.not.married.default'),
				{ color: 'Red' },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const partnerId =
			marriage.user1Id === userId ? marriage.user2Id : marriage.user1Id;
		const self = interaction.user;
		const partner = await interaction.client.users
			.fetch(partnerId)
			.catch(() => null);
		const marriedFor = Math.floor(
			(Date.now() - marriage.marriedAt) / (1000 * 60 * 60 * 24),
		);
		const marriedAtStr = marriage.marriedAt.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});

		const selfBlock = `-# ${(await t(interaction, 'fun.marry.profile.you.label', {}, null)) || 'YOU'}\n## ${self.username}\n`;
		const partnerBlock = `-# ${(await t(interaction, 'fun.marry.profile.partner.label', {}, null)) || 'YOUR PARTNER'}\n## ${partner?.username || 'Unknown'}\n`;

		const defaultAvatar = 'https://cdn.discordapp.com/embed/avatars/0.png';
		const selfAvatar = self.displayAvatarURL
			? self.displayAvatarURL({ extension: 'png', size: 256 })
			: defaultAvatar;
		const partnerAvatar = partner?.displayAvatarURL
			? partner.displayAvatarURL({ extension: 'png', size: 256 })
			: defaultAvatar;

		const statsSection =
			`${(await t(interaction, 'fun.marry.profile.married.since', {}, null)) || 'Married Since'}\n${marriedAtStr}\n` +
			`${(await t(interaction, 'fun.marry.profile.days.married', {}, null)) || 'Days Together'}\n${marriedFor} days\n` +
			`${(await t(interaction, 'fun.marry.profile.love.score', {}, null)) || 'Love Score'}\n${marriage.loveScore} ❤️`;

		const footerText = `${await t(interaction, 'common.container.footer', { username: interaction.client.user.username })}`;

		const marryContainer = new ContainerBuilder()
			.setAccentColor(
				convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					(await t(interaction, 'fun.marry.profile.title')) ||
						'💘 MARRIAGE PROFILE',
				),
			)
			.addSeparatorComponents(new SeparatorBuilder().setDivider(true))
			.addSectionComponents(
				new SectionBuilder()
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(selfBlock),
					)
					.setThumbnailAccessory(
						new ThumbnailBuilder()
							.setURL(selfAvatar)
							.setDescription(self.username),
					),
			)
			.addSeparatorComponents(new SeparatorBuilder().setDivider(true))
			.addSectionComponents(
				new SectionBuilder()
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(partnerBlock),
					)
					.setThumbnailAccessory(
						new ThumbnailBuilder()
							.setURL(partnerAvatar)
							.setDescription(partner?.username || 'Unknown'),
					),
			)
			.addSeparatorComponents(new SeparatorBuilder().setDivider(true))
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(statsSection),
			)
			.addSeparatorComponents(new SeparatorBuilder().setDivider(true))
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(footerText),
			);

		await interaction.reply({
			flags: MessageFlags.IsComponentsV2,
			components: [marryContainer],
		});
	}
}

exports.default = ProfileCommand;
