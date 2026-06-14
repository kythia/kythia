/**
 * @namespace: addons/pet/commands/admin/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
const uiHelper = require('../../helpers/ui');

// Helpers extracted to addons/pet/helpers/ui.js

class ListCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand.setName('list').setDescription('Show all pets in the system');

	teamOnly = true;
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { simpleContainer } = helpers.discord;
		const { Pet } = models;
		const { generatePetListContainer } = uiHelper;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const allPets = await Pet.getAllCache({
			cacheTags: ['Pet:all'],
		});
		const totalPets = allPets.length;
		let currentPage = 1;
		if (totalPets === 0) {
			const components = await simpleContainer(
				interaction,
				`## ${await t(interaction, 'pet.admin.list.list.empty.title')}\n${await t(interaction, 'pet.admin.list.list.empty.desc')}`,
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const { petListContainer, totalPages } = await generatePetListContainer(
			interaction,
			currentPage,
			allPets,
			totalPets,
		);
		const message = await interaction.editReply({
			components: [petListContainer],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		});
		if (totalPages <= 1) return;
		const collector = message.createMessageComponentCollector({
			time: 300000,
		});
		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					content: await t(i, 'common.pagination.not.your.interaction'),
					flags: MessageFlags.Ephemeral,
				});
			}
			if (i.customId === 'pets_first') {
				currentPage = 1;
			} else if (i.customId === 'pets_prev') {
				currentPage = Math.max(1, currentPage - 1);
			} else if (i.customId === 'pets_next') {
				currentPage = Math.min(totalPages, currentPage + 1);
			} else if (i.customId === 'pets_last') {
				currentPage = totalPages;
			}
			const { petListContainer: newPetListContainer } =
				await generatePetListContainer(i, currentPage, allPets, totalPets);
			await i.update({
				components: [newPetListContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		});
		collector.on('end', async () => {
			try {
				const { petListContainer: finalContainer } =
					await generatePetListContainer(
						interaction,
						currentPage,
						allPets,
						totalPets,
						true,
					);
				await message.edit({
					components: [finalContainer],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (_e) {}
		});
	}
}

exports.default = ListCommand;
