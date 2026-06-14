const CAPTCHA_TYPES = [
	{ name: 'Math (multiple choice buttons)', value: 'math' },
	{ name: 'Emoji click (buttons)', value: 'emoji' },
	{ name: 'Image text (type the code)', value: 'image' },
];

const MAX_RECENT_LOGS = 10;

module.exports = {
	CAPTCHA_TYPES,
	MAX_RECENT_LOGS,
};
