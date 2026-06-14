const { OverwriteType } = require('discord.js');

/**
 * Build permissionOverwrites array for guild.channels.create,
 * mapping old role IDs to newly created roles via roleMap.
 */
function buildPermOverwrites(overwrites, roleMap) {
	if (!overwrites || overwrites.length === 0) return [];
	return overwrites.map((po) => ({
		id: (po.type === 'role' ? roleMap.get(po.id)?.id : null) ?? po.id,
		type: po.type === 'role' ? OverwriteType.Role : OverwriteType.Member,
		allow: BigInt(po.allow),
		deny: BigInt(po.deny),
	}));
}

/**
 * After channels are created, set special guild channels
 * (system, rules, public updates, AFK) by matching names.
 */
async function restoreSpecialChannels(guild, settings, _channelMap, logger) {
	const findChannelByName = (name) => {
		if (!name) return null;
		return (
			[...guild.channels.cache.values()].find((c) => c.name === name) ?? null
		);
	};

	const updates = {};

	const systemCh = findChannelByName(settings.systemChannelName);
	if (systemCh) updates.systemChannel = systemCh.id;

	const rulesCh = findChannelByName(settings.rulesChannelName);
	if (rulesCh) updates.rulesChannel = rulesCh.id;

	const updatesCh = findChannelByName(settings.publicUpdatesChannelName);
	if (updatesCh) updates.publicUpdatesChannel = updatesCh.id;

	const afkCh = findChannelByName(settings.afkChannelName);
	if (afkCh) updates.afkChannel = afkCh.id;

	if (Object.keys(updates).length > 0) {
		await guild.edit(updates).catch((e) =>
			logger.warn(`Failed to restore special channels: ${e.message}`, {
				label: 'restore',
			}),
		);
	}
}

module.exports = {
	buildPermOverwrites,
	restoreSpecialChannels,
};
