/**
 * @namespace: addons/economy/commands/job/apply.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	MessageFlags,
	ActionRowBuilder,
	StringSelectMenuBuilder,
} = require('discord.js');
const jobs = require('../../helpers/jobs');
const { BaseCommand } = require('kythia-core');
class ApplyCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('apply')
			.setDescription(
				'\u200DApply for a specific profession to focus your work.',
			);
	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer, createContainer } = helpers.discord;
		await interaction.deferReply();
		const user = await KythiaUser.getCache({
			userId: interaction.user.id,
		});
		if (!user) {
			const msg = await t(interaction, 'economy.withdraw.no.account.desc');
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const allJobs = [];
		for (const tierKey of Object.keys(jobs)) {
			const tier = jobs[tierKey];
			for (const job of tier.jobs) {
				allJobs.push({
					id: job.nameKey,
					nameKey: job.nameKey,
					emoji: job.emoji,
					requiredItem: tier.requiredItem,
				});
			}
		}
		const options = await Promise.all(
			allJobs.slice(0, 25).map(async (job) => {
				const name = await t(interaction, job.nameKey);
				return {
					label: name,
					description: job.requiredItem
						? `Requires: ${Array.isArray(job.requiredItem) ? job.requiredItem.join(' / ') : job.requiredItem}`
						: 'No requirements',
					value: job.id,
					emoji: job.emoji,
					default: user.profession === job.id,
				};
			}),
		);
		const row = new ActionRowBuilder().addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('select_profession')
				.setPlaceholder(
					await interaction.client.container.t(
						interaction,
						'economy.ui.ph_profession',
					),
				)
				.addOptions(options),
		);
		const applyContainer = await createContainer(interaction, {
			description: await t(interaction, 'economy.job.apply.prompt.desc'),
			components: [row],
		});
		const message = await interaction.editReply({
			components: applyContainer,
			flags: MessageFlags.IsComponentsV2,
		});
		const filter = (i) => i.user.id === interaction.user.id;
		const collector = message.createMessageComponentCollector({
			filter,
			time: 30000,
		});
		collector.on('collect', async (i) => {
			if (i.customId === 'select_profession') {
				const selectedJobId = i.values[0];
				user.profession = selectedJobId;
				user.changed('profession', true);
				await user.save();
				const msg = await t(i, 'economy.job.apply.success.desc');
				const components = await simpleContainer(i, msg, {
					color: 'Green',
				});
				await i.update({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		});
		collector.on('end', async (collected) => {
			if (collected.size === 0) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'economy.job.apply.timeout.desc'),
					{
						color: kythiaConfig.bot.color,
					},
				);
				await interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		});
	}
}
exports.default = ApplyCommand;
