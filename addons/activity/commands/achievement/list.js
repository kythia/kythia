/**
 * @namespace: addons/activity/commands/achievement/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const achievementDefs = require('../../helpers/achievements');

/** Emoji for each rarity tier */
const RARITY_EMOJI = {
	common: '⚪',
	rare: '🔵',
	epic: '🟣',
	legendary: '🟡',
};

/** Human-readable category labels */
const CATEGORY_LABELS = {
	messages: '💬 Messages (All-Time)',
	messages_daily: '📅 Messages (Daily Record)',
	messages_weekly: '📆 Messages (Weekly Record)',
	voice: '🎙️ Voice Chat (Hours)',
	voice_joins: '🔔 Voice Chat (Joins)',
	reactions: '😄 Reactions',
	server_age: '📅 Server Membership',
	collector: '🏅 Achievement Collector',
	special: '⭐ Special',
};

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('list')
			.setDescription('📋 Browse achievements by category.')
			.addStringOption((option) =>
				option
					.setName('category')
					.setDescription('Filter by category.')
					.setRequired(false)
					.addChoices(
						{ name: '💬 Messages (All-Time)', value: 'messages' },
						{ name: '📅 Messages (Daily)', value: 'messages_daily' },
						{ name: '📆 Messages (Weekly)', value: 'messages_weekly' },
						{ name: '🎙️ Voice Hours', value: 'voice' },
						{ name: '🔔 Voice Joins', value: 'voice_joins' },
						{ name: '😄 Reactions', value: 'reactions' },
						{ name: '📅 Server Age', value: 'server_age' },
						{ name: '🏅 Collectors', value: 'collector' },
						{ name: '⭐ Special', value: 'special' },
					),
			)
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to check. Defaults to yourself.'),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { models, kythiaConfig, helpers } = container;
		const { UserAchievement } = models;
		const { convertColor } = helpers.color;

		await interaction.deferReply();

		const targetUser = interaction.options.getUser('user') || interaction.user;
		const guildId = interaction.guild.id;
		const userId = targetUser.id;
		const categoryFilter = interaction.options.getString('category');

		// Load unlocked achievement IDs for this user
		const unlockedRows = await UserAchievement.getAllCache({
			where: { guildId, userId },
			attributes: ['achievementId'],
			raw: true,
		});
		const unlockedSet = new Set(unlockedRows.map((r) => r.achievementId));

		// Build category list
		const categories = categoryFilter
			? [[categoryFilter, achievementDefs[categoryFilter] ?? []]]
			: Object.entries(achievementDefs);

		const accentColorDecimal = convertColor(
			kythiaConfig.bot.color || '#5865F2',
			{
				from: 'hex',
				to: 'decimal',
			},
		);

		const lines = [];

		for (const [catKey, achievements] of categories) {
			if (!achievements || achievements.length === 0) continue;
			const label = CATEGORY_LABELS[catKey] ?? catKey;
			lines.push(`### ${label}`);

			for (const a of achievements) {
				const unlocked = unlockedSet.has(a.id);
				const rarityEmoji = RARITY_EMOJI[a.rarity] ?? '⚪';
				const status = unlocked ? '✅' : '🔒';
				const localizedName = await container.t(interaction, a.nameKey);
				const localizedDesc = await container.t(interaction, a.descKey);
				lines.push(
					`${status} ${rarityEmoji} **${localizedName}** — ${localizedDesc}`,
				);
			}

			lines.push('');
		}

		// Count summary
		const totalCount = Object.values(achievementDefs).flat().length;
		const unlockedCount = unlockedSet.size;
		const header = `## 📋 Achievements — ${targetUser.username}\n✅ **${unlockedCount}/${totalCount}** unlocked`;

		const listContainer = new ContainerBuilder()
			.setAccentColor(accentColorDecimal)
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(header))
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					lines.join('\n').slice(0, 3800) || '_No achievements found._',
				),
			);

		await interaction.editReply({
			components: [listContainer],
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
