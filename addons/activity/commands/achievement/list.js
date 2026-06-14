/**
 * @namespace: addons/activity/commands/achievement/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
// space 1 line
// discord.js import on top of another import
// Sorting from shortest letter to longest letter
const {
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
// space 1 line
// kythia core import after discord.js import
const { BaseCommand } = require('kythia-core');
// space 1 line
// addons import after kythia core import
const achievementDefs = require('../../helpers/achievements');
const achievementuiHelper = require('../../helpers/achievement-ui');
// space 1 line
class ListCommand extends BaseCommand {
	// all command property before slashCommand

	// must (subcommand) on subcommand case, dont (sub) or (subcmd) etc..
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('list')
			.setDescription('📋 Browse achievements by category.')
			// must (option) dont (opt) or (op) etc..
			.addStringOption((option) =>
				option
					.setName('category')
					.setDescription('Filter by category.')
					.setRequired(false)
					.addChoices(
						{
							name: '💬 Messages (All-Time)',
							value: 'messages',
						},
						{
							name: '📅 Messages (Daily)',
							value: 'messages_daily',
						},
						{
							name: '📆 Messages (Weekly)',
							value: 'messages_weekly',
						},
						{
							name: '🎙️ Voice Hours',
							value: 'voice',
						},
						{
							name: '🔔 Voice Joins',
							value: 'voice_joins',
						},
						{
							name: '😄 Reactions',
							value: 'reactions',
						},
						{
							name: '📅 Server Age',
							value: 'server_age',
						},
						{
							name: '🏅 Collectors',
							value: 'collector',
						},
						{
							name: '⭐ Special',
							value: 'special',
						},
					),
			)
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to check. Defaults to yourself.'),
			);
	// space 1 line
	async execute(interaction) {
		// must const container = this.container before use it on file
		const container = this.container;
		// extract only what you need from container with this style
		const { t, models, kythiaConfig, helpers } = container;
		// then models destructure if any
		const { UserAchievement } = models;
		// then helpers destructure if any, or kythiaConfig destructure if any, etc..
		const { convertColor } = helpers.color;
		// space 1 line
		// add deferReply when doing some DB query or something else
		await interaction.deferReply();
		// space 1 line
		// get the command input with const declaration, then assign value
		const targetUser = interaction.options.getUser('user') || interaction.user;
		const categoryFilter = interaction.options.getString('category');
		// then guildId or userId or something else with const declaration
		const guildId = interaction.guild.id;
		const userId = targetUser.id;

		// database query, MUST use custom cache function, dont use findOne/findAll/findByPk
		// instead use getCache/getAllCache read <this project>/docs/core/MODEL_USAGE.md
		const unlockedRows = await UserAchievement.getAllCache({
			where: {
				guildId,
				userId,
			},
			attributes: ['achievementId'],
			raw: true,
		});

		const unlockedSet = new Set(unlockedRows.map((r) => r.achievementId));

		// Build category list
		const categories = categoryFilter
			? [[categoryFilter, achievementDefs[categoryFilter] ?? []]]
			: Object.entries(achievementDefs);

		const lines = [];

		for (const [catKey, achievements] of categories) {
			if (!achievements || achievements.length === 0) continue;
			const label = achievementuiHelper.CATEGORY_LABELS[catKey] ?? catKey;
			lines.push(`### ${label}`);
			for (const a of achievements) {
				const unlocked = unlockedSet.has(a.id);
				const rarityEmoji = achievementuiHelper.RARITY_EMOJI[a.rarity] ?? '⚪';
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
		// always use t for translation for command string in the command files
		// and put the translation in the addon lang/en-US.json file
		const header = await t(interaction, 'activity.achievement.list.header', {
			username: targetUser.username,
			unlockedCount,
			totalCount,
		});

		// using containerbuilder
		const listContainer = new ContainerBuilder()
			// always use convert color helper if need to convert color for the components v2
			.setAccentColor(
				convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
			)
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(header))
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					lines.join('\n').slice(0, 3800) ||
						(await t(interaction, 'activity.achievement.list.empty')),
				),
			);

		// edit reply cuz we use deferReply at the beginning
		await interaction.editReply({
			// must on array for components v2 []
			components: [listContainer],
			// flags is mandatory for Components V2
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
// space 1 line
// export at the end of the file
exports.default = ListCommand;
