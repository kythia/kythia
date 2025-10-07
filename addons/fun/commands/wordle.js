/**
 * @namespace: addons/fun/commands/wordle.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ComponentType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require('discord.js');
const { t } = require('@utils/translator');

// ... (WORD_LIST, EMOJI, dan fungsi checkGuess & renderGuessRow tetap sama persis)
const WORD_LIST = kythia.addons.fun.wordle.words;
const EMOJI_CORRECT = '🟩';
const EMOJI_PRESENT = '🟨';
const EMOJI_ABSENT = '⬛';
const games = {};
function pickRandomWord() {
    return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
}
function isValidWord(word) {
    return WORD_LIST.includes(word);
}
function checkGuess(guess, answer) {
    const result = Array(5).fill('absent');
    const answerArr = answer.split('');
    const guessArr = guess.split('');
    const used = Array(5).fill(false);
    for (let i = 0; i < 5; i++) {
        if (guessArr[i] === answerArr[i]) {
            result[i] = 'correct';
            used[i] = true;
        }
    }
    for (let i = 0; i < 5; i++) {
        if (result[i] === 'correct') continue;
        for (let j = 0; j < 5; j++) {
            if (!used[j] && guessArr[i] === answerArr[j]) {
                result[i] = 'present';
                used[j] = true;
                break;
            }
        }
    }
    return result;
}
function renderGuessRow(guess, feedback) {
    let row = '';
    for (let i = 0; i < 5; i++) {
        if (feedback[i] === 'correct') row += EMOJI_CORRECT;
        else if (feedback[i] === 'present') row += EMOJI_PRESENT;
        else row += EMOJI_ABSENT;
    }
    row += '  `' + guess.toUpperCase() + '`';
    return row;
}

// [DIUBAH] Render board sekarang lebih simpel
function renderBoard(guesses, answer) {
    let lines = [];
    for (const guess of guesses) {
        const feedback = checkGuess(guess, answer);
        lines.push(renderGuessRow(guess, feedback));
    }
    // Isi sisa baris yang kosong
    while (lines.length < 6) {
        lines.push(`${EMOJI_ABSENT.repeat(5)}  \`     \``);
    }
    return lines.join('\n');
}

// [BARU] Fungsi untuk membuat embed yang dinamis
async function buildGameEmbed(interaction, game) {
    let description = renderBoard(game.guesses, game.answer);

    if (game.isOver) {
        if (game.win) {
            description += `\n\n${await t(interaction, 'fun_wordle_win', { answer: game.answer.toUpperCase() })}`;
        } else {
            description += `\n\n${await t(interaction, 'fun_wordle_lose', { answer: game.answer.toUpperCase() })}`;
        }
    } else {
        description += `\n\n${await t(interaction, 'fun_wordle_remaining', { remaining: 6 - game.guesses.length })}`;
    }

    return new EmbedBuilder()
        .setDescription((await t(interaction, 'fun_wordle_title')) + '\n' + description)
        .setColor(game.isOver ? (game.win ? '#2ecc71' : '#e74c3c') : kythia.bot.color)
        .setFooter({ text: game.isOver ? await t(interaction, 'fun_wordle_footer_end') : await t(interaction, 'fun_wordle_footer_play') });
}

module.exports = {
    data: new SlashCommandBuilder().setName('wordle').setDescription('🔡 Play Wordle! Guess the 5-letter word in 6 tries.'),

    async execute(interaction) {
        const userId = interaction.user.id;

        // Cek jika sudah ada game berjalan
        if (games[userId] && !games[userId].isOver) {
            const embed = new EmbedBuilder().setColor('#e67e22').setDescription(await t(interaction, 'fun_wordle_already_playing'));
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const answer = pickRandomWord();
        games[userId] = {
            answer,
            guesses: [],
            isOver: false,
            win: false,
        };
        const game = games[userId];

        const embed = await buildGameEmbed(interaction, game);
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('wordle_guess_button')
                .setLabel(await t(interaction, 'fun_wordle_button_guess'))
                .setStyle(ButtonStyle.Primary)
        );

        const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 300_000 });

        collector.on('collect', async (i) => {
            if (i.user.id !== userId) {
                const embed = new EmbedBuilder().setColor('#e67e22').setDescription(await t(i, 'fun_wordle_not_your_game'));
                return i.reply({ embeds: [embed], ephemeral: true });
            }

            const modal = new ModalBuilder().setCustomId(`wordle_modal_${userId}`).setTitle(await t(i, 'fun_wordle_modal_title'));

            const wordInput = new TextInputBuilder()
                .setCustomId('wordle_input')
                .setLabel(await t(i, 'fun_wordle_modal_label'))
                .setStyle(TextInputStyle.Short)
                .setMinLength(5)
                .setMaxLength(5)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(wordInput));
            await i.showModal(modal);

            try {
                const modalSubmit = await i.awaitModalSubmit({ time: 60_000 });
                const guess = modalSubmit.fields.getTextInputValue('wordle_input').toLowerCase();

                // Validasi input
                if (!isValidWord(guess)) {
                    const embed = new EmbedBuilder()
                        .setColor('#e74c3c')
                        .setDescription(await t(modalSubmit, 'fun_wordle_invalid_word', { word: guess }));
                    return modalSubmit.reply({ embeds: [embed], ephemeral: true });
                }
                if (game.guesses.includes(guess)) {
                    const embed = new EmbedBuilder()
                        .setColor('#e67e22')
                        .setDescription(await t(modalSubmit, 'fun_wordle_already_guessed', { word: guess }));
                    return modalSubmit.reply({ embeds: [embed], ephemeral: true });
                }

                await modalSubmit.deferUpdate();
                game.guesses.push(guess);

                // Cek kondisi menang/kalah
                if (guess === game.answer) {
                    game.isOver = true;
                    game.win = true;
                    collector.stop('win');
                } else if (game.guesses.length >= 6) {
                    game.isOver = true;
                    collector.stop('lose');
                }

                // Update embed setelah tebakan
                const updatedEmbed = await buildGameEmbed(interaction, game);
                await interaction.editReply({ embeds: [updatedEmbed] });
            } catch (err) {
                // User tidak submit modal atau timeout
            }
        });

        collector.on('end', async (collected, reason) => {
            if (!game.isOver) game.isOver = true; // Jika timeout

            delete games[userId]; // Hapus game dari memori

            const finalEmbed = await buildGameEmbed(interaction, game);
            const finalRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('wordle_guess_button')
                    .setLabel(await t(interaction, 'fun_wordle_button_end'))
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
            );
            await interaction.editReply({ embeds: [finalEmbed], components: [finalRow] });
        });
    },
};
