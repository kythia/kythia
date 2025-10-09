/**
 * @namespace: addons/economy/helpers/jobs.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

module.exports = {
    tier1: {
        requiredItem: null,
        jobs: [
            {
                nameKey: 'jobs.barista.name',
                emoji: '☕',
                basePay: [50, 150],
                scenarios: [
                    { descKey: 'jobs.barista.scenarios.s1', outcome: 'success', modifier: 1.5 },
                    { descKey: 'jobs.barista.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.barista.scenarios.s3', outcome: 'failure', modifier: 0.5 },
                ],
            },
            {
                nameKey: 'jobs.courier.name',
                emoji: '📦',
                basePay: [60, 160],
                scenarios: [
                    { descKey: 'jobs.courier.scenarios.s1', outcome: 'success', modifier: 1.4 },
                    { descKey: 'jobs.courier.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.courier.scenarios.s3', outcome: 'failure', modifier: 0.7 },
                ],
            },
            {
                nameKey: 'jobs.cashier.name',
                emoji: '🛒',
                basePay: [55, 140],
                scenarios: [
                    { descKey: 'jobs.cashier.scenarios.s1', outcome: 'success', modifier: 1.3 },
                    { descKey: 'jobs.cashier.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.cashier.scenarios.s3', outcome: 'failure', modifier: 0.6 },
                ],
            },
            {
                nameKey: 'jobs.parking_attendant.name',
                emoji: '🅿️',
                basePay: [40, 120],
                scenarios: [
                    { descKey: 'jobs.parking_attendant.scenarios.s1', outcome: 'success', modifier: 1.4 },
                    { descKey: 'jobs.parking_attendant.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.parking_attendant.scenarios.s3', outcome: 'failure', modifier: 0.5 },
                ],
            },
        ],
    },
    tier2: {
        requiredItem: '💻 Laptop',
        jobs: [
            {
                nameKey: 'jobs.programmer.name',
                emoji: '💻',
                basePay: [200, 400],
                requiredItem: '💻 Laptop',
                scenarios: [
                    { descKey: 'jobs.programmer.scenarios.s1', outcome: 'success', modifier: 1.8 },
                    { descKey: 'jobs.programmer.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.programmer.scenarios.s3', outcome: 'failure', modifier: 0.4 },
                ],
            },
            {
                nameKey: 'jobs.graphic_designer.name',
                emoji: '🎨',
                basePay: [180, 380],
                requiredItem: '💻 Laptop',
                scenarios: [
                    { descKey: 'jobs.graphic_designer.scenarios.s1', outcome: 'success', modifier: 1.9 },
                    { descKey: 'jobs.graphic_designer.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.graphic_designer.scenarios.s3', outcome: 'failure', modifier: 0.8 },
                ],
            },
            {
                nameKey: 'jobs.social_media_admin.name',
                emoji: '📱',
                basePay: [170, 350],
                requiredItem: '💻 Laptop',
                scenarios: [
                    { descKey: 'jobs.social_media_admin.scenarios.s1', outcome: 'success', modifier: 1.7 },
                    { descKey: 'jobs.social_media_admin.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.social_media_admin.scenarios.s3', outcome: 'failure', modifier: 0.6 },
                ],
            },
            {
                nameKey: 'jobs.freelance_writer.name',
                emoji: '📝',
                basePay: [160, 320],
                requiredItem: '💻 Laptop',
                scenarios: [
                    { descKey: 'jobs.freelance_writer.scenarios.s1', outcome: 'success', modifier: 1.6 },
                    { descKey: 'jobs.freelance_writer.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.freelance_writer.scenarios.s3', outcome: 'failure', modifier: 0.7 },
                ],
            },
        ],
    },
    tier3: {
        requiredItem: '📱 Smartphone',
        jobs: [
            {
                nameKey: 'jobs.influencer.name',
                emoji: '🤳',
                basePay: [350, 700],
                requiredItem: '📱 Smartphone',
                scenarios: [
                    { descKey: 'jobs.influencer.scenarios.s1', outcome: 'success', modifier: 2.0 },
                    { descKey: 'jobs.influencer.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.influencer.scenarios.s3', outcome: 'failure', modifier: 0.5 },
                ],
            },
            {
                nameKey: 'jobs.ojek_driver.name',
                emoji: '🛵',
                basePay: [300, 600],
                requiredItem: '📱 Smartphone',
                scenarios: [
                    { descKey: 'jobs.ojek_driver.scenarios.s1', outcome: 'success', modifier: 1.8 },
                    { descKey: 'jobs.ojek_driver.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.ojek_driver.scenarios.s3', outcome: 'failure', modifier: 0.7 },
                ],
            },
            {
                nameKey: 'jobs.online_seller.name',
                emoji: '📦',
                basePay: [320, 650],
                requiredItem: '📱 Smartphone',
                scenarios: [
                    { descKey: 'jobs.online_seller.scenarios.s1', outcome: 'success', modifier: 1.9 },
                    { descKey: 'jobs.online_seller.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.online_seller.scenarios.s3', outcome: 'failure', modifier: 0.6 },
                ],
            },
            {
                nameKey: 'jobs.photographer.name',
                emoji: '📸',
                basePay: [340, 680],
                requiredItem: '📱 Smartphone',
                scenarios: [
                    { descKey: 'jobs.photographer.scenarios.s1', outcome: 'success', modifier: 2.1 },
                    { descKey: 'jobs.photographer.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.photographer.scenarios.s3', outcome: 'failure', modifier: 0.5 },
                ],
            },
        ],
    },
    tier4: {
        requiredItem: ['🖥️ PC Desktop', '🚗 Mobil'],
        jobs: [
            {
                nameKey: 'jobs.project_manager.name',
                emoji: '🗂️',
                basePay: [700, 1200],
                requiredItem: '🖥️ PC Desktop',
                scenarios: [
                    { descKey: 'jobs.project_manager.scenarios.s1', outcome: 'success', modifier: 2.2 },
                    { descKey: 'jobs.project_manager.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.project_manager.scenarios.s3', outcome: 'failure', modifier: 0.7 },
                ],
            },
            {
                nameKey: 'jobs.entrepreneur.name',
                emoji: '🏢',
                basePay: [800, 1500],
                requiredItem: '🚗 Mobil',
                scenarios: [
                    { descKey: 'jobs.entrepreneur.scenarios.s1', outcome: 'success', modifier: 2.5 },
                    { descKey: 'jobs.entrepreneur.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.entrepreneur.scenarios.s3', outcome: 'failure', modifier: 0.6 },
                ],
            },
            {
                nameKey: 'jobs.it_consultant.name',
                emoji: '🧑‍💼',
                basePay: [750, 1300],
                requiredItem: '🖥️ PC Desktop',
                scenarios: [
                    { descKey: 'jobs.it_consultant.scenarios.s1', outcome: 'success', modifier: 2.3 },
                    { descKey: 'jobs.it_consultant.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.it_consultant.scenarios.s3', outcome: 'failure', modifier: 0.7 },
                ],
            },
            {
                nameKey: 'jobs.private_driver.name',
                emoji: '🚗',
                basePay: [700, 1200],
                requiredItem: '🚗 Mobil',
                scenarios: [
                    { descKey: 'jobs.private_driver.scenarios.s1', outcome: 'success', modifier: 2.0 },
                    { descKey: 'jobs.private_driver.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.private_driver.scenarios.s3', outcome: 'failure', modifier: 0.6 },
                ],
            },
        ],
    },
    tier5: {
        requiredItem: ['🏠 Rumah Mewah', '🏢 Perusahaan'],
        jobs: [
            {
                nameKey: 'jobs.ceo_startup.name',
                emoji: '🦸‍♂️',
                basePay: [2000, 4000],
                requiredItem: '🏠 Rumah Mewah',
                scenarios: [
                    { descKey: 'jobs.ceo_startup.scenarios.s1', outcome: 'success', modifier: 3.0 },
                    { descKey: 'jobs.ceo_startup.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.ceo_startup.scenarios.s3', outcome: 'failure', modifier: 0.7 },
                ],
            },
            {
                nameKey: 'jobs.property_investor.name',
                emoji: '🏦',
                basePay: [1800, 3500],
                requiredItem: '🏠 Rumah Mewah',
                scenarios: [
                    { descKey: 'jobs.property_investor.scenarios.s1', outcome: 'success', modifier: 2.8 },
                    { descKey: 'jobs.property_investor.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.property_investor.scenarios.s3', outcome: 'failure', modifier: 0.6 },
                ],
            },
            {
                nameKey: 'jobs.company_director.name',
                emoji: '🏢',
                basePay: [2200, 4500],
                requiredItem: '🏢 Perusahaan',
                scenarios: [
                    { descKey: 'jobs.company_director.scenarios.s1', outcome: 'success', modifier: 3.2 },
                    { descKey: 'jobs.company_director.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.company_director.scenarios.s3', outcome: 'failure', modifier: 0.5 },
                ],
            },
            {
                nameKey: 'jobs.philanthropist.name',
                emoji: '🤝',
                basePay: [2100, 4200],
                requiredItem: '🏢 Perusahaan',
                scenarios: [
                    { descKey: 'jobs.philanthropist.scenarios.s1', outcome: 'success', modifier: 2.7 },
                    { descKey: 'jobs.philanthropist.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.philanthropist.scenarios.s3', outcome: 'failure', modifier: 0.6 },
                ],
            },
        ],
    },
};
