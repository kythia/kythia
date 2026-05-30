/**
 * @namespace: addons/api/helpers/settings.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const path = require('node:path');
const fs = require('node:fs');

function getAvailableLanguages() {
	const langDir = path.join(__dirname, '../../core/lang');
	let availableLanguages = [];

	try {
		const files = fs.readdirSync(langDir);
		availableLanguages = files
			.filter((file) => file.endsWith('.json'))
			.map((file) => {
				const langCode = path.basename(file, '.json');
				try {
					const langData = JSON.parse(
						fs.readFileSync(path.join(langDir, file), 'utf8'),
					);
					return {
						name: langData.languageName || langCode,
						value: langCode,
					};
				} catch {
					return {
						name: langCode,
						value: langCode,
					};
				}
			});
	} catch (_e) {
		availableLanguages = [{ name: 'English', value: 'en' }];
	}

	return availableLanguages;
}

function getFeatureToggles(settings) {
	return {
		antiInviteOn: settings.antiInviteOn || false,
		antiLinkOn: settings.antiLinkOn || false,
		antiSpamOn: settings.antiSpamOn || false,
		antiBadwordOn: settings.antiBadwordOn || false,
		antiMentionOn: settings.antiMentionOn || false,
		serverStatsOn: settings.serverStatsOn || false,
		levelingOn: settings.levelingOn || false,
		welcomeInOn: settings.welcomeInOn || false,
		welcomeOutOn: settings.welcomeOutOn || false,
		adventureOn: settings.adventureOn || false,
		streakOn: settings.streakOn || false,
		minecraftStatsOn: settings.minecraftStatsOn || false,
		invitesOn: settings.invitesOn || false,
	};
}

function getServerStats(guild, settings) {
	return {
		memberCount: guild.memberCount,
		channelCount: guild.channels.cache.size,
		roleCount: guild.roles.cache.size,
		enabledFeatures: Object.values(getFeatureToggles(settings)).filter(Boolean)
			.length,
		totalFeatures: Object.keys(getFeatureToggles(settings)).length,
		language: settings.lang || 'en',
		hasWelcome: !!(settings.welcomeInChannelId || settings.welcomeOutChannelId),
		hasLeveling: !!settings.levelingChannelId,
		hasStats: !!(settings.serverStats && settings.serverStats.length > 0),
	};
}

function isValidUrl(url) {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

function formatCooldown(seconds) {
	if (seconds < 60) {
		return `${seconds} seconds`;
	} else if (seconds < 3600) {
		return `${Math.floor(seconds / 60)} minutes`;
	} else if (seconds < 86400) {
		return `${Math.floor(seconds / 3600)} hours`;
	} else {
		return `${Math.floor(seconds / 86400)} days`;
	}
}

module.exports = {
	getAvailableLanguages,
	getFeatureToggles,
	getServerStats,
	isValidUrl,
	formatCooldown,
};
