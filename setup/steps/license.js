/**
 * @file setup/steps/license.js
 * @description Setup Step 1 - License & Legal acceptance
 * @copyright © 2026 kenndeclouv
 */

/** biome-ignore-all lint/suspicious/noConsole: not the bot log, ignore console warn */
const { ask, confirm, header, hint } = require('../prompt');

module.exports = async (totalSteps = 6) => {
	header(`Step 1 / ${totalSteps}`, '🔑 License & Legal');

	hint('Get your license key from: https://dsc.gg/kythia');
	const licenseKey = await ask('License key', '', false);

	console.log('');
	hint('Read the Terms of Service at: https://kythia.xyz/tos');
	const acceptTOS = await confirm('Do you accept the Terms of Service?');
	if (!acceptTOS) {
		console.log('\n❌ You must accept the TOS to use Kythia. Exiting.\n');
		process.exit(1);
	}

	const dataCollection = await confirm(
		'Do you accept anonymous telemetry/data collection?',
	);

	return { licenseKey, acceptTOS, dataCollection };
};
