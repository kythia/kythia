function parseCustomEmoji(str) {
	const match = str.match(/<?a?:?(\w+):(\d+)>?/);
	if (!match) return null;
	const [, name, id] = match;
	const isAnimated = str.startsWith('<a:');
	return { name, id, isAnimated };
}

module.exports = {
	parseCustomEmoji,
};
