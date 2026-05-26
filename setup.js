#!/usr/bin/env node

/**
 * @file setup.js
 * @description Kythia Interactive Setup Wizard
 *
 * Run with:
 *   node setup.js
 *   bun setup.js
 *   npm run setup
 *
 * @copyright © 2026 kenndeclouv
 */

/** biome-ignore-all lint/suspicious/noConsole: not the bot log, ignore console warn */

const pc = require('picocolors');
const fs = require('node:fs');
const path = require('node:path');
const { closeRL, confirm, success, warn } = require('./setup/prompt');
const { writeFiles } = require('./setup/writer');

// ── Steps ──────────────────────────────────────────────────────────────────
const stepLicense = require('./setup/steps/license');
const stepBot = require('./setup/steps/bot');
const stepDatabase = require('./setup/steps/database');
const stepRedis = require('./setup/steps/redis');
const stepAddons = require('./setup/steps/addons');

const TOTAL_STEPS = 6;

// ── Banner ─────────────────────────────────────────────────────────────────
function printBanner() {
	console.clear();
	console.log('');
	console.log(pc.cyan('  ╔══════════════════════════════════════════════╗'));
	console.log(
		`${pc.cyan('  ║')}${pc.bold(pc.white('     🌸  Kythia Interactive Setup Wizard      '))}${pc.cyan('║')}`,
	);
	console.log(pc.cyan('  ╠══════════════════════════════════════════════╣'));
	console.log(
		`${pc.cyan('  ║')}${pc.dim('  This wizard will generate your .env and      ')}${pc.cyan('║')}`,
	);
	console.log(
		`${pc.cyan('  ║')}${pc.dim('  kythia.config.js configuration files.        ')}${pc.cyan('║')}`,
	);
	console.log(
		`${pc.cyan('  ║')}${pc.dim('  Existing files will be backed up first.      ')}${pc.cyan('║')}`,
	);
	console.log(pc.cyan('  ╚══════════════════════════════════════════════╝'));
	console.log('');
	console.log(
		`${pc.dim('  Press')} ${pc.bold('Ctrl+C')}${pc.dim(' at any time to exit.')}`,
	);
	console.log('');
}

// ── Review Summary ─────────────────────────────────────────────────────────
function printReview(answers) {
	const { license, bot, db, redis, addons } = answers;

	console.log('');
	console.log(
		`${pc.bgGreen(pc.black(` Step ${TOTAL_STEPS} / ${TOTAL_STEPS} `))} ${pc.bold(pc.white('✅ Review & Generate'))}`,
	);
	console.log(pc.dim(`  ${'─'.repeat(50)}`));

	const row = (label, value) =>
		console.log(
			`  ${pc.bold(pc.dim(label.padEnd(24)))} ${pc.white(value ?? pc.dim('(empty)'))}`,
		);

	row('License Key', license.licenseKey ? `${'●'.repeat(8)}...` : '(not set)');
	row('Accept TOS', license.acceptTOS ? pc.green('Yes') : pc.red('No'));
	row(
		'Data Collection',
		license.dataCollection ? pc.green('Yes') : pc.yellow('No'),
	);
	console.log('');
	row('Bot Name', bot.botName);
	row('Owner ID', bot.ownerIds);
	row('Bot Token', bot.token ? `${'●'.repeat(8)}...` : pc.red('MISSING'));
	row('Client ID', bot.clientId || pc.red('MISSING'));
	row('Color', bot.color);
	row('Timezone', bot.timezone);
	console.log('');
	row('Database', db.driver);
	row(
		'Redis',
		redis.useRedis !== false ? redis.redisUrls : pc.yellow('Disabled'),
	);
	console.log('');

	// Addon summary
	const enabledAddons = Object.entries(addons)
		.filter(([, v]) => v?.enabled)
		.map(([k]) => k);
	const disabledAddons = Object.entries(addons)
		.filter(([, v]) => !v?.enabled)
		.map(([k]) => k);

	row(
		'Enabled Addons',
		enabledAddons.length
			? pc.green(enabledAddons.join(', '))
			: pc.dim('(none)'),
	);
	row(
		'Disabled Addons',
		disabledAddons.length
			? pc.dim(disabledAddons.join(', '))
			: pc.dim('(none)'),
	);
	console.log('');
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
	printBanner();

	// Check if config files already exist
	const root = process.cwd();
	const hasEnv = fs.existsSync(path.join(root, '.env'));
	const hasConfig = fs.existsSync(path.join(root, 'kythia.config.js'));

	if (hasEnv || hasConfig) {
		warn('Existing configuration files detected:');
		if (hasEnv) console.log(pc.dim('    • .env'));
		if (hasConfig) console.log(pc.dim('    • kythia.config.js'));
		console.log('');
		const proceed = await confirm(
			'These will be backed up to .env.backup / kythia.config.js.backup before overwriting. Continue?',
			true,
		);
		if (!proceed) {
			console.log(pc.yellow('\n  Setup cancelled.\n'));
			closeRL();
			process.exit(0);
		}
	}

	// ── Run steps ────────────────────────────────────────────────────────
	const license = await stepLicense(TOTAL_STEPS);
	const bot = await stepBot(TOTAL_STEPS);
	const db = await stepDatabase(TOTAL_STEPS);
	const redis = await stepRedis(TOTAL_STEPS);
	const addons = await stepAddons(TOTAL_STEPS);

	const answers = { license, bot, db, redis, addons };

	// Review
	printReview(answers);

	const go = await confirm('Generate configuration files?', true);

	if (!go) {
		console.log(pc.yellow('\n  Setup cancelled — no files were written.\n'));
		closeRL();
		process.exit(0);
	}

	closeRL();

	// Write files
	try {
		const { envPath, configPath, envBackup, configBackup } =
			writeFiles(answers);

		console.log('');
		console.log(pc.bgGreen(pc.black(' SUCCESS ')));
		console.log('');
		success(`Written: ${pc.bold(envPath)}`);
		success(`Written: ${pc.bold(configPath)}`);

		if (fs.existsSync(envBackup)) {
			console.log(pc.dim(`  📦 Backup: ${envBackup}`));
		}
		if (fs.existsSync(configBackup)) {
			console.log(pc.dim(`  📦 Backup: ${configBackup}`));
		}

		console.log('');
		console.log(pc.bold('  🚀 Next steps:'));
		console.log(pc.dim('     1. Review your .env and kythia.config.js'));
		console.log(pc.dim('     2. Run migrations if needed'));
		console.log(pc.dim('     3. Start the bot:'));
		console.log(
			`${pc.cyan('        npm start')}${pc.dim('   or   ')}${pc.cyan('bun start')}`,
		);
		console.log('');
	} catch (err) {
		console.log('');
		console.log(pc.red(`  ❌ Error writing files: ${err.message}`));
		console.log(pc.dim('     Your original files were not modified.'));
		process.exit(1);
	}
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
	closeRL();
	console.log(pc.yellow('\n\n  Setup interrupted. No files were written.\n'));
	process.exit(0);
});

main().catch((err) => {
	closeRL();
	console.error(pc.red(`\n  Fatal error: ${err.message}\n`));
	process.exit(1);
});
