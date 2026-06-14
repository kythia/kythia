const SKIN_API_BASE = 'https://starlightskins.lunareclipse.studio/render';
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,16}$/;
const HOST_REGEX = /^[a-zA-Z0-9._-]+(:\d{1,5})?$/;

// Map each render type → its valid crops (first = default)
const RENDER_TYPES = {
	default: ['full', 'bust', 'face'],
	marching: ['full', 'bust', 'face'],
	walking: ['full', 'bust', 'face'],
	crouching: ['full', 'bust', 'face'],
	crossed: ['full', 'bust', 'face'],
	criss_cross: ['full', 'bust', 'face'],
	ultimate: ['full', 'bust', 'face'],
	isometric: ['full', 'bust', 'face', 'head'],
	head: ['full'],
	custom: ['full', 'bust', 'face'],
	cheering: ['full', 'bust', 'face'],
	relaxing: ['full', 'bust', 'face'],
	trudging: ['full', 'bust', 'face'],
	cowering: ['full', 'bust', 'face'],
	pointing: ['full', 'bust', 'face'],
	lunging: ['full', 'bust', 'face'],
	dungeons: ['full', 'bust', 'face'],
	facepalm: ['full', 'bust', 'face'],
	sleeping: ['full', 'bust'],
	dead: ['full', 'bust', 'face'],
	archer: ['full', 'bust', 'face'],
	kicking: ['full', 'bust', 'face'],
	mojavatar: ['full', 'bust'],
	reading: ['full', 'bust', 'face'],
	high_ground: ['full', 'bust', 'face'],
};

const RENDER_CHOICES_1 = [
	{ name: 'Default', value: 'default' },
	{ name: 'Marching', value: 'marching' },
	{ name: 'Walking', value: 'walking' },
	{ name: 'Crouching', value: 'crouching' },
	{ name: 'Crossed', value: 'crossed' },
	{ name: 'Criss Cross', value: 'criss_cross' },
	{ name: 'Ultimate', value: 'ultimate' },
	{ name: 'Isometric', value: 'isometric' },
	{ name: 'Head', value: 'head' },
	{ name: 'Custom', value: 'custom' },
	{ name: 'Cheering', value: 'cheering' },
	{ name: 'Relaxing', value: 'relaxing' },
	{ name: 'Trudging', value: 'trudging' },
	{ name: 'Cowering', value: 'cowering' },
	{ name: 'Pointing', value: 'pointing' },
	{ name: 'Lunging', value: 'lunging' },
	{ name: 'Dungeons', value: 'dungeons' },
	{ name: 'Facepalm', value: 'facepalm' },
	{ name: 'Sleeping', value: 'sleeping' },
	{ name: 'Dead', value: 'dead' },
	{ name: 'Archer', value: 'archer' },
	{ name: 'Kicking', value: 'kicking' },
	{ name: 'Mojavatar', value: 'mojavatar' },
	{ name: 'Reading', value: 'reading' },
	{ name: 'High Ground', value: 'high_ground' },
];

const CROP_CHOICES = [
	{ name: 'Full Body', value: 'full' },
	{ name: 'Bust', value: 'bust' },
	{ name: 'Face', value: 'face' },
	{ name: 'Head', value: 'head' },
	{ name: 'Default', value: 'default' },
	{ name: 'Processed', value: 'processed' },
	{ name: 'Barebones', value: 'barebones' },
];

const WALLPAPERS = [
	{ name: 'Herobrine Hill', value: 'herobrine_hill' },
	{ name: 'Quick Hide', value: 'quick_hide' },
	{ name: 'Malevolent', value: 'malevolent' },
	{ name: 'Off to the Stars', value: 'off_to_the_stars' },
	{ name: 'Wheat', value: 'wheat' },
];

const MULTI_PLAYER_WALLPAPERS = new Set(['quick_hide']);

module.exports = {
	SKIN_API_BASE,
	USERNAME_REGEX,
	HOST_REGEX,
	RENDER_TYPES,
	RENDER_CHOICES_1,
	CROP_CHOICES,
	WALLPAPERS,
	MULTI_PLAYER_WALLPAPERS,
};
