/**
 * @namespace: addons/core/commands/tools/ascii.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const figlet = require('figlet');

const figletFonts = [
    ...new Set([
        '1Row',
        '3-D',
        '3D Diagonal',
        '3D-ASCII',
        '3x5',
        '4Max',
        '5 Line Oblique',
        'AMC 3 Line',
        'AMC 3 Liv1',
        'AMC AAA01',
        'AMC Neko',
        'AMC Razor',
        'AMC Razor2',
        'AMC Slash',
        'AMC Slider',
        'AMC Thin',
        'AMC Tubes',
        'AMC Untitled',
        'ANSI Regular',
        'ANSI Shadow',
        'ASCII New Roman',
        'Acrobatic',
        'Alligator',
        'Alligator2',
        'Alpha',
        'Alphabet',
        'Arrows',
        'Avatar',
        'B1FF',
        'Banner',
        'Banner3-D',
        'Banner3',
        'Banner4',
        'Barbwire',
        'Basic',
        'Bear',
        'Bell',
        'Benjamin',
        'Big Chief',
        'Big Money-ne',
        'Big Money-nw',
        'Big Money-se',
        'Big Money-sw',
        'Big',
        'Bigfig',
        'Binary',
        'Block',
        'Blocks',
        'Bloody',
        'Bolger',
        'Braced',
        'Bright',
        'Broadway KB',
        'Broadway',
        'Bubble',
        'Bulbhead',
        'Caligraphy',
        'Caligraphy2',
        'Calvin S',
        'Cards',
        'Catwalk',
        'Chiseled',
        'Chunky',
        'Coinstak',
        'Cola',
        'Colossal',
        'Computer',
        'Contessa',
        'Contrast',
        'Cosmike',
        'Crawford',
        'Crawford2',
        'Crazy',
        'Cricket',
        'Cursive',
        'Cyberlarge',
        'Cybermedium',
        'Cybersmall',
        'Cygnet',
        'DANC4',
        'DOS Rebel',
        'DWhistled',
        'Dancing Font',
        'Decimal',
        'Def Leppard',
        'Delta Corps Priest 1',
        'Diamond',
        'Diet Cola',
        'Digital',
        'Doh',
        'Doom',
        'Dot Matrix',
        'Double Shorts',
        'Double',
        'Dr Pepper',
        'Efti Chess',
        'Efti Font',
        'Efti Italic',
        'Efti Piti',
        'Efti Robot',
        'Efti Wall',
        'Efti Water',
        'Electronic',
        'Elite',
        'Epic',
        'Fender',
        'Filter',
        'Fire Font-k',
        'Fire Font-s',
        'Flipped',
        'Flower Power',
        'Four Tops',
        'Fraktur',
        'Fun Face',
        'Fun Faces',
        'Fuzzy',
        'Georgi16',
        'Georgia11',
        'Ghost',
        'Ghoulish',
        'Glenyn',
        'Goofy',
        'Gothic',
        'Graceful',
        'Gradient',
        'Graffiti',
        'Greek',
        'Heart Left',
        'Heart Right',
        'Henry 3D',
        'Hex',
        'Hieroglyphs',
        'Hollywood',
        'Horizontal Left',
        'Horizontal Right',
        'ICL-1900',
        'Impossible',
        'Invita',
        'Isometric1',
        'Isometric2',
        'Isometric3',
        'Isometric4',
        'Italic',
        'Ivrit',
        'JS Block Letters',
        'JS Bracket Letters',
        'JS Capital Curves',
        'JS Cursive',
        'JS Stick Letters',
        'Jacky',
        'Jazmine',
        'Jerusalem',
        'Katakana',
        'Kban',
        'Keyboard',
        'Knob',
        'Konto Slant',
        'Konto',
        'LCD',
        'Larry 3D 2',
        'Larry 3D',
        'Lean',
        'Letters',
        'Lil Devil',
        'Line Blocks',
        'Linux',
        'Lockergnome',
        'Madrid',
        'Marquee',
        'Maxfour',
        'Merlin1',
        'Merlin2',
        'Mike',
        'Mini',
        'Mirror',
        'Mnemonic',
        'Modular',
        'Morse',
        'Morse2',
        'Moscow',
        'Mshebrew210',
        'Muzzle',
        'NScript',
        'NT Greek',
        'NV Script',
        'Nancyj-Fancy',
        'Nancyj-Improved',
        'Nancyj-Underlined',
        'Nancyj',
        'Nipples',
        'O8',
        'OS2',
        'Octal',
        'Ogre',
        'Old Banner',
        'Pagga',
        "Patorjk's Cheese",
        'Patorjk-HeX',
        'Pawp',
        'Peaks Slant',
        'Peaks',
        'Pebbles',
        'Pepper',
        'Poison',
        'Puffy',
        'Puzzle',
        'Pyramid',
        'Rammstein',
        'Rectangles',
        'Red Phoenix',
        'Relief',
        'Relief2',
        'Reverse',
        'Roman',
        'Rot13',
        'Rotated',
        'Rounded',
        'Rowan Cap',
        'Rozzo',
        'Runic',
        'Runyc',
        'S Blood',
        'SL Script',
        'Santa Clara',
        'Script',
        'Serifcap',
        'Shadow',
        'Shimrod',
        'Short',
        'Slant Relief',
        'Slant',
        'Slide',
        'Small Caps',
        'Small Isometric1',
        'Small Keyboard',
        'Small Poison',
        'Small Script',
        'Small Shadow',
        'Small Slant',
        'Small Tengwar',
        'Small',
        'Soft',
        'Speed',
        'Spliff',
        'Stacey',
        'Stampate',
        'Stampatello',
        'Standard',
        'Star Strips',
        'Star Wars',
        'Stellar',
        'Stforek',
        'Stick Letters',
        'Stop',
        'Straight',
        'Stronger Than All',
        'Sub-Zero',
        'Swamp Land',
        'Swan',
        'Sweet',
        'THIS',
        'Tanja',
        'Tengwar',
        'Term',
        'Test1',
        'The Edge',
        'Thick',
        'Thin',
        'Thorned',
        'Three Point',
        'Ticks Slant',
        'Ticks',
        'Tiles',
        'Tinker-Toy',
        'Tombstone',
        'Train',
        'Trek',
        'Tsalagi',
        'Tubular',
        'Twisted',
        'Two Point',
        'USA Flag',
        'Univers',
        'Varsity',
        'Wavy',
        'Weird',
        'Wet Letter',
        'Whimsy',
        'Wow',
    ]),
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ascii')
        .setDescription('🎨 Generate ASCII art from your text using figlet.')
        .addStringOption((option) => option.setName('text').setDescription('The text to convert to ASCII art').setRequired(true))
        .addStringOption((option) =>
            option
                .setName('font')
                .setDescription('The figlet font to use (eg: Standard, Slant, Larry 3D, etc.)')
                .setRequired(false)
                .setAutocomplete(true)
        )
        .addBooleanOption((option) => option.setName('allfonts').setDescription('Generate ASCII art with ALL fonts').setRequired(false)),
    cooldown: 15,
    voteLocked: true,
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused(true)?.value || '';
        const filteredFonts = figletFonts.filter((font) => font.toLowerCase().includes(focusedValue.toLowerCase()));
        await interaction.respond(filteredFonts.slice(0, 25).map((font) => ({ name: font, value: font })));
    },

    async execute(interaction, container) {
        const { t, kythiaConfig, helpers } = container;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply();

        const text = interaction.options.getString('text');
        const font = interaction.options.getString('font') || 'Standard';
        const allFonts = interaction.options.getBoolean('allfonts') || false;

        if (!text || text.length > 20) {
            return interaction.editReply({ content: await t(interaction, 'core.tools.ascii.invalid.text.allfonts') });
        }

        if (allFonts) {
            await interaction.editReply({
                content: `🎨 Generating ASCII art for "${text}" with ${figletFonts.length} fonts... this might take a moment!`,
            });

            let embedsForCurrentMessage = [];
            let totalCharsInCurrentMessage = 0;
            let isFirstMessage = true;

            for (const f of figletFonts) {
                const data = await new Promise((resolve) => {
                    figlet.text(text, { font: f }, (err, res) => {
                        if (err || !res) return resolve(null);
                        resolve(res);
                    });
                });

                if (data) {
                    const asciiArt = '```' + data + '```';
                    const block = `**${f}**\n${asciiArt}`;

                    if (block.length > 4000) continue;

                    if (embedsForCurrentMessage.length === 10 || totalCharsInCurrentMessage + block.length > 5500) {
                        if (embedsForCurrentMessage.length > 0) {
                            await interaction.followUp({ embeds: embedsForCurrentMessage });
                        }

                        embedsForCurrentMessage = [];
                        totalCharsInCurrentMessage = 0;
                    }

                    const embed = new EmbedBuilder()
                        .setColor(kythiaConfig.bot.color)
                        .setDescription(block)
                        .setFooter(await embedFooter(interaction));

                    embedsForCurrentMessage.push(embed);
                    totalCharsInCurrentMessage += block.length;
                }
            }

            if (embedsForCurrentMessage.length > 0) {
                await interaction.followUp({ embeds: embedsForCurrentMessage });
            }
        } else {
            figlet.text(text, { font }, async (err, data) => {
                if (err || !data) {
                    return interaction.editReply({ content: await t(interaction, 'core.tools.ascii.failed') });
                }
                const asciiArt = '```' + data + '```';

                if (asciiArt.length > 4096) {
                    return interaction.editReply({ content: await t(interaction, 'core.tools.ascii.too.long') });
                }
                const embed = new EmbedBuilder()
                    .setColor(kythiaConfig.bot.color)
                    .setDescription(await t(interaction, 'core.tools.ascii.embed.desc', { asciiArt, font }))
                    .setFooter(await embedFooter(interaction));
                await interaction.editReply({ embeds: [embed] });
            });
        }
    },
};
