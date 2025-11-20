/**
 * @namespace: addons/fun/commands/_uno.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    EmbedBuilder,
    ComponentType,
} = require('discord.js');
const { UnoGame } = require('../helpers/unoGame'); // Sesuaikan path

// Helper tidak berubah
const createBotUser = (id, name) => ({ id, username: name, bot: true });
const formatCard = (card) => {
    const colors = { RED: '🟥', YELLOW: '🟨', GREEN: '🟩', BLUE: '🟦', WILD: '🌈' };
    const values = { SKIP: '🚫', REVERSE: '🔄', DRAW_2: '+2', WILD: 'Wild', WILD_DRAW_4: '+4' };
    const color = card.color ? colors[card.color] : colors.WILD;
    const value = card.type === 'NUMBER' ? card.value : values[card.type];
    return `${color} ${value}`;
};
const getEmbedColor = (color) => {
    const map = { RED: '#ff5555', YELLOW: '#ffaa00', GREEN: '#55aa55', BLUE: '#5555ff' };
    return map[color] || '#ffffff';
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uno')
        .setDescription('Mulai permainan UNO dengan teman atau bot!')
        .addUserOption((option) => option.setName('lawan').setDescription('Tantang teman atau bot.'))
        .addUserOption((option) => option.setName('player3').setDescription('Pemain ketiga.'))
        .addUserOption((option) => option.setName('player4').setDescription('Pemain keempat.')),

    async execute(interaction) {
        let players = [interaction.user];
        let mentionedUsers = new Set([interaction.user.id]);

        for (const opt of ['lawan', 'player3', 'player4']) {
            const user = interaction.options.getUser(opt);
            if (user) {
                if (mentionedUsers.has(user.id))
                    return interaction.reply({ content: 'Tidak bisa mengundang pemain yang sama dua kali!', ephemeral: true });
                players.push(user);
                mentionedUsers.add(user.id);
            }
        }
        if (players.length < 2) {
            players.push(createBotUser('uno-bot-1', 'UNO Bot 🤖'));
        }

        const game = new UnoGame(players, interaction.client);
        game.startGame();

        await interaction.reply(`🎲 Permainan UNO dimulai: ${players.map((p) => p.username).join(', ')}!`);
        let mainMessage = await interaction.channel.send('Mempersiapkan meja permainan...');

        const gameLoop = async () => {
            if (game.isGameOver) {
                await mainMessage.delete().catch(() => {});
                return;
            }
            const currentPlayer = game.currentPlayer;

            const gameEmbed = new EmbedBuilder()
                .setTitle('UNO Game!')
                .setDescription(`**Kartu Teratas:** ${formatCard(game.topCard)}\n\nSekarang giliran **${currentPlayer.username}**!`)
                .addFields(players.map((p) => ({ name: p.username, value: `${game.hands.get(p.id).length} kartu`, inline: true })))
                .setColor(getEmbedColor(game.topCard.color))
                .setThumbnail('https://i.imgur.com/E1f6tAD.png');

            if (game.aiPlayerIds.has(currentPlayer.id)) {
                // --- GILIRAN AI ---
                const publicActionRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('uno_placeholder_ai')
                        .setLabel(`Giliran ${currentPlayer.username}...`)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                );
                await mainMessage.edit({ content: ``, embeds: [gameEmbed], components: [publicActionRow] });

                setTimeout(async () => {
                    const move = game.runAiTurn();
                    if (game.hands.get(currentPlayer.id).length === 1) game.unoCalled.add(currentPlayer.id);
                    if (checkWinCondition(mainMessage, currentPlayer, game)) return;
                    game.nextTurn(move.card);
                    gameLoop();
                }, 2000);
            } else {
                // --- GILIRAN MANUSIA (DIREFAKTOR TOTAL) ---
                const publicActionRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('uno_play').setLabel('Mainkan Kartu').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('uno_draw').setLabel('Tarik Kartu 🃏').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('uno_call').setLabel('UNO!').setStyle(ButtonStyle.Success)
                );
                await mainMessage.edit({ content: `Giliranmu, ${currentPlayer}!`, embeds: [gameEmbed], components: [publicActionRow] });

                try {
                    const i = await mainMessage.awaitMessageComponent({
                        filter: (userInt) => userInt.user.id === currentPlayer.id,
                        time: 120_000,
                    });

                    let cardPlayed = null;

                    if (i.customId === 'uno_draw') {
                        const drawnCard = game.drawCard(currentPlayer.id);
                        await i.reply({ content: `Kamu menarik kartu: ${formatCard(drawnCard)}`, ephemeral: true });
                        cardPlayed = { type: 'DRAW_ACTION' };
                    } else if (i.customId === 'uno_call') {
                        await i.reply({ content: 'Kamu teriak UNO!', ephemeral: true });
                        game.unoCalled.add(currentPlayer.id);
                        gameLoop();
                        return;
                    } else if (i.customId === 'uno_play') {
                        cardPlayed = await promptAndPlayCard(i, game, currentPlayer);
                        if (!cardPlayed) {
                            gameLoop();
                            return;
                        }
                    }

                    if (checkWinCondition(mainMessage, currentPlayer, game)) return;
                    if (cardPlayed) game.nextTurn(cardPlayed);
                    gameLoop();
                } catch (err) {
                    if (game.isGameOver) return;
                    await mainMessage
                        .edit({
                            content: `⏳ Giliran ${currentPlayer.username} habis! Dia menarik 2 kartu.`,
                            embeds: [mainMessage.embeds[0]],
                            components: [],
                        })
                        .catch(() => {});
                    game.drawCard(currentPlayer.id);
                    game.drawCard(currentPlayer.id);
                    game.nextTurn({ type: 'TIMEOUT' });
                    gameLoop();
                }
            }
        };
        gameLoop();
    },
};

// --- Helper Functions (Diluar `execute`) ---

async function promptAndPlayCard(interaction, game, currentPlayer) {
    let currentPage = 1;

    const generateControls = () => {
        const hand = game.hands.get(currentPlayer.id);
        const totalPages = Math.ceil(hand.length / 25) || 1;
        if (currentPage > totalPages) currentPage = totalPages;

        const handString = hand.map((c) => formatCard(c)).join('  ');
        const playableCards = hand.map((card, index) => ({ card, index })).filter((item) => game.isCardPlayable(item.card));

        const cardOptions = playableCards
            .filter((_, i) => i >= (currentPage - 1) * 25 && i < currentPage * 25)
            .map((item) => ({ label: `${item.index + 1}. ${formatCard(item.card)}`, value: `play_${item.index}` }));

        const components = [];
        if (cardOptions.length > 0) {
            components.push(
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('uno_select_card')
                        .setPlaceholder(`Pilih kartu (Halaman ${currentPage}/${totalPages})...`)
                        .setOptions(cardOptions)
                )
            );
        }
        if (totalPages > 1) {
            const nav = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('uno_page_prev')
                    .setLabel('⬅️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === 1),
                new ButtonBuilder()
                    .setCustomId('uno_page_next')
                    .setLabel('➡️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === totalPages)
            );
            components.push(nav);
        }
        return { content: `**Kartumu (${hand.length}):**\n${handString.substring(0, 1900)}`, components, ephemeral: true };
    };

    // Kirim pesan ephemeral pertama
    await interaction.reply({ ...generateControls(), ephemeral: true });
    const controlMessage = await interaction.fetchReply();

    try {
        // Tunggu pemain memilih kartu dari select menu
        const selectInteraction = await controlMessage.awaitMessageComponent({
            filter: (i) => i.user.id === currentPlayer.id && i.isStringSelectMenu(),
            componentType: ComponentType.StringSelect,
            time: 60_000,
        });

        const cardIndex = parseInt(selectInteraction.values[0].split('_')[1]);
        const card = game.hands.get(currentPlayer.id)[cardIndex];

        let chosenColor = null;
        if (card.type.startsWith('WILD')) {
            chosenColor = await askColor(selectInteraction);
            if (!chosenColor) {
                await controlMessage.delete().catch(() => {});
                return null;
            }
        } else {
            await selectInteraction.deferUpdate();
        }

        const result = game.playCard(currentPlayer.id, cardIndex, chosenColor);
        if (result.success) {
            await controlMessage.delete().catch(() => {});
            return result.card;
        } else {
            await selectInteraction.followUp({ content: `Gagal: ${result.message}`, ephemeral: true });
            await controlMessage.delete().catch(() => {});
            return null;
        }
    } catch (err) {
        // Timeout saat memilih kartu
        await controlMessage.delete().catch(() => {});
        return null;
    }
}

async function askColor(selectInteraction) {
    const colorRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('color_RED').setLabel('🟥').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('color_YELLOW').setLabel('🟨').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('color_GREEN').setLabel('🟩').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('color_BLUE').setLabel('🟦').setStyle(ButtonStyle.Secondary)
    );

    // Gunakan UPDATE pada interaksi select menu, bukan reply/followUp
    await selectInteraction.update({ content: 'Pilih warna untuk kartu Wild!', components: [colorRow] });
    const askMsg = await selectInteraction.fetchReply();

    try {
        const buttonInteraction = await askMsg.awaitMessageComponent({
            filter: (i) => i.user.id === selectInteraction.user.id,
            time: 30_000,
        });
        // Kita tidak perlu menghapus pesannya, karena update dari select menu akan menghapusnya
        return buttonInteraction.customId.split('_')[1];
    } catch {
        return null;
    }
}

function checkWinCondition(mainMessage, player, game) {
    if (game.hands.get(player.id).length === 0) {
        game.isGameOver = true;
        const winEmbed = new EmbedBuilder()
            .setTitle('🏆 UNO!')
            .setDescription(`${player.username} telah memenangkan permainan!`)
            .setColor('Gold');
        mainMessage.edit({ embeds: [winEmbed], components: [] });
        return true;
    }
    if (game.hands.get(player.id).length === 1 && !game.unoCalled.has(player.id)) {
        mainMessage.channel.send({ content: `😱 ${player.username} lupa panggil UNO! Ambil 2 kartu hukuman.` });
        game.drawCard(player.id);
        game.drawCard(player.id);
    }
    return false;
}
