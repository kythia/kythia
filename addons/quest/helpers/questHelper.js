/**
 * @namespace: addons/quest/helpers/questHelper.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
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
    const accentColor = convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' });
    const fakeInteraction = { client: container.client };

    const title = `## \`🎁\` ${config.messages.quest_name}`;
    const gameTitle = config.messages.game_title;
    const gamePublisher = config.messages.game_publisher;

    const bannerUrl = `${DISCORD_ASSET_URL}${config.assets.hero}`;

    const reward = config.rewards_config.rewards[0];
    const rewardName = reward.messages.name;
    let rewardAssetUrl = null;

    if (reward.orb_quantity && reward.orb_quantity > 0) {
        rewardAssetUrl = ORB_URL;
    } else if (reward.asset && !reward.asset.endsWith('.mp4')) {
        rewardAssetUrl = `${DISCORD_ASSET_URL}${reward.asset}`;
    }
    const ctaLink = `https://discord.com/quests/${config.id}`;

    const expiresTimestamp = Math.floor(new Date(config.expires_at).getTime() / 1000);

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

    containerBuilder.addTextDisplayComponents(new TextDisplayBuilder().setContent(title));
    
    containerBuilder.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

    containerBuilder.addMediaGalleryComponents(new MediaGalleryBuilder().addItems([new MediaGalleryItemBuilder().setURL(bannerUrl)]));

    containerBuilder.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

    containerBuilder.addSectionComponents(
        new SectionBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `### Reward: \n${rewardName}\n` +
                        `### Tasks: \n${taskList}\n` +
                        `### Game: \n${gameTitle}\n` +
                        `### Publisher: \n${gamePublisher}\n` +
                        `### Expires: \n<t:${expiresTimestamp}:f> (<t:${expiresTimestamp}:R>)\n` +
                        `${role ? `### Notify: \n${role}\n` : ''}`
                )
            )
            .setThumbnailAccessory(
                rewardAssetUrl
                    ? new ThumbnailBuilder().setURL(rewardAssetUrl).setDescription(rewardName)
                    : new ThumbnailBuilder()
                          .setURL(`https://i.imgur.com/qFmcbT0_d.webp?maxwidth=760&fidelity=grand`)
                          .setDescription(rewardName)
            )
    );

    containerBuilder.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

    if (ctaLink) {
        containerBuilder.addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel('View Quest').setStyle(ButtonStyle.Link).setURL(ctaLink).setEmoji('🌸')
            )
        );
    }

    containerBuilder.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

    containerBuilder.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(await t(fakeInteraction, 'common.container.footer', { username: kythiaConfig.bot.name }))
    );

    return {
        components: [containerBuilder],
        flags: MessageFlags.IsComponentsV2,
    };
}

module.exports = {
    buildQuestNotification,
};
