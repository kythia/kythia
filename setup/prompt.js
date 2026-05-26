/**
 * @file setup/prompt.js
 * @description Shared prompt utilities using Node.js readline (no external deps)
 * @copyright © 2026 kenndeclouv
 */

/** biome-ignore-all lint/suspicious/noConsole: not the bot log, ignore console warn */
const readline = require('node:readline');
const pc = require('picocolors');

let rl;

function getRL() {
	if (!rl) {
		rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});
	}
	return rl;
}

function closeRL() {
	if (rl) {
		rl.close();
		rl = null;
	}
}

/**
 * Prompt user for a value
 * @param {string} label
 * @param {string} [defaultValue='']
 * @param {boolean} [secret=false] - hide input (no echo)
 * @returns {Promise<string>}
 */
function ask(label, defaultValue = '', secret = false) {
	return new Promise((resolve) => {
		const def = defaultValue ? pc.dim(` (${defaultValue})`) : '';
		const prefix = pc.cyan('  ❯ ');
		const prompt = `${prefix}${pc.bold(label)}${def}: `;

		if (secret) {
			// Close the shared RL first — having two readline interfaces on the
			// same stdin at once causes keystrokes to be consumed by the wrong one.
			closeRL();

			process.stdout.write(prompt);

			// Use a muted-output readline so keypresses are never echoed.
			// Works in both Node.js and Bun; no raw-mode shenanigans needed.
			const { Writable } = require('node:stream');
			const muted = new Writable({
				write(_chunk, _enc, cb) {
					cb();
				},
			});
			const secretRL = readline.createInterface({
				input: process.stdin,
				output: muted,
				terminal: true,
			});

			secretRL.question('', (answer) => {
				secretRL.close();
				process.stdout.write('\n');
				resolve(answer.trim() || defaultValue);
			});
			return;
		}

		getRL().question(prompt, (answer) => {
			resolve(answer.trim() || defaultValue);
		});
	});
}

/**
 * Yes/No confirmation prompt
 * @param {string} label
 * @param {boolean} [defaultValue=true]
 * @returns {Promise<boolean>}
 */
function confirm(label, defaultValue = true) {
	return new Promise((resolve) => {
		const hint = defaultValue ? pc.dim('Y/n') : pc.dim('y/N');
		const prefix = pc.cyan('  ❯ ');
		const prompt = `${prefix}${pc.bold(label)} ${hint}: `;
		getRL().question(prompt, (answer) => {
			const a = answer.trim().toLowerCase();
			if (a === '') resolve(defaultValue);
			else resolve(a === 'y' || a === 'yes');
		});
	});
}

/**
 * Select from a list of choices
 * @param {string} label
 * @param {Array<{label: string, value: string}>} choices
 * @param {string} defaultValue
 * @returns {Promise<string>}
 */
function select(label, choices, defaultValue) {
	return new Promise((resolve) => {
		const prefix = pc.cyan('  ❯ ');
		console.log(`${prefix}${pc.bold(label)}:`);
		choices.forEach((c, i) => {
			const marker = c.value === defaultValue ? pc.green('●') : pc.dim('○');
			console.log(`     ${marker}  ${pc.dim(`${i + 1})`)} ${c.label}`);
		});
		getRL().question(
			`${pc.dim('  Enter number')} ${pc.dim(`(default: ${choices.findIndex((c) => c.value === defaultValue) + 1})`)}: `,
			(answer) => {
				const num = parseInt(answer.trim(), 10);
				if (!Number.isNaN(num) && num >= 1 && num <= choices.length) {
					resolve(choices[num - 1].value);
				} else {
					resolve(defaultValue);
				}
			},
		);
	});
}

/**
 * Print a step header
 */
function header(step, title) {
	console.log('');
	console.log(
		`${pc.bgCyan(pc.black(` ${step} `))} ${pc.bold(pc.white(title))}`,
	);
	console.log(pc.dim('  ─'.repeat(30)));
}

/**
 * Print a hint / info line
 */
function hint(msg) {
	console.log(pc.dim(`  💡 ${msg}`));
}

/**
 * Print a warning line
 */
function warn(msg) {
	console.log(pc.yellow(`  ⚠️  ${msg}`));
}

/**
 * Print a success line
 */
function success(msg) {
	console.log(pc.green(`  ✅ ${msg}`));
}

module.exports = { ask, confirm, select, header, hint, warn, success, closeRL };
