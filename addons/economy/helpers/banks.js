/**
 * @namespace: addons/economy/helpers/banks.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const BANKS = {
    apex_financial: {
        id: 'apex_financial',
        name: 'Apex Financial',
        emoji: '🏦',
        description: 'Active income bonus for hard workers.',

        incomeBonusPercent: 10,
        interestRatePercent: 1,
        transferFeePercent: 5,
        withdrawFeePercent: 1,
        robSuccessBonusPercent: 0,
        robPenaltyMultiplier: 1,
        maxBalance: 1_000_000_000,
    },

    titan_holdings: {
        id: 'titan_holdings',
        name: 'Titan Holdings',
        emoji: '🏛️',
        description: 'Maximize passive profit with the highest interest.',

        incomeBonusPercent: 0,
        interestRatePercent: 5,
        transferFeePercent: 3,
        withdrawFeePercent: 2,
        robSuccessBonusPercent: 0,
        robPenaltyMultiplier: 1,
        maxBalance: 10_000_000_000,
    },

    zenith_commerce: {
        id: 'zenith_commerce',
        name: 'Zenith Commerce',
        emoji: '🌐',
        description: 'Unlimited transactions with the lowest transfer fees.',

        incomeBonusPercent: 0,
        interestRatePercent: 2,
        transferFeePercent: 0,
        withdrawFeePercent: 0,
        robSuccessBonusPercent: 0,
        robPenaltyMultiplier: 1,
        maxBalance: 500_000_000,
    },

    crimson_syndicate: {
        id: 'crimson_syndicate',
        name: 'Crimson Syndicate',
        emoji: '🗡️',
        description: 'Luck favors the bold. Bonus from illegal activities.',

        incomeBonusPercent: -5,
        interestRatePercent: 0,
        transferFeePercent: 10,
        withdrawFeePercent: 0,
        robSuccessBonusPercent: 15,
        robPenaltyMultiplier: 2,
        maxBalance: Infinity,
    },

    solara_mutual: {
        id: 'solara_mutual',
        name: 'Solara Mutual',
        emoji: '☀️',
        description: 'A safe choice to start your economic journey.',

        incomeBonusPercent: 2,
        interestRatePercent: 2,
        transferFeePercent: 2,
        withdrawFeePercent: 1,
        robSuccessBonusPercent: -10,
        robPenaltyMultiplier: 1,
        maxBalance: 750_000_000,
    },
};

module.exports = {
    getBank(bankId) {
        return BANKS[bankId] || BANKS['solara_mutual'];
    },
    getAllBanks() {
        return Object.values(BANKS);
    },
};
