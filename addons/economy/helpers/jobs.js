/**
 * @namespace: addons/economy/helpers/jobs.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

module.exports = {
    tier1: {
        requiredItem: null,
        jobs: [
            {
                nameKey: 'jobs.barista.name',
                emoji: '☕',
                basePay: [13, 18], // $13-18/jam
                scenarios: [
                    { descKey: 'jobs.barista.scenarios.s1', outcome: 'success', modifier: 1.2 },
                    { descKey: 'jobs.barista.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.barista.scenarios.s3', outcome: 'failure', modifier: 0.7 },
                ],
            },
            {
                nameKey: 'jobs.courier.name', // Kurir (mis. UPS, FedEx, DoorDash, dsb)
                emoji: '📦',
                basePay: [16, 22], // $16-22/jam
                scenarios: [
                    { descKey: 'jobs.courier.scenarios.s1', outcome: 'success', modifier: 1.15 },
                    { descKey: 'jobs.courier.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.courier.scenarios.s3', outcome: 'failure', modifier: 0.75 },
                ],
            },
            {
                nameKey: 'jobs.cashier.name',
                emoji: '🛒',
                basePay: [13, 16], // $13-16/jam
                scenarios: [
                    { descKey: 'jobs.cashier.scenarios.s1', outcome: 'success', modifier: 1.1 },
                    { descKey: 'jobs.cashier.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.cashier.scenarios.s3', outcome: 'failure', modifier: 0.8 },
                ],
            },
            {
                nameKey: 'jobs.parking_attendant.name',
                emoji: '🅿️',
                basePay: [12, 17], // $12-17/jam
                scenarios: [
                    { descKey: 'jobs.parking_attendant.scenarios.s1', outcome: 'success', modifier: 1.2 },
                    { descKey: 'jobs.parking_attendant.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.parking_attendant.scenarios.s3', outcome: 'failure', modifier: 0.7 },
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
                basePay: [35, 70], // Junior Programmer: $35-70/jam
                requiredItem: '💻 Laptop',
                scenarios: [
                    { descKey: 'jobs.programmer.scenarios.s1', outcome: 'success', modifier: 1.18 },
                    { descKey: 'jobs.programmer.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.programmer.scenarios.s3', outcome: 'failure', modifier: 0.5 },
                ],
            },
            {
                nameKey: 'jobs.graphic_designer.name',
                emoji: '🎨',
                basePay: [22, 45], // $22-45/jam
                requiredItem: '💻 Laptop',
                scenarios: [
                    { descKey: 'jobs.graphic_designer.scenarios.s1', outcome: 'success', modifier: 1.15 },
                    { descKey: 'jobs.graphic_designer.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.graphic_designer.scenarios.s3', outcome: 'failure', modifier: 0.7 },
                ],
            },
            {
                nameKey: 'jobs.social_media_admin.name',
                emoji: '📱',
                basePay: [18, 30], // $18-30/jam
                requiredItem: '💻 Laptop',
                scenarios: [
                    { descKey: 'jobs.social_media_admin.scenarios.s1', outcome: 'success', modifier: 1.15 },
                    { descKey: 'jobs.social_media_admin.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.social_media_admin.scenarios.s3', outcome: 'failure', modifier: 0.8 },
                ],
            },
            {
                nameKey: 'jobs.freelance_writer.name',
                emoji: '📝',
                basePay: [21, 35], // $21-35/jam (rata-rata penulis lepas US)
                requiredItem: '💻 Laptop',
                scenarios: [
                    { descKey: 'jobs.freelance_writer.scenarios.s1', outcome: 'success', modifier: 1.13 },
                    { descKey: 'jobs.freelance_writer.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.freelance_writer.scenarios.s3', outcome: 'failure', modifier: 0.8 },
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
                basePay: [28, 100], // $28-100/jam (bisa tinggi tapi biasanya di range ini untuk kecil/menengah)
                requiredItem: '📱 Smartphone',
                scenarios: [
                    { descKey: 'jobs.influencer.scenarios.s1', outcome: 'success', modifier: 1.20 },
                    { descKey: 'jobs.influencer.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.influencer.scenarios.s3', outcome: 'failure', modifier: 0.5 },
                ],
            },
            {
                nameKey: 'jobs.ojek_driver.name',
                emoji: '🛵',
                basePay: [16, 25], // ride-sharing (Uber, Lyft): $16-25/jam
                requiredItem: '📱 Smartphone',
                scenarios: [
                    { descKey: 'jobs.ojek_driver.scenarios.s1', outcome: 'success', modifier: 1.10 },
                    { descKey: 'jobs.ojek_driver.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.ojek_driver.scenarios.s3', outcome: 'failure', modifier: 0.6 },
                ],
            },
            {
                nameKey: 'jobs.online_seller.name',
                emoji: '📦',
                basePay: [17, 28], // $17-28/jam ≈ reseller, dropshipper rata-rata US (part time)
                requiredItem: '📱 Smartphone',
                scenarios: [
                    { descKey: 'jobs.online_seller.scenarios.s1', outcome: 'success', modifier: 1.12 },
                    { descKey: 'jobs.online_seller.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.online_seller.scenarios.s3', outcome: 'failure', modifier: 0.7 },
                ],
            },
            {
                nameKey: 'jobs.photographer.name',
                emoji: '📸',
                basePay: [20, 40], // rata-rata freelance photographer US per jam
                requiredItem: '📱 Smartphone',
                scenarios: [
                    { descKey: 'jobs.photographer.scenarios.s1', outcome: 'success', modifier: 1.15 },
                    { descKey: 'jobs.photographer.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.photographer.scenarios.s3', outcome: 'failure', modifier: 0.8 },
                ],
            },
        ],
    },
    tier4: {
        requiredItem: ['🖥️ PC Desktop', '🚗 Car'],
        jobs: [
            {
                nameKey: 'jobs.project_manager.name',
                emoji: '🗂️',
                basePay: [45, 85], // $45-85/jam (mid-level PM)
                requiredItem: '🖥️ PC Desktop',
                scenarios: [
                    { descKey: 'jobs.project_manager.scenarios.s1', outcome: 'success', modifier: 1.20 },
                    { descKey: 'jobs.project_manager.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.project_manager.scenarios.s3', outcome: 'failure', modifier: 0.7 },
                ],
            },
            {
                nameKey: 'jobs.entrepreneur.name',
                emoji: '🏢',
                basePay: [50, 150], // rata-rata owner bisnis kecil-menengah perhitungkan $50-150/jam profit
                requiredItem: '🚗 Car',
                scenarios: [
                    { descKey: 'jobs.entrepreneur.scenarios.s1', outcome: 'success', modifier: 1.40 },
                    { descKey: 'jobs.entrepreneur.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.entrepreneur.scenarios.s3', outcome: 'failure', modifier: 0.5 },
                ],
            },
            {
                nameKey: 'jobs.it_consultant.name',
                emoji: '🧑‍💼',
                basePay: [60, 120], // IT Consultant US: $60-120/jam
                requiredItem: '🖥️ PC Desktop',
                scenarios: [
                    { descKey: 'jobs.it_consultant.scenarios.s1', outcome: 'success', modifier: 1.22 },
                    { descKey: 'jobs.it_consultant.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.it_consultant.scenarios.s3', outcome: 'failure', modifier: 0.65 },
                ],
            },
            {
                nameKey: 'jobs.private_driver.name',
                emoji: '🚗',
                basePay: [20, 35], // $20-35/jam untuk pengemudi privat/limousine
                requiredItem: '🚗 Car',
                scenarios: [
                    { descKey: 'jobs.private_driver.scenarios.s1', outcome: 'success', modifier: 1.18 },
                    { descKey: 'jobs.private_driver.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.private_driver.scenarios.s3', outcome: 'failure', modifier: 0.7 },
                ],
            },
        ],
    },
    tier5: {
        requiredItem: ['🏠 Luxury House', '🏢 Company'],
        jobs: [
            {
                nameKey: 'jobs.ceo_startup.name',
                emoji: '🦸‍♂️',
                basePay: [120, 500], // CEO: $120-500/jam (Stock option CEO startup US)
                requiredItem: '🏠 Luxury House',
                scenarios: [
                    { descKey: 'jobs.ceo_startup.scenarios.s1', outcome: 'success', modifier: 2.0 },
                    { descKey: 'jobs.ceo_startup.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.ceo_startup.scenarios.s3', outcome: 'failure', modifier: 0.7 },
                ],
            },
            {
                nameKey: 'jobs.property_investor.name',
                emoji: '🏦',
                basePay: [80, 350], // Investor: $80-350/jam (real deal, tergantung skala investasinya)
                requiredItem: '🏠 Luxury House',
                scenarios: [
                    { descKey: 'jobs.property_investor.scenarios.s1', outcome: 'success', modifier: 1.85 },
                    { descKey: 'jobs.property_investor.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.property_investor.scenarios.s3', outcome: 'failure', modifier: 0.6 },
                ],
            },
            {
                nameKey: 'jobs.company_director.name',
                emoji: '🏢',
                basePay: [150, 600], // Director: $150-600/jam (mid-large corp, US)
                requiredItem: '🏢 Company',
                scenarios: [
                    { descKey: 'jobs.company_director.scenarios.s1', outcome: 'success', modifier: 2.4 },
                    { descKey: 'jobs.company_director.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.company_director.scenarios.s3', outcome: 'failure', modifier: 0.5 },
                ],
            },
            {
                nameKey: 'jobs.philanthropist.name',
                emoji: '🤝',
                basePay: [115, 400], // Philanthropist biasanya income-nya dari investasi, exekutif, dsb
                requiredItem: '🏢 Company',
                scenarios: [
                    { descKey: 'jobs.philanthropist.scenarios.s1', outcome: 'success', modifier: 2.1 },
                    { descKey: 'jobs.philanthropist.scenarios.s2', outcome: 'neutral', modifier: 1.0 },
                    { descKey: 'jobs.philanthropist.scenarios.s3', outcome: 'failure', modifier: 0.6 },
                ],
            },
        ],
    },
};
