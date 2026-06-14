/**
 * @namespace: addons/core/commands/utils/kyth/mass-leave.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class MassLeaveCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('mass-leave')
			.setDescription('Mass leave guilds with member count below threshold.')
			.addIntegerOption((option) =>
				option
					.setName('min_member')
					.setDescription(
						'Threshold: Leave guilds with LESS members than this.',
					)
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('message')
					.setDescription('Last message to send before leaving (Optional).'),
			)
			.addStringOption((option) =>
				option
					.setName('except')
					.setDescription(
						'Comma-separated guild IDs to additionally protect from being left (Optional).',
					),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		const { client } = interaction;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const exceptRaw = interaction.options.getString('except') || '';
		const extraExcept = exceptRaw
			.split(',')
			.map((id) => id.trim())
			.filter(Boolean);

		const SAFE_GUILDS = [
			kythiaConfig.bot.mainGuildId,
			kythiaConfig.bot.devGuildId,
			interaction?.guild?.id,
			...extraExcept,
		].filter(Boolean);

		const threshold = interaction.options.getInteger('min_member');
		const customMsg =
			interaction.options.getString('message') ||
			(await t(interaction, 'core.utils.kyth.mass-leave.goodbye', {
				threshold,
			}));

		const customMsgContainer = await simpleContainer(interaction, customMsg);

		let leftCount = 0;
		let errorCount = 0;
		const leftNames = [];

		if (client.shard) {
			const results = await client.shard.broadcastEval(
				async (c, context) => {
					const localTargets = c.guilds.cache.filter(
						(g) =>
							g.memberCount < context.threshold &&
							!context.SAFE_GUILDS.includes(g.id),
					);

					if (localTargets.size === 0)
						return { leftCount: 0, errorCount: 0, leftNames: [] };

					let lCount = 0;
					let eCount = 0;
					const lNames = [];

					for (const [, guild] of localTargets) {
						try {
							let channel = guild.systemChannel;
							if (!channel) {
								channel = guild.channels.cache.find(
									(ch) =>
										ch.isTextBased() &&
										ch.permissionsFor(guild.members.me).has('SendMessages') &&
										(ch.name.includes('general') ||
											ch.name.includes('chat') ||
											ch.name.includes('obrolan')),
								);
							}
							if (!channel) {
								channel = guild.channels.cache.find(
									(ch) =>
										ch.isTextBased() &&
										ch.permissionsFor(guild.members.me).has('SendMessages'),
								);
							}
							if (channel) {
								await channel
									.send({
										content: context.customMsg,
									})
									.catch(() => null);
							}
							await guild.leave();
							lCount++;
							lNames.push(`${guild.name} (${guild.memberCount})`);
							// Delay 1s per guild leave to avoid ratelimits
							await new Promise((r) => setTimeout(r, 1000));
						} catch {
							eCount++;
						}
					}
					return { leftCount: lCount, errorCount: eCount, leftNames: lNames };
				},
				{ context: { threshold, SAFE_GUILDS, customMsg } },
			);

			leftCount = results.reduce((acc, r) => acc + r.leftCount, 0);
			errorCount = results.reduce((acc, r) => acc + r.errorCount, 0);
			leftNames.push(...results.flatMap((r) => r.leftNames));

			if (leftCount === 0 && errorCount === 0) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'core.utils.kyth.mass-leave.empty', {
						threshold,
					}),
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		} else {
			const targets = client.guilds.cache.filter(
				(g) => g.memberCount < threshold && !SAFE_GUILDS.includes(g.id),
			);

			if (targets.size === 0) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'core.utils.kyth.mass-leave.empty', {
						threshold,
					}),
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			for (const [, guild] of targets) {
				try {
					let channel = guild.systemChannel;
					if (!channel) {
						channel = guild.channels.cache.find(
							(c) =>
								c.isTextBased() &&
								c.permissionsFor(guild.members.me).has('SendMessages') &&
								(c.name.includes('general') ||
									c.name.includes('chat') ||
									c.name.includes('obrolan')),
						);
					}
					if (!channel) {
						channel = guild.channels.cache.find(
							(c) =>
								c.isTextBased() &&
								c.permissionsFor(guild.members.me).has('SendMessages'),
						);
					}
					if (channel) {
						await channel
							.send({
								components: customMsgContainer,
								flags: MessageFlags.IsComponentsV2,
							})
							.catch(() => null);
					}
					await guild.leave();
					leftCount++;
					leftNames.push(`${guild.name} (${guild.memberCount})`);
					await new Promise((r) => setTimeout(r, 1000));
				} catch (e) {
					logger.error(
						`Failed to cleanup guild ${guild.name}: ${e.message || e}`,
						{
							label: 'leave-guild',
						},
					);
					errorCount++;
				}
			}
		}

		let desc = await t(interaction, 'core.utils.kyth.mass-leave.success', {
			threshold,
			leftCount,
			errorCount,
		});
		if (leftNames.length > 0) {
			const sliced = leftNames.slice(0, 10);
			const extra =
				leftNames.length > 10
					? await t(interaction, 'core.utils.kyth.mass-leave.more', {
							count: leftNames.length - 10,
						})
					: '';
			desc += await t(interaction, 'core.utils.kyth.mass-leave.list', {
				names: sliced.join('\n') + (extra ? `\n${extra}` : ''),
			});
		}

		const components = await simpleContainer(interaction, desc);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = MassLeaveCommand;
