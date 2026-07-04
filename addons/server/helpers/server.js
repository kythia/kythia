/**
 * @namespace: addons/server/helpers/server.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ChannelType,
	MessageFlags,
	OverwriteType,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	PermissionFlagsBits,
	SeparatorSpacingSize,
} = require('discord.js');
const path = require('node:path');
const { loadTemplates } = require('./template');
const TEMPLATE_DIR = path.join(__dirname, '../template');
const EMBEDDED = loadTemplates(TEMPLATE_DIR);
const PERM = new Proxy(
	{},
	{
		get: (_, key) => {
			if (!PermissionFlagsBits[key]) throw new Error(`unknown perm: ${key}`);
			return PermissionFlagsBits[key];
		},
	},
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function roleIdByName(guild, name) {
	if (name === '@everyone') return guild.roles.everyone.id;
	const r = guild.roles.cache.find(
		(x) => x.name.toLowerCase() === name.toLowerCase(),
	);
	return r?.id;
}
function overwriteFromPermSpec(guild, permSpec) {
	const allow = (permSpec.allow || [])
		.map((p) => PERM[p])
		.reduce((a, b) => a | b, 0n);
	const deny = (permSpec.deny || [])
		.map((p) => PERM[p])
		.reduce((a, b) => a | b, 0n);
	const targets =
		permSpec.roles?.map((n) => roleIdByName(guild, n)).filter(Boolean) || [];
	return targets.map((id) => ({
		id,
		type: OverwriteType.Role,
		allow,
		deny,
	}));
}
async function ensureRole(guild, spec, stats) {
	const exists = guild.roles.cache.find(
		(r) => r.name.toLowerCase() === spec.name.toLowerCase(),
	);
	if (exists) {
		stats.role.skipped++;
		return exists;
	}
	const perms = (spec.perms || [])
		.map((p) => PERM[p])
		.reduce((a, b) => a | b, 0n);
	const role = await guild.roles.create({
		name: spec.name,
		color: spec.color ?? null,
		hoist: !!spec.hoist,
		mentionable: !!spec.mentionable,
		permissions: perms,
		reason: 'autobuild: create role',
	});
	stats.role.created++;
	await sleep(250);
	return role;
}
async function ensureCategory(guild, name, stats) {
	const existing = guild.channels.cache.find(
		(c) =>
			c.type === ChannelType.GuildCategory &&
			c.name.toLowerCase() === name.toLowerCase(),
	);
	if (existing) {
		stats.category.skipped++;
		return existing;
	}
	const cat = await guild.channels.create({
		name,
		type: ChannelType.GuildCategory,
		reason: 'autobuild: create category',
	});
	stats.category.created++;
	await sleep(250);
	return cat;
}
async function ensureChannel(guild, category, spec, stats) {
	const { logger, helpers, kythiaConfig } = guild.client.container;
	const existing = guild.channels.cache.find(
		(c) =>
			c.parentId === category.id &&
			c.name.toLowerCase() === spec.name.toLowerCase(),
	);
	if (existing) {
		stats.channel.skipped++;
		return existing;
	}
	const options = {
		name: spec.name,
		type: spec.type,
		parent: category.id,
		topic: spec.topic || undefined,
		nsfw: !!spec.nsfw,
		rateLimitPerUser: spec.rateLimitPerUser || undefined,
		reason: 'autobuild: create channel',
	};
	if (spec.type === ChannelType.GuildForum) {
		options.availableTags = (spec.forumTags || []).map((t) => ({
			name: t,
		}));
		options.defaultAutoArchiveDuration = 10080;
		options.defaultThreadRateLimitPerUser = 5;
	}
	if (Array.isArray(spec.perms) && spec.perms.length) {
		options.permissionOverwrites = spec.perms.flatMap((p) =>
			overwriteFromPermSpec(guild, p),
		);
	}
	const ch = await guild.channels.create(options);
	stats.channel.created++;
	await sleep(300);
	if (
		Array.isArray(spec.pin) &&
		spec.pin.length &&
		ch.type === ChannelType.GuildText
	) {
		for (const msg of spec.pin) {
			let m;
			if (typeof msg === 'object' && msg !== null && !Array.isArray(msg)) {
				const { convertColor } = helpers.color;
				const container = new ContainerBuilder().setAccentColor(
					msg.color
						? convertColor(msg.color, {
								from: 'hex',
								to: 'decimal',
							})
						: convertColor(kythiaConfig.bot.color, {
								from: 'hex',
								to: 'decimal',
							}),
				);
				let content = '';
				const { t } = kythiaConfig.container || guild.client.container;
				const fakeInteraction = {
					client: guild.client,
				};
				if (msg.title)
					content += `${await t(
						fakeInteraction,
						'server.helpers.server.server.reset.msg_title_md',
						{
							title: msg.title,
						},
					)}\n\n`;
				if (msg.description) content += msg.description;
				container.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(content),
				);
				if (msg.footer?.text) {
					container
						.addSeparatorComponents(
							new SeparatorBuilder()
								.setSpacing(SeparatorSpacingSize.Small)
								.setDivider(true),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(msg.footer.text),
						);
				}
				m = await ch.send({
					components: [container],
					flags: MessageFlags.IsComponentsV2,
				});
			} else {
				m = await ch.send({
					content: msg,
				});
			}
			if (m) {
				try {
					await m.pin();
				} catch (e) {
					logger.warn(`Gagal mem-pin pesan di channel ${ch.name}:`, e.message, {
						label: 'server',
					});
				}
			}
			await sleep(200);
		}
	}
	return ch;
}
async function updateProgress(interaction, progress) {
	const container = interaction.client.container;
	const { kythiaConfig, t, helpers } = container;
	const { simpleContainer } = helpers.discord;
	const percent =
		progress.total > 0
			? Math.floor((progress.current / progress.total) * 100)
			: 0;
	const barLength = 20;
	const filledLength = Math.round((percent / 100) * barLength);
	const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
	const components = await simpleContainer(
		interaction,
		(await t(interaction, 'server.helpers.server.server.progress.title_md')) +
			'\n' +
			`**${progress.label}**\n` +
			`\`${bar}\` ${percent}%\n` +
			`(${progress.current}/${progress.total})\n\n` +
			(progress.extra || '') +
			`\n${await t(interaction, 'server.helpers.server.server.progress.step', {
				step: progress.step,
				totalSteps: progress.totalSteps,
			})}`,
		{
			color: kythiaConfig.bot.color,
		},
	);
	await interaction.editReply({
		components,
		flags: MessageFlags.IsComponentsV2,
	});
}
async function runTemplate(interaction, tpl, opts) {
	const { guild, client } = interaction;
	const container = client.container;
	const { t } = container;
	const stats = {
		role: {
			created: 0,
			skipped: 0,
		},
		category: {
			created: 0,
			skipped: 0,
		},
		channel: {
			created: 0,
			skipped: 0,
		},
		failed: 0,
	};
	if (!guild) throw new Error('guild missing');
	if (
		!guild.members.me.permissions.has(
			PermissionFlagsBits.ManageGuild |
				PermissionFlagsBits.ManageChannels |
				PermissionFlagsBits.ManageRoles,
		)
	)
		throw new Error(
			'bot kurang permission: ManageGuild, ManageChannels, ManageRoles',
		);
	const totalRoles = (tpl.roles || []).length;
	const totalCats = (tpl.categories || []).length;
	let step = 1;
	const totalSteps = (totalRoles ? 1 : 0) + (totalCats ? 1 : 0);
	if (!opts.dryRun && totalRoles) {
		let i = 0;
		for (const r of tpl.roles || []) {
			try {
				await ensureRole(guild, r, stats);
			} catch {
				stats.failed++;
			}
			i++;
			await updateProgress(interaction, {
				step,
				totalSteps,
				current: i,
				total: totalRoles,
				label: await t(
					interaction,
					'server.helpers.server.server.progress.creating.roles',
				),
			});
		}
		step++;
	}
	let catIdx = 0;
	for (const cat of tpl.categories || []) {
		if (cat.name.toLowerCase() === 'voice' && !opts.includeVoice) continue;
		let catRef = null;
		if (!opts.dryRun) {
			try {
				catRef = await ensureCategory(guild, cat.name, stats);
			} catch {
				stats.failed++;
				continue;
			}
		}
		catIdx++;
		await updateProgress(interaction, {
			step,
			totalSteps,
			current: catIdx,
			total: totalCats,
			label: await t(
				interaction,
				'server.helpers.server.server.progress.creating.categories',
			),
		});
		let chIdx = 0;
		for (const ch of cat.channels || []) {
			if (
				cat.name.toLowerCase() === 'voice' &&
				!opts.includeVoice &&
				ch.type === ChannelType.GuildVoice
			)
				continue;
			if (opts.privateStaff && cat.name.toLowerCase() === 'staff') {
				ch.perms = ch.perms || [];
				ch.perms.unshift({
					roles: ['@everyone'],
					deny: ['ViewChannel'],
				});
			}
			if (!opts.dryRun) {
				try {
					await ensureChannel(guild, catRef, ch, stats);
				} catch {
					stats.failed++;
				}
			} else {
				stats.channel.created++;
			}
			chIdx++;
			await updateProgress(interaction, {
				step: step + 1,
				totalSteps,
				current: chIdx,
				total: cat.channels.length,
				label: await t(
					interaction,
					'server.helpers.server.server.progress.creating.channels',
					{
						category: cat.name,
					},
				),
			});
		}
	}
	return stats;
}
async function resetServer(interaction) {
	const { guild, client } = interaction;
	const container = client.container;
	const { kythiaConfig, t, helpers } = container;
	const { simpleContainer } = helpers.discord;
	let components;
	if (!guild) {
		components = await simpleContainer(
			interaction,
			await t(interaction, 'server.helpers.server.server.reset.no.guild_md'),
			{
				color: 'Red',
			},
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
	components = await simpleContainer(
		interaction,
		await t(
			interaction,
			'server.helpers.server.server.reset.progress.start_md',
		),
		{
			color: kythiaConfig.bot.color,
		},
	);
	await interaction.editReply({
		components,
		flags: MessageFlags.IsComponentsV2,
	});
	const currentChannelId = interaction.channelId;
	const channelPromises = [];
	let chIdx = 0;
	const channelsArr = Array.from(guild.channels.cache.values());
	for (const channel of channelsArr) {
		if (channel.id !== currentChannelId && channel.deletable)
			channelPromises.push(channel.delete().catch(() => {}));
		chIdx++;
		if (chIdx % 5 === 0 || chIdx === channelsArr.length) {
			await simpleContainer(
				interaction,
				await t(
					interaction,
					'server.helpers.server.server.reset.progress.channels_md',
					{
						current: chIdx,
						total: channelsArr.length,
					},
				),
				{
					color: kythiaConfig.bot.color,
					editReply: true,
				},
			);
		}
	}
	await Promise.all(channelPromises);
	const rolePromises = [];
	let roleIdx = 0;
	const rolesArr = Array.from(guild.roles.cache.values());
	for (const role of rolesArr) {
		if (role.editable && role.name !== '@everyone')
			rolePromises.push(role.delete().catch(() => {}));
		roleIdx++;
		if (roleIdx % 5 === 0 || roleIdx === rolesArr.length) {
			await simpleContainer(
				interaction,
				await t(
					interaction,
					'server.helpers.server.server.reset.progress.roles_md',
					{
						current: roleIdx,
						total: rolesArr.length,
					},
				),
				{
					color: kythiaConfig.bot.color,
					editReply: true,
				},
			);
		}
	}
	await Promise.all(rolePromises);
	let emojiIdx = 0;
	const emojisArr = Array.from(guild.emojis.cache.values());
	for (const emoji of emojisArr) {
		await emoji.delete().catch(() => {});
		emojiIdx++;
		if (emojiIdx % 5 === 0 || emojiIdx === emojisArr.length) {
			await simpleContainer(
				interaction,
				await t(
					interaction,
					'server.helpers.server.server.reset.progress.emojis_md',
					{
						current: emojiIdx,
						total: emojisArr.length,
					},
				),
				{
					color: kythiaConfig.bot.color,
					editReply: true,
				},
			);
		}
	}
	if (guild.stickers?.cache) {
		let stickerIdx = 0;
		const stickersArr = Array.from(guild.stickers.cache.values());
		for (const sticker of stickersArr) {
			await sticker.delete().catch(() => {});
			stickerIdx++;
			if (stickerIdx % 2 === 0 || stickerIdx === stickersArr.length) {
				await simpleContainer(
					interaction,
					await t(
						interaction,
						'server.helpers.server.server.reset.progress.stickers_md',
						{
							current: stickerIdx,
							total: stickersArr.length,
						},
					),
					{
						color: kythiaConfig.bot.color,
						editReply: true,
					},
				);
			}
		}
	}
	components = await simpleContainer(
		interaction,
		`${await t(interaction, 'server.helpers.server.server.reset.success')}`,
		{
			color: 'Green',
		},
	);
	return interaction.editReply({
		components,
		flags: MessageFlags.IsComponentsV2,
	});
}
module.exports = {
	EMBEDDED,
	runTemplate,
	resetServer,
	sleep,
};
