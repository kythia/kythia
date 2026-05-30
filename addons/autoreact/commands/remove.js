/**
 * @namespace: addons/autoreact/commands/remove.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Op } = require('sequelize');
const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) => {
		return subcommand
			.setName('remove')
			.setDescription('➖ Remove an auto-reaction.')
			.addStringOption((option) =>
				option
					.setName('trigger')
					.setDescription('The trigger to remove')
					.setRequired(true)
					.setAutocomplete(true),
			);
	},

	async autocomplete(interaction, container) {
		const { models } = container;
		const { AutoReact } = models;
		const focusedValue = interaction.options.getFocused();

		const choices = await AutoReact.getAllCache({
			where: {
				guildId: interaction.guild.id,
				[Op.or]: [{ trigger: { [Op.like]: `%${focusedValue}%` } }],
			},
			limit: 25,
		});

		await interaction.respond(
			choices.map((choice) => {
				let display = choice.trigger;
				if (choice.type === 'channel') {
					const channel = interaction.guild.channels.cache.get(choice.trigger);
					display = channel
						? `#${channel.name}`
						: `Deleted Channel (${choice.trigger})`;
				}

				const finalName = `${choice.emoji} ${display} (${choice.type})`;
				return {
					name: finalName.length > 100 ? finalName.slice(0, 100) : finalName,
					value: `id:${choice.id}`,
				};
			}),
		);
	},

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, helpers } = container;
		const { AutoReact } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const triggerInput = interaction.options.getString('trigger');
		let deleted = 0;

		if (triggerInput.startsWith('id:')) {
			const id = triggerInput.split(':')[1];
			const trigger = await AutoReact.getCache({
				where: {
					guildId: interaction.guild.id,
					id: id,
				},
			});
			if (trigger) {
				await trigger.destroy();
				deleted = 1;
			}
		} else {
			const trigger = await AutoReact.getCache({
				where: {
					guildId: interaction.guild.id,
					trigger: triggerInput,
				},
			});
			if (trigger) {
				await trigger.destroy();
				deleted = 1;
			}
		}

		if (!deleted) {
			const msg = await t(interaction, 'autoreact.remove.error.not_found');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const msg = await t(interaction, 'autoreact.remove.success', {
			trigger: triggerInput,
		});
		const components = await simpleContainer(interaction, msg);

		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
