/**
 * @namespace: addons/core/commands/utils/server-info.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ButtonStyle,
	ChannelType,
	MessageFlags,
	ButtonBuilder,
	SectionBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	ThumbnailBuilder,
	TextDisplayBuilder,
	MediaGalleryBuilder,
	SlashCommandBuilder,
	SeparatorSpacingSize,
	InteractionContextType,
	MediaGalleryItemBuilder,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

class ServerInfoCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('serverinfo')
		.setDescription('📰 Displays detailed information about the server.')
		.setContexts(InteractionContextType.Guild);

	guildOnly = true;

	async execute(interaction) {
		const container = this.container;
		await interaction.deferReply();

		const { t, helpers, kythiaConfig } = container;
		const { convertColor } = helpers.color;

		const guild = interaction.guild;
		const owner = await guild.fetchOwner().catch(() => null);

		const verificationLevels = {
			0: await t(interaction, 'core.utils.serverinfo.verification.none'),
			1: await t(interaction, 'core.utils.serverinfo.verification.low'),
			2: await t(interaction, 'core.utils.serverinfo.verification.medium'),
			3: await t(interaction, 'core.utils.serverinfo.verification.high'),
			4: await t(interaction, 'core.utils.serverinfo.verification.very.high'),
		};
		const explicitContentFilterLevels = {
			0: await t(interaction, 'core.utils.serverinfo.filter.disabled'),
			1: await t(
				interaction,
				'core.utils.serverinfo.filter.members.without.roles',
			),
			2: await t(interaction, 'core.utils.serverinfo.filter.all.members'),
		};
		const nsfwLevels = {
			0: await t(interaction, 'core.utils.serverinfo.nsfw.default'),
			1: await t(interaction, 'core.utils.serverinfo.nsfw.explicit'),
			2: await t(interaction, 'core.utils.serverinfo.nsfw.safe'),
			3: await t(interaction, 'core.utils.serverinfo.nsfw.age.restricted'),
		};
		const mfaLevels = {
			0: await t(interaction, 'core.utils.serverinfo.mfa.not.required'),
			1: await t(interaction, 'core.utils.serverinfo.mfa.required'),
		};
		const premiumTiers = {
			0: await t(interaction, 'core.utils.serverinfo.boost.none'),
			1: await t(interaction, 'core.utils.serverinfo.boost.level1'),
			2: await t(interaction, 'core.utils.serverinfo.boost.level2'),
			3: await t(interaction, 'core.utils.serverinfo.boost.level3'),
		};

		const emojis = {
			name: '🏷️',
			region: '🌍',
			members: '👥',
			created: '📅',
			owner: '👑',
			description: '📝',
			verification: '🔒',
			boost: '🚀',
			boosts: '💎',
			afk: '💤',
			afkTimeout: '⏰',
			filter: '🛡️',
			roles: '🔖',
			emojis: '😃',
			stickers: '🏷️',
			banner: '🖼️',
			splash: '🌊',
			features: '✨',
			vanity: '🔗',
			mfa: '🛡️',
			nsfw: '🔞',
			system: '💬',
			rules: '📜',
			locale: '🌐',
			icon: '🖼️',
			threads: '🧵',
			stage: '🎤',
			forum: '🗂️',
			categories: '📁',
			text: '💬',
			voice: '🔊',
			news: '📰',
			announcement: '📢',
			publicUpdates: '🌟',
			widget: '🔲',
			maxPresences: '👤',
			maxMembers: '👥',
			maxVideo: '🎥',
			maxEmojis: '😃',
			maxStickers: '🏷️',
			partner: '🤝',
			verified: '✅',
			discovery: '🔍',
			welcome: '👋',
			community: '🌐',
			premiumProgressBar: '📈',
			safety: '🛡️',
			inviteSplash: '🌊',
			invite: '🔗',
			application: '🧩',
			directory: '📚',
			monetization: '💰',
			creator: '🎨',
			memberVerification: '📝',
			roleSubscription: '💳',
			soundboard: '🎵',
			serverGuidelines: '📖',
			serverAvatar: '🖼️',
			serverSoundboard: '🎵',
			serverDirectory: '📚',
			serverMonetization: '💰',
			serverCreator: '🎨',
			serverMemberVerification: '📝',
			serverRoleSubscription: '💳',
			serverWelcomeScreen: '👋',
			serverSafety: '🛡️',
			serverPremiumProgressBar: '📈',
			serverCommunity: '🌐',
			serverPartner: '🤝',
			serverVerified: '✅',
			serverDiscovery: '🔍',
			serverInviteSplash: '🌊',
			serverApplication: '🧩',
			serverAnnouncement: '📢',
			serverNews: '📰',
			serverPublicUpdates: '🌟',
			serverWidget: '🔲',
			serverMaxPresences: '👤',
			serverMaxMembers: '👥',
			serverMaxVideo: '🎥',
			serverMaxEmojis: '😃',
			serverMaxStickers: '🏷️',
		};

		const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`;

		const bannerURL = guild.bannerURL({ size: 1024 });
		const splashURL = guild.splashURL({ size: 1024 });
		const iconURL = guild.iconURL({ size: 1024, dynamic: true });
		const discoverySplashURL = guild.discoverySplashURL?.({ size: 1024 });
		const widgetURL = guild.widgetEnabled
			? guild.widgetImageURL({ size: 1024 })
			: null;

		const ownerMention = owner
			? `<@${owner.id}> (${owner.user.tag})`
			: guild.ownerId
				? `<@${guild.ownerId}>`
				: await t(interaction, 'core.utils.serverinfo.unknown');

		const _vanity = guild.vanityURLCode
			? `https://discord.gg/${guild.vanityURLCode}`
			: await t(interaction, 'core.utils.serverinfo.none');

		const allChannels = guild.channels.cache;
		const channelCounts = {
			categories: allChannels.filter(
				(c) => c.type === ChannelType.GuildCategory,
			).size,
			text: allChannels.filter((c) => c.type === ChannelType.GuildText).size,
			voice: allChannels.filter((c) => c.type === ChannelType.GuildVoice).size,
			stage: allChannels.filter((c) => c.type === ChannelType.GuildStageVoice)
				.size,
			forum: allChannels.filter((c) => c.type === ChannelType.GuildForum).size,
			announcement: allChannels.filter(
				(c) => c.type === ChannelType.GuildAnnouncement,
			).size,
			publicThreads: allChannels.filter(
				(c) => c.type === ChannelType.PublicThread,
			).size,
			privateThreads: allChannels.filter(
				(c) => c.type === ChannelType.PrivateThread,
			).size,
			news: allChannels.filter((c) => c.type === ChannelType.GuildAnnouncement)
				.size,
		};

		const roles = guild.roles.cache
			.sort((a, b) => b.position - a.position)
			.map((r) => r)
			.filter((r) => r.id !== guild.id);
		const roleCount = roles.length;
		const topRoles =
			roles
				.slice(0, 10)
				.map((r) => r.toString())
				.join(', ') +
			(roleCount > 10
				? `, +${roleCount - 10} ${await t(interaction, 'core.utils.serverinfo.more')}`
				: '');

		const emojisAll = guild.emojis.cache;
		const emojiCount = emojisAll.size;
		const animatedEmojis = emojisAll.filter((e) => e.animated).size;
		const staticEmojis = emojiCount - animatedEmojis;
		const stickers = guild.stickers.cache;
		const stickerCount = stickers.size;

		const features =
			guild.features.length > 0
				? guild.features.map((f) => `\`${f}\``).join(', ')
				: await t(interaction, 'core.utils.serverinfo.none');

		const systemChannel = guild.systemChannel
			? `<#${guild.systemChannel.id}>`
			: await t(interaction, 'core.utils.serverinfo.none');
		const rulesChannel = guild.rulesChannel
			? `<#${guild.rulesChannel.id}>`
			: await t(interaction, 'core.utils.serverinfo.none');
		const publicUpdatesChannel = guild.publicUpdatesChannel
			? `<#${guild.publicUpdatesChannel.id}>`
			: await t(interaction, 'core.utils.serverinfo.none');
		const afkChannel = guild.afkChannel
			? `<#${guild.afkChannel.id}>`
			: await t(interaction, 'core.utils.serverinfo.none');
		const afkTimeout = guild.afkTimeout
			? `${guild.afkTimeout / 60} ${await t(interaction, 'core.utils.serverinfo.minutes')}`
			: await t(interaction, 'core.utils.serverinfo.none');
		const widgetEnabled = guild.widgetEnabled
			? await t(interaction, 'core.utils.serverinfo.enabled')
			: await t(interaction, 'core.utils.serverinfo.disabled');
		const maxPresences =
			guild.maxPresences ||
			(await t(interaction, 'core.utils.serverinfo.unlimited'));
		const maxMembers =
			guild.maxMembers ||
			(await t(interaction, 'core.utils.serverinfo.unlimited'));
		const maxVideoChannelUsers =
			guild.maxVideoChannelUsers ||
			(await t(interaction, 'core.utils.serverinfo.unlimited'));
		const maxEmojis =
			guild.maximumEmojis ||
			(await t(interaction, 'core.utils.serverinfo.unknown'));
		const maxStickers =
			guild.maximumStickers ||
			(await t(interaction, 'core.utils.serverinfo.unknown'));
		const _preferredLocale =
			guild.preferredLocale ||
			(await t(interaction, 'core.utils.serverinfo.unknown'));

		let welcomeScreen = null;
		if (guild.features.includes('WELCOME_SCREEN_ENABLED')) {
			try {
				welcomeScreen = await guild.fetchWelcomeScreen();
			} catch {}
		}

		const row = new ActionRowBuilder().addComponents(
			...(iconURL
				? [
						new ButtonBuilder()
							.setLabel(
								await t(interaction, 'core.utils.serverinfo.button.icon'),
							)
							.setStyle(ButtonStyle.Link)
							.setURL(iconURL),
					]
				: []),
			...(bannerURL
				? [
						new ButtonBuilder()
							.setLabel(
								await t(interaction, 'core.utils.serverinfo.button.banner'),
							)
							.setStyle(ButtonStyle.Link)
							.setURL(bannerURL),
					]
				: []),
			...(splashURL
				? [
						new ButtonBuilder()
							.setLabel(
								await t(interaction, 'core.utils.serverinfo.button.splash'),
							)
							.setStyle(ButtonStyle.Link)
							.setURL(splashURL),
					]
				: []),
			...(discoverySplashURL
				? [
						new ButtonBuilder()
							.setLabel(
								await t(
									interaction,
									'core.utils.serverinfo.button.discovery.splash',
								),
							)
							.setStyle(ButtonStyle.Link)
							.setURL(discoverySplashURL),
					]
				: []),
			...(widgetURL
				? [
						new ButtonBuilder()
							.setLabel(
								await t(interaction, 'core.utils.serverinfo.button.widget'),
							)
							.setStyle(ButtonStyle.Link)
							.setURL(widgetURL),
					]
				: []),
		);

		const descLines = [];

		descLines.push(
			`**\`${emojis.description}\` ${await t(interaction, 'core.utils.serverinfo.field.description')}:** ${guild.description || `*${await t(interaction, 'core.utils.serverinfo.no.description')}*`}`,
		);
		descLines.push(
			`**\`${emojis.owner}\` ${await t(interaction, 'core.utils.serverinfo.field.owner')}:** ${ownerMention}`,
		);
		descLines.push(
			`**\`${emojis.created}\` ${await t(interaction, 'core.utils.serverinfo.field.created')}:** ${createdAt}`,
		);

		descLines.push(
			`**\`${emojis.roles}\` ${await t(interaction, 'core.utils.serverinfo.field.roles')}:** ${await t(interaction, 'core.utils.serverinfo.roles.total', { count: roleCount })}`,
		);
		descLines.push(`  ${topRoles}`);

		descLines.push(
			`**\`${emojis.emojis}\` ${await t(interaction, 'core.utils.serverinfo.field.emojis')}:** ${await t(interaction, 'core.utils.serverinfo.emojis.total', { count: emojiCount })} | ${await t(interaction, 'core.utils.serverinfo.emojis.static', { count: staticEmojis })} | ${await t(interaction, 'core.utils.serverinfo.emojis.animated', { count: animatedEmojis })} | ${await t(interaction, 'core.utils.serverinfo.emojis.max', { count: maxEmojis })}`,
		);
		descLines.push(
			`**\`${emojis.stickers}\` ${await t(interaction, 'core.utils.serverinfo.field.stickers')}:** ${await t(interaction, 'core.utils.serverinfo.stickers.total', { count: stickerCount })} | ${await t(interaction, 'core.utils.serverinfo.stickers.max', { count: maxStickers })}`,
		);

		descLines.push(
			`**\`${emojis.categories}\` ${await t(interaction, 'core.utils.serverinfo.field.categories')}:** ${channelCounts.categories}`,
		);
		descLines.push(
			`**\`${emojis.text}\` ${await t(interaction, 'core.utils.serverinfo.field.text.channels')}:** ${channelCounts.text}`,
		);
		descLines.push(
			`**\`${emojis.voice}\` ${await t(interaction, 'core.utils.serverinfo.field.voice.channels')}:** ${channelCounts.voice}`,
		);
		descLines.push(
			`**\`${emojis.stage}\` ${await t(interaction, 'core.utils.serverinfo.field.stage.channels')}:** ${channelCounts.stage}`,
		);
		descLines.push(
			`**\`${emojis.forum}\` ${await t(interaction, 'core.utils.serverinfo.field.forum.channels')}:** ${channelCounts.forum}`,
		);
		descLines.push(
			`**\`${emojis.announcement}\` ${await t(interaction, 'core.utils.serverinfo.field.announcement.channels')}:** ${channelCounts.announcement}`,
		);
		descLines.push(
			`**\`${emojis.threads}\` ${await t(interaction, 'core.utils.serverinfo.field.threads')}:** ${await t(interaction, 'core.utils.serverinfo.threads.public', { count: channelCounts.publicThreads })} | ${await t(interaction, 'core.utils.serverinfo.threads.private', { count: channelCounts.privateThreads })}`,
		);

		descLines.push(
			`**\`${emojis.verification}\` ${await t(interaction, 'core.utils.serverinfo.field.verification.level')}:** ${verificationLevels[guild.verificationLevel] || (await t(interaction, 'core.utils.serverinfo.unknown'))}`,
		);
		descLines.push(
			`**\`${emojis.filter}\` ${await t(interaction, 'core.utils.serverinfo.field.explicit.content.filter')}:** ${explicitContentFilterLevels[guild.explicitContentFilter] || (await t(interaction, 'core.utils.serverinfo.unknown'))}`,
		);
		descLines.push(
			`**\`${emojis.nsfw}\` ${await t(interaction, 'core.utils.serverinfo.field.nsfw.level')}:** ${nsfwLevels[guild.nsfwLevel] || (await t(interaction, 'core.utils.serverinfo.unknown'))}`,
		);
		descLines.push(
			`**\`${emojis.mfa}\` ${await t(interaction, 'core.utils.serverinfo.field.mfa')}:** ${mfaLevels[guild.mfaLevel] || (await t(interaction, 'core.utils.serverinfo.unknown'))}`,
		);

		descLines.push(
			`**\`${emojis.boost}\` ${await t(interaction, 'core.utils.serverinfo.field.boost.level')}:** ${premiumTiers[guild.premiumTier] || guild.premiumTier} (${guild.premiumTier})`,
		);
		descLines.push(
			`**\`${emojis.boosts}\` ${await t(interaction, 'core.utils.serverinfo.field.total.boosts')}:** ${guild.premiumSubscriptionCount || 0}`,
		);

		descLines.push(
			`**\`${emojis.afk}\` ${await t(interaction, 'core.utils.serverinfo.field.afk.channel')}:** ${afkChannel}`,
		);
		descLines.push(
			`**\`${emojis.afkTimeout}\` ${await t(interaction, 'core.utils.serverinfo.field.afk.timeout')}:** ${afkTimeout}`,
		);

		descLines.push(
			`**\`${emojis.system}\` ${await t(interaction, 'core.utils.serverinfo.field.system.channel')}:** ${systemChannel}`,
		);
		descLines.push(
			`**\`${emojis.rules}\` ${await t(interaction, 'core.utils.serverinfo.field.rules.channel')}:** ${rulesChannel}`,
		);
		descLines.push(
			`**\`${emojis.publicUpdates}\` ${await t(interaction, 'core.utils.serverinfo.field.public.updates.channel')}:** ${publicUpdatesChannel}`,
		);

		descLines.push(
			`**\`${emojis.features}\` ${await t(interaction, 'core.utils.serverinfo.field.features')}:** ${features}`,
		);
		descLines.push(
			`**\`${emojis.widget}\` ${await t(interaction, 'core.utils.serverinfo.field.widget')}:** ${widgetEnabled}`,
		);
		descLines.push(
			`**\`${emojis.maxPresences}\` ${await t(interaction, 'core.utils.serverinfo.field.max.presences')}:** ${maxPresences}`,
		);
		descLines.push(
			`**\`${emojis.maxMembers}\` ${await t(interaction, 'core.utils.serverinfo.field.max.members')}:** ${maxMembers}`,
		);
		descLines.push(
			`**\`${emojis.maxVideo}\` ${await t(interaction, 'core.utils.serverinfo.field.max.video.channel.users')}:** ${maxVideoChannelUsers}`,
		);

		if (welcomeScreen) {
			descLines.push(
				`**${emojis.welcome} ${await t(interaction, 'core.utils.serverinfo.field.welcome.screen')}:** ${welcomeScreen.description || `*${await t(interaction, 'core.utils.serverinfo.no.description')}*`}`,
			);
			if (welcomeScreen.welcomeChannels?.length) {
				descLines.push(
					`**${await t(interaction, 'core.utils.serverinfo.field.welcome.channels')}:**`,
				);
				for (const wc of welcomeScreen.welcomeChannels) {
					descLines.push(
						`${wc.channel ? `<#${wc.channel.id}>` : await t(interaction, 'core.utils.serverinfo.unknown')}: ${wc.description || `*${await t(interaction, 'core.utils.serverinfo.no.description')}*`}`,
					);
				}
			}
		}

		const mainContainer = new ContainerBuilder().setAccentColor(
			convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
		);

		// let serverNameSection = new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${emojis.name} ${guild.name}`));
		// if (iconURL) {
		//     serverNameSection = new SectionBuilder().addTextDisplayComponents(serverNameSection).setThumbnailAccessory(new MediaGalleryItemBuilder().setURL(iconURL).setDescription(guild.name));
		// }
		// mainContainer.addSectionComponents(new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${emojis.name} ${guild.name}`)));

		if (iconURL) {
			const serverNameSection = new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(`# ${emojis.name} ${guild.name}`),
				)
				.setThumbnailAccessory(
					new ThumbnailBuilder().setDescription(guild.name).setURL(iconURL),
				);
			mainContainer.addSectionComponents(serverNameSection);
		} else {
			mainContainer.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(`# ${emojis.name} ${guild.name}`),
			);
		}

		mainContainer.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);

		mainContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(descLines.join('\n')),
		);

		mainContainer.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);

		if (row.components.length > 0) {
			mainContainer.addActionRowComponents(row);

			mainContainer.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			);
		}

		const mainImageURL = bannerURL ? bannerURL : splashURL;
		if (mainImageURL && mainImageURL !== iconURL) {
			mainContainer.addMediaGalleryComponents(
				new MediaGalleryBuilder().addItems([
					new MediaGalleryItemBuilder().setURL(mainImageURL),
				]),
			);
		}

		const footerText = await t(interaction, 'common.container.footer', {
			username: interaction.client.user.username,
		});
		mainContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(`${footerText}`),
		);

		return interaction.editReply({
			components: [mainContainer],
			allowedMentions: {
				parse: [],
			},
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = ServerInfoCommand;
