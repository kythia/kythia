/**
 * @namespace: addons/core/helpers/stats.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const path = require('node:path');
const fs = require('node:fs');

function getKythiaCoreVersion() {
	try {
		const corePkgPath = require.resolve('kythia-core/package.json');
		const pkg = JSON.parse(fs.readFileSync(corePkgPath, 'utf8'));
		return pkg.version;
	} catch {
		try {
			const mainPkgPath = path.join(process.cwd(), 'package.json');
			if (fs.existsSync(mainPkgPath)) {
				const mainPkg = JSON.parse(fs.readFileSync(mainPkgPath, 'utf8'));
				return (
					mainPkg.dependencies?.['kythia-core'] ||
					mainPkg.devDependencies?.['kythia-core'] ||
					null
				);
			}
		} catch {}
	}
	return null;
}

function getGitCommitId() {
	if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.substring(0, 7);
	if (process.env.COMMIT_SHA) return process.env.COMMIT_SHA.substring(0, 7);

	try {
		const gitHeadPath = path.join(process.cwd(), '.git', 'HEAD');
		if (fs.existsSync(gitHeadPath)) {
			const head = fs.readFileSync(gitHeadPath, 'utf8').trim();
			if (head.startsWith('ref:')) {
				const refPath = head.split(' ')[1];
				const refFullPath = path.join(process.cwd(), '.git', refPath);
				if (fs.existsSync(refFullPath)) {
					const commit = fs.readFileSync(refFullPath, 'utf8').trim();
					return commit.substring(0, 7);
				}
			} else if (/^[0-9a-f]{40}$/i.test(head)) {
				return head.substring(0, 7);
			}
		}
	} catch (_e) {}
	return undefined;
}

module.exports = {
	getKythiaCoreVersion,
	getGitCommitId,
};
