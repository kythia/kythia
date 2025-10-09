module.exports = {
    infile: 'changelog.md',
    types: [
        { type: 'feat', section: '✨ Added' },
        { type: 'fix', section: '🔨 Fixed' },
        { type: 'perf', section: '🔧 Changed' },
        { type: 'refactor', section: '🔧 Changed' },
        { type: 'chore', hidden: true },
        { type: 'docs', hidden: true },
        { type: 'style', hidden: true },
        { type: 'test', hidden: true },
    ],
};
