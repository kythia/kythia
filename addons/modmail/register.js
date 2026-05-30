/**
 * @namespace: addons/modmail/register.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	initialize(bot) {
		const container = bot.client.container;
		const { logger, models } = container;
		const client = bot.client;
		const summary = [];

		// Ensure the modmailActiveDMs Set exists before the first message
		if (!(client.modmailActiveDMs instanceof Set)) {
			client.modmailActiveDMs = new Set();
		}

		// ── Repopulate active sessions from DB on ready ──────────────────────
		// Fixes the restart gap: after a crash/restart, users with open modmails
		// are re-added to modmailActiveDMs so duplicate threads can't be created
		// and the AI addon continues to stay out of their DMs.
		bot.addClientReadyHook(async () => {
			try {
				const { Modmail } = models;
				const openModmails = await Modmail.getAllCache({
					status: 'open',
				}).catch(() => []);

				if (openModmails && openModmails.length > 0) {
					for (const mm of openModmails) {
						client.modmailActiveDMs.add(mm.userId);
					}
					logger.info(
						`Repopulated ${openModmails.length} active session(s) from DB.`,
						{ label: 'modmail' },
					);
				}
			} catch (err) {
				logger.error(
					`Failed to repopulate modmailActiveDMs from DB: ${err.message || err}`,
					{
						label: 'modmail',
					},
				);
			}
		});

		summary.push(
			`  ╰┈➤ Hook: clientReady (repopulate ${'{n}'} active sessions from DB)`,
		);
		return summary;
	},
};
