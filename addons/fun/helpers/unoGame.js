/**
 * @namespace: addons/fun/helpers/unoGame.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { getShuffledDeck, WILD_TYPES } = require('./unoCards');

/**
 * 🧠 Manages the entire state and logic for a single UNO game.
 */
class UnoGame {
    constructor(players, client) {
        this.players = players; // Array of Discord User objects
        // Anggap sebagai AI jika properti .bot-nya true ATAU jika itu adalah bot-mu sendiri
        this.aiPlayerIds = new Set(players.filter((p) => p.bot || p.id === client.user.id).map((p) => p.id));
        this.hands = new Map(); // Map<userId, Array<card>>
        this.drawPile = getShuffledDeck();
        this.discardPile = [];
        this.currentPlayerIndex = Math.floor(Math.random() * this.players.length);
        this.playDirection = 1; // 1 for clockwise, -1 for counter-clockwise
        this.unoCalled = new Set(); // Stores userIDs who have called UNO
    }

    /**
     * Deals initial cards and starts the game by placing the first card.
     */
    startGame() {
        // Deal 7 cards to each player
        for (const player of this.players) {
            this.hands.set(player.id, this.drawPile.splice(0, 7));
        }

        // Place the first card on the discard pile
        let firstCard = this.drawPile.pop();
        // The first card cannot be a Wild Draw 4
        while (firstCard.type === 'WILD_DRAW_4') {
            this.drawPile.push(firstCard);
            firstCard = this.drawPile.pop();
        }
        this.discardPile.push(firstCard);
    }

    get topCard() {
        return this.discardPile[this.discardPile.length - 1];
    }

    get currentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    /**
     * Checks if a card is playable against the current top card.
     * @param {object} card - The card to check.
     * @returns {boolean}
     */
    isCardPlayable(card) {
        const top = this.topCard;
        // Wild cards are always playable
        if (WILD_TYPES.includes(card.type)) return true;
        // Match color or value
        return card.color === top.color || card.value === top.value;
    }

    /**
     * 🤖 Menjalankan giliran untuk pemain AI.
     * @returns {{action: string, card: object|null, message: string}} Hasil dari giliran AI.
     */
    runAiTurn() {
        const aiId = this.currentPlayer.id;
        const hand = this.hands.get(aiId);

        // Cari semua kartu yang bisa dimainkan
        const playableCards = hand.map((card, index) => ({ card, index })).filter((item) => this.isCardPlayable(item.card));

        if (playableCards.length > 0) {
            // --- Logika Keputusan AI ---
            let bestPlay = playableCards[0]; // Pilihan default

            // Prioritas 1: Mainkan kartu Wild Draw 4 atau Draw 2 jika memungkinkan
            const powerCard = playableCards.find((p) => p.card.type === 'WILD_DRAW_4' || p.card.type === 'DRAW_2');
            if (powerCard) {
                bestPlay = powerCard;
            } else {
                // Prioritas 2: Coba ganti warna ke warna yang paling banyak dimiliki
                const colorCounts = this.countHandColors(hand);
                const bestColor = Object.keys(colorCounts).reduce((a, b) => (colorCounts[a] > colorCounts[b] ? a : b));

                const colorChangeCard = playableCards.find((p) => p.card.color === bestColor || p.card.type === 'WILD');
                if (colorChangeCard) {
                    bestPlay = colorChangeCard;
                }
            }

            // Jika kartu yang dipilih adalah Wild, pilih warna terbaik
            let chosenColor = null;
            if (WILD_TYPES.includes(bestPlay.card.type)) {
                const colorCounts = this.countHandColors(hand.filter((c) => !WILD_TYPES.includes(c.type)));
                chosenColor =
                    Object.keys(colorCounts).length > 0
                        ? Object.keys(colorCounts).reduce((a, b) => (colorCounts[a] > colorCounts[b] ? a : b))
                        : COLORS[Math.floor(Math.random() * COLORS.length)]; // Pilih acak jika hanya punya kartu wild
            }

            // Mainkan kartu yang dipilih
            const result = this.playCard(aiId, bestPlay.index, chosenColor);
            return { action: 'play', card: result.card, message: `Bot memainkan ${result.card.color} ${result.card.value}!` };
        } else {
            // Jika tidak ada kartu yang bisa dimainkan, tarik kartu
            const drawnCard = this.drawCard(aiId);
            // AI pintar akan mengecek apakah kartu baru bisa langsung dimainkan
            if (this.isCardPlayable(drawnCard)) {
                const newCardIndex = hand.indexOf(drawnCard);
                const result = this.playCard(aiId, newCardIndex);
                if (result && result.card) {
                    return {
                        action: 'draw-and-play',
                        card: result.card,
                        message: `Bot menarik kartu dan langsung memainkan ${result.card.color} ${result.card.value}!`,
                    };
                } else {
                    // Jika terjadi error saat memainkan kartu, fallback ke aksi draw saja
                    return { action: 'draw', card: drawnCard, message: `Bot menarik satu kartu.` };
                }
            }
            return { action: 'draw', card: drawnCard, message: `Bot menarik satu kartu.` };
        }
    }

