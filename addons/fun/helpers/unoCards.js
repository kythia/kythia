/**
 * @namespace: addons/fun/helpers/unoCards.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

/**
 * 🃏 Defines the standard deck of UNO cards.
 * Each card is an object with a color, type, and value/display text.
 */

const COLORS = ['RED', 'YELLOW', 'GREEN', 'BLUE'];
const SPECIAL_TYPES = ['SKIP', 'REVERSE', 'DRAW_2'];
const WILD_TYPES = ['WILD', 'WILD_DRAW_4'];

const DECK = [];

// Generate number cards (1-9 twice, 0 once for each color)
for (const color of COLORS) {
    DECK.push({ color, type: 'NUMBER', value: '0' });
    for (let i = 0; i < 2; i++) {
        for (let j = 1; j <= 9; j++) {
            DECK.push({ color, type: 'NUMBER', value: j.toString() });
        }
    }
}

// Generate special cards (SKIP, REVERSE, DRAW_2) - two for each color
for (const color of COLORS) {
    for (let i = 0; i < 2; i++) {
        for (const type of SPECIAL_TYPES) {
            DECK.push({ color, type, value: type });
        }
    }
}

// Generate wild cards (4 of each)
for (let i = 0; i < 4; i++) {
    for (const type of WILD_TYPES) {
        // Wild cards have a null color until they are played
        DECK.push({ color: null, type, value: type });
    }
}

/**
 * Gets a fresh, shuffled copy of the UNO deck.
 * @returns {Array<object>} A shuffled array of card objects.
 */
const getShuffledDeck = () => {
    const deckCopy = [...DECK];
    // Fisher-Yates shuffle algorithm for true randomness
    for (let i = deckCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deckCopy[i], deckCopy[j]] = [deckCopy[j], deckCopy[i]];
    }
    return deckCopy;
};

module.exports = { getShuffledDeck, WILD_TYPES, COLORS };
