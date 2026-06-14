/**
 * @namespace: addons/autoreply/commands/remove.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { Op } = require('sequelize');

const { BaseCommand } = require('kythia-core');

class RemoveCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) => {
		return subcommand
			.setName('remove')
			.setDescription('➖ Remove an auto-reply.')
			.addStringOption((option) =>
				option
					.setName('trigger')
					.setDescription('The trigger content to remove.')
					.setRequired(true)
					.setAutocomplete(true),
			);
	};

	async autocomplete(interaction) {
		const container = this.container;
		const { models } = container;
		const { AutoReply } = models;
		const focusedValue = interaction.options.getFocused();

		const choices = await AutoReply.getAllCache({
			where: {
				guildId: interaction.guild.id,
				trigger: { [Op.like]: `%${focusedValue}%` },
			},
			limit: 25,
		});

		await interaction.respond(
			choices.map((choice) => ({
				name:
					choice.trigger.length > 100
						? choice.trigger.slice(0, 100)
						: choice.trigger,
				value: `id:${choice.id}`,
			})),
		);
	}

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { AutoReply } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const triggerInput = interaction.options.getString('trigger');
		let deleted = 0;

		if (triggerInput.startsWith('id:')) {
			const id = triggerInput.split(':')[1];
			const trigger = await AutoReply.getCache({
				where: {
					guildId: interaction.guild.id,
					id: id,
				},
			});
			trigger.destroy();
			deleted = 1;
		} else {
			const trigger = await AutoReply.getCache({
				where: {
					guildId: interaction.guild.id,
					trigger: triggerInput,
				},
			});
			trigger.destroy();
			deleted = 1;
		}

		if (!deleted) {
			const msg = await t(interaction, 'autoreply.remove.error.not_found');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const msg = await t(interaction, 'autoreply.remove.success.plain', {
			trigger: triggerInput,
		});
		const components = await simpleContainer(interaction, msg, {
			color: 'Red',
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = RemoveCommand;
