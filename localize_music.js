const fs = require('fs');
const path = require('path');

const musicDir =
	'/media/kenndeclouv/Second/Projects/discord/kythia/addons/music';
const langFile = path.join(musicDir, 'lang', 'en-US.json');

const langData = JSON.parse(fs.readFileSync(langFile, 'utf8'));

// Inject new keys
langData.music.helpers.handlers.music =
	langData.music.helpers.handlers.music || {};
langData.music.helpers.handlers.music.lyrics =
	langData.music.helpers.handlers.music.lyrics || {};
langData.music.helpers.handlers.music.lyrics.title_md =
	'## **{artist} - {title}**';

langData.music.helpers.handlers.radio =
	langData.music.helpers.handlers.radio || {};
langData.music.helpers.handlers.radio.search_results_md =
	'## 📻 Search Results: "{query}"';

fs.writeFileSync(langFile, JSON.stringify(langData, null, '\t'), 'utf8');
console.log('Updated music/lang/en-US.json');
