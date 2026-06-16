/**
 * @namespace: addons/server/commands/server/autobuild.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { EMBEDDED, resetServer, runTemplate } = require('../../helpers/server');

const { BaseCommand } = require('kythia-core');

class AutobuildCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('autobuild')
			.setDescription(
				'automatically build server structure from a JSON template',
			)
			.addStringOption((option) =>
				option
					.setName('template')
					.setDescription(
						'template key (e.g. store, gaming, saas, company, tech-community)',
					)
					.setRequired(true)
					.setAutocomplete(true),
			)
			.addBooleanOption((option) =>
				option
					.setName('reset')
					.setDescription('reset server first')
					.setRequired(true),
			)
			.addBooleanOption((option) =>
				option
					.setName('dry_run')
					.setDescription('simulation only')
					.setRequired(false),
			)
			.addBooleanOption((option) =>
				option
					.setName('include_voice')
					.setDescription('include voice category')
					.setRequired(false),
			)
			.addBooleanOption((option) =>
				option
					.setName('private_staff')
					.setDescription('force staff private')
					.setRequired(false),
			)
			.addStringOption((option) =>
				option.setName('locale').setDescription('id/en').setRequired(false),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const templateKey = interaction.options.getString('template');
		const shouldReset = interaction.options.getBoolean('reset');
		const dryRun = interaction.options.getBoolean('dry_run') ?? false;
		const includeVoice =
			interaction.options.getBoolean('include_voice') ?? true;
		const privateStaff =
			interaction.options.getBoolean('private_staff') ?? false;
		const locale = interaction.options.getString('locale') || 'id';

		const tpl = EMBEDDED[templateKey];
		if (!tpl) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'server.server.autobuild.template.not.found_md', {
					key: templateKey,
				}),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (shouldReset && !dryRun) {
			await resetServer(interaction);
		}

		let components = await simpleContainer(
			interaction,
			await t(interaction, 'server.server.autobuild.start_md', {
				template: tpl?.meta?.display ?? templateKey,
				dryRun,
			}),
			{ color: 'Blurple' },
		);
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});

		const tplData = typeof tpl[locale] === 'object' ? tpl[locale] : tpl;

		const opts = { dryRun, includeVoice, privateStaff };
		let stats;
		try {
			stats = await runTemplate(interaction, tplData, opts);
		} catch (err) {
			logger.error(`autobuild error: ${err.message || err}`, {
				label: 'server:autobuild',
			});
			components = await simpleContainer(
				interaction,
				await t(interaction, 'server.server.autobuild.failed_md', {
					error: err.message,
				}),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const desc =
			(await t(interaction, 'server.server.autobuild.done_md', {
				template: tpl?.meta?.display ?? templateKey,
			})) +
			'\n' +
			`${await t(interaction, 'server.server.autobuild.stats', {
				rolesCreated: stats.role.created,
				rolesSkipped: stats.role.skipped,
				catCreated: stats.category.created,
				catSkipped: stats.category.skipped,
				chCreated: stats.channel.created,
				chSkipped: stats.channel.skipped,
				failed: stats.failed,
				dryRun,
			})}`;
		components = await simpleContainer(interaction, desc, { color: 'Green' });
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = AutobuildCommand;