    /**
     * @private Helper untuk menghitung jumlah kartu per warna di tangan.
     */
    countHandColors(hand) {
        return hand.reduce((acc, card) => {
            if (card.color) {
                acc[card.color] = (acc[card.color] || 0) + 1;
            }
            return acc;
        }, {});
    }

    /**
     * The main action for playing a card from a player's hand.
     * @param {string} playerId - The ID of the player making the move.
     * @param {number} cardIndex - The index of the card in the player's hand.
     * @param {string|null} chosenColor - The color chosen if a Wild card is played.
     * @returns {{success: boolean, message: string, card: object|null}}
     */
    playCard(playerId, cardIndex, chosenColor = null) {
        const hand = this.hands.get(playerId);
        const card = hand[cardIndex];

        if (!this.isCardPlayable(card)) {
            return { success: false, message: "You can't play that card! It doesn't match the color or value.", card: null };
        }

        // Handle Wild card color choice
        if (WILD_TYPES.includes(card.type)) {
            if (!chosenColor) {
                return { success: false, message: 'You must choose a color when playing a Wild card.', card: null };
            }
            card.color = chosenColor; // Assign the chosen color to the Wild card
        }

        // Move the card from hand to discard pile
        hand.splice(cardIndex, 1);
        this.discardPile.push(card);
        this.unoCalled.delete(playerId); // Reset UNO status after playing a card

        return { success: true, message: `Played ${card.color} ${card.value}!`, card };
    }

    /**
     * Allows a player to draw a card from the draw pile.
     * @param {string} playerId - The ID of the player drawing.
     * @returns {object} The card that was drawn.
     */
    drawCard(playerId) {
        if (this.drawPile.length === 0) {
            this.recycleDiscardPile();
        }
        const card = this.drawPile.pop();
        this.hands.get(playerId).push(card);
        return card;
    }

    /**
     * Handles card effects (Skip, Reverse, Draw 2, etc.) and moves to the next turn.
     * @param {object} playedCard - The card whose effect should be applied.
     */
    nextTurn(playedCard) {
        // Card effects apply *after* the card is played
        switch (playedCard.type) {
            case 'SKIP':
                this.currentPlayerIndex = this.getNextPlayerIndex();
                break;
            case 'REVERSE':
                this.playDirection *= -1;
                // In a 2-player game, Reverse acts like a Skip
                if (this.players.length === 2) {
                    this.currentPlayerIndex = this.getNextPlayerIndex();
                }
                break;
            case 'DRAW_2':
                const nextPlayerId = this.players[this.getNextPlayerIndex()].id;
                this.drawCard(nextPlayerId);
                this.drawCard(nextPlayerId);
                this.currentPlayerIndex = this.getNextPlayerIndex(); // Skip the next player's turn
                break;
            case 'WILD_DRAW_4':
                const punishedPlayerId = this.players[this.getNextPlayerIndex()].id;
                for (let i = 0; i < 4; i++) this.drawCard(punishedPlayerId);
                this.currentPlayerIndex = this.getNextPlayerIndex(); // Skip their turn
                break;
        }

        // Move to the next player
        this.currentPlayerIndex = this.getNextPlayerIndex();
    }

    getNextPlayerIndex() {
        let nextIndex = this.currentPlayerIndex + this.playDirection;
        // Wrap around if the index goes out of bounds
        if (nextIndex < 0) {
            nextIndex = this.players.length - 1;
        } else if (nextIndex >= this.players.length) {
            nextIndex = 0;
        }
        return nextIndex;
    }

    /**
     * Reshuffles the discard pile to create a new draw pile when it's empty.
     */
    recycleDiscardPile() {
        const topCard = this.discardPile.pop();
        this.drawPile = getShuffledDeck(this.discardPile);
        this.discardPile = [topCard];
    }
}

module.exports = { UnoGame };
