/**
 * @namespace: addons/leveling/queues/image.js
 * @type: Queue Processor Definition (Contract File)
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 *
 * @description
 * Queue processor contract for the leveling addon's image generation.
 * Auto-discovered by AddonManager from the `queues/` folder — just like
 * how tasks are auto-loaded from `tasks/`.
 *
 * ## Usage in profile.js command:
 * ```js
 * const job = await container.queueManager.dispatch('kythia-image-queue', 'profile', {
 *   type: 'profileImage',
 *   userId: targetUser.id,
 *   options: { ... }
 * });
 * const result = await container.queueManager.waitFor(job, 'kythia-image-queue');
 * const buffer = Buffer.from(result.data);
 * ```
 */

const path = require('path');

module.exports = {
	queueName: 'kythia-image-queue',
	processorPath: path.join(__dirname, 'processors', 'imageProcessor.js'),
	concurrency: 2,
};
