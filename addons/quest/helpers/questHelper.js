/**
 * @namespace: addons/quest/helpers/questHelper.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	ContainerBuilder,
	TextDisplayBuilder,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	SeparatorBuilder,
	SeparatorSpacingSize,
	MessageFlags,
	SectionBuilder,
	ThumbnailBuilder,
} = require('discord.js');

const DISCORD_ASSET_URL = 'https://cdn.discordapp.com/';
const ORB_URL =
	'https://cdn.discordapp.com/assets/content/fb761d9c206f93cd8c4e7301798abe3f623039a4054f2e7accd019e1bb059fc8.webm?format=webp';

async function buildQuestNotification(container, quest, role) {
	const { kythiaConfig, helpers, t } = container;
	const { convertColor } = helpers.color;

	const { config } = quest;
	const accentColor = convertColor(kythiaConfig.bot.color, {
		from: 'hex',
		to: 'decimal',
	});
	const fakeInteraction = { client: container.client };

	const title = await t(fakeInteraction, 'quest.helper.title_md', {
		questName: config.messages.quest_name,
	});
	const gameTitle = config.messages.game_title;
	const gamePublisher = config.messages.game_publisher;

	const bannerUrl = `${DISCORD_ASSET_URL}${config.assets.hero}`;

	const reward = config.rewards_config.rewards[0];
	const rewardName = reward.messages.name;

	const ctaLink = `https://discord.com/quests/${config.id}`;

	function formatDuration(seconds) {
		if (seconds === 0) return '0 sec';
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		if (mins > 0 && secs > 0) {
			return `${mins} min ${secs} sec`;
		}
		if (mins > 0) {
			return `${mins} min`;
		}
		return `${secs} sec`;
	}
	const tasks = Object.values(config.task_config_v2.tasks);

	const taskList = tasks
		.map((task) => {
			let platform = task.type.replace(/_/g, ' ').toLowerCase();
			platform = platform.charAt(0).toUpperCase() + platform.slice(1);

			const durationStr = formatDuration(task.target);

			return `- ${platform} for ${durationStr}`;
		})
		.join(`\n`);

	const containerBuilder = new ContainerBuilder().setAccentColor(accentColor);

	containerBuilder.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(title),
	);

	containerBuilder.addMediaGalleryComponents(
		new MediaGalleryBuilder().addItems([
			new MediaGalleryItemBuilder().setURL(bannerUrl),
		]),
	);

	containerBuilder.addSeparatorComponents(
		new SeparatorBuilder()
			.setSpacing(SeparatorSpacingSize.Small)
			.setDivider(true),
	);

	const infoLines = [];
	infoLines.push(await t(fakeInteraction, 'quest.helper.info_header'));

	if (config.starts_at && config.expires_at) {
		const startDate = new Date(config.starts_at).toLocaleDateString('en-US');
		const endDate = new Date(config.expires_at).toLocaleDateString('en-US');
		infoLines.push(
			await t(fakeInteraction, 'quest.helper.info_duration', {
				startDate,
				endDate,
			}),
		);
	}

	infoLines.push(await t(fakeInteraction, 'quest.helper.info_platforms'));

	if (gameTitle) {
		const publisherStr = gamePublisher ? `(${gamePublisher})` : '';
		infoLines.push(
			await t(fakeInteraction, 'quest.helper.info_game', {
				gameTitle,
				gamePublisher: publisherStr,
			}),
		);
	}

	const appName = config.application?.name;
	const applicationId = config.application?.id;
	if (appName && applicationId) {
		infoLines.push(
			await t(fakeInteraction, 'quest.helper.info_application', {
				appName,
				applicationId,
			}),
		);
	}

	let featuresStr = 'NONE';
	if (config.features && config.features.length > 0) {
		featuresStr = config.features.join(', ');
	}
	infoLines.push(
		await t(fakeInteraction, 'quest.helper.info_features', {
			features: featuresStr,
		}),
	);

	containerBuilder.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(infoLines.join('\n')),
	);

	containerBuilder.addSeparatorComponents(
		new SeparatorBuilder()
			.setSpacing(SeparatorSpacingSize.Small)
			.setDivider(true),
	);

	const tasksLines = [];
	tasksLines.push(await t(fakeInteraction, 'quest.helper.tasks_header'));
	tasksLines.push(
		await t(fakeInteraction, 'quest.helper.tasks_item', { taskList }),
	);

	containerBuilder.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(tasksLines.join('\n')),
	);

	containerBuilder.addSeparatorComponents(
		new SeparatorBuilder()
			.setSpacing(SeparatorSpacingSize.Small)
			.setDivider(true),
	);

	const skuId = reward.sku_id;
	const questId = config.id;
	const rewardsLines = [];

	rewardsLines.push(await t(fakeInteraction, 'quest.helper.rewards_header'));

	if (rewardName) {
		rewardsLines.push(
			await t(fakeInteraction, 'quest.helper.rewards_type', { rewardName }),
		);
	}

	if (skuId) {
		rewardsLines.push(
			await t(fakeInteraction, 'quest.helper.rewards_sku', { skuId }),
		);
	}

	if (rewardName) {
		rewardsLines.push(
			await t(fakeInteraction, 'quest.helper.rewards_name', { rewardName }),
		);
	}

	rewardsLines.push('');
	if (questId) {
		rewardsLines.push(
			await t(fakeInteraction, 'quest.helper.rewards_quest_id', { questId }),
		);
	}

	if (role) {
		rewardsLines.push(
			await t(fakeInteraction, 'quest.helper.notify_md', { role }),
		);
	}

	let finalRewardUrl = null;
	if (reward.orb_quantity && reward.orb_quantity > 0) {
		finalRewardUrl = ORB_URL;
	} else if (reward.asset) {
		finalRewardUrl = `${DISCORD_ASSET_URL}${reward.asset}`;
		if (finalRewardUrl.endsWith('.mp4')) {
			finalRewardUrl += '?format=webp';
		}
	}

	containerBuilder.addSectionComponents(
		new SectionBuilder()
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(rewardsLines.join('\n')),
			)
			.setThumbnailAccessory(
				finalRewardUrl
					? new ThumbnailBuilder()
							.setURL(finalRewardUrl)
							.setDescription(rewardName || 'Reward')
					: new ThumbnailBuilder()
							.setURL(
								'https://i.imgur.com/qFmcbT0_d.webp?maxwidth=760&fidelity=grand',
							)
							.setDescription(rewardName || 'Reward'),
			),
	);

	containerBuilder.addSeparatorComponents(
		new SeparatorBuilder()
			.setSpacing(SeparatorSpacingSize.Small)
			.setDivider(true),
	);

	if (ctaLink) {
		containerBuilder.addActionRowComponents(
			new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setLabel(await t(fakeInteraction, 'quest.ui.view'))
					.setStyle(ButtonStyle.Link)
					.setURL(ctaLink)
					.setEmoji('🌸'),
			),
		);
	}

	containerBuilder.addSeparatorComponents(
		new SeparatorBuilder()
			.setSpacing(SeparatorSpacingSize.Small)
			.setDivider(true),
	);

	containerBuilder.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			await t(fakeInteraction, 'common.container.footer', {
				username: kythiaConfig.bot.name,
			}),
		),
	);

	return {
		components: [containerBuilder],
		flags: MessageFlags.IsComponentsV2,
	};
}

module.exports = {
	buildQuestNotification,
};
