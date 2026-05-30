/**
 * @namespace: addons/nsfw/helpers/api.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const axios = require('axios');

const getFallbackCategory = (nekobotCategory) => {
	const waifuPicsCategories = ['waifu', 'neko', 'trap', 'blowjob'];
	return waifuPicsCategories.includes(nekobotCategory)
		? nekobotCategory
		: 'waifu';
};

const getNekosLifeCategory = (nekobotCategory) => {
	const nekosLifeCategories = [
		'ngif',
		'hug',
		'gecg',
		'pat',
		'cuddle',
		'meow',
		'tickle',
		'gasm',
		'goose',
		'lewd',
		'v3',
		'spank',
		'feed',
		'slap',
		'wallpaper',
		'neko',
		'lizard',
		'woof',
		'fox_girl',
		'8ball',
		'kiss',
		'avatar',
		'waifu',
		'smug',
	];

	if (nekosLifeCategories.includes(nekobotCategory)) return nekobotCategory;

	const mapping = {
		hentai: 'lewd',
		hneko: 'lewd',
		hkitsune: 'fox_girl',
		kemonomimi: 'fox_girl',
		ass: 'spank',
		boobs: 'lewd',
		hboobs: 'lewd',
	};
	return mapping[nekobotCategory] || 'lewd';
};

const fetchContent = async (category, logger) => {
	try {
		// Attempt 1: NekoBot
		const url = `https://nekobot.xyz/api/image?type=${category}`;
		const res = await axios.get(url, { timeout: 5000 });

		if (res.data?.message) {
			return res.data.message;
		}
		throw new Error('NekoBot response invalid');
	} catch (error) {
		if (logger) {
			logger.warn(`${error.message || error} - Falling back to Waifu.pics...`, {
				label: 'nekobot api error',
			});
		}

		try {
			// Attempt 2: Fallback to Waifu.pics
			const fallbackCategory = getFallbackCategory(category);
			const fallbackUrl = `https://api.waifu.pics/nsfw/${fallbackCategory}`;
			const resFallback = await axios.get(fallbackUrl, { timeout: 5000 });

			if (resFallback.data?.url) {
				return resFallback.data.url;
			}
			throw new Error('Waifu.pics response invalid');
		} catch (fallbackError) {
			if (logger) {
				logger.warn(
					`${fallbackError.message} - Falling back to Nekos.life...`,
					{ label: 'waifu pics api error' },
				);
			}

			try {
				// Attempt 3: Fallback to Nekos.life
				const nekosLifeCategory = getNekosLifeCategory(category);
				const nekosLifeUrl = `https://nekos.life/api/v2/img/${nekosLifeCategory}`;
				const resNekos = await axios.get(nekosLifeUrl, { timeout: 5000 });

				if (resNekos.data?.url) {
					return resNekos.data.url;
				}
				throw new Error('Nekos.life response invalid');
			} catch (nekosError) {
				if (logger) {
					logger.error(`${nekosError.message}`, {
						label: 'nekos life api error',
					});
				}
				return null;
			}
		}
	}
};

module.exports = {
	getFallbackCategory,
	getNekosLifeCategory,
	fetchContent,
};
