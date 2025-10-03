/**
 * @namespace: addons/economy/commands/shop.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('@coreModels/User');
const Inventory = require('@coreModels/Inventory');
const { embedFooter } = require('@utils/discord');
const shopData = require('../helpers/items');
const { t } = require('@utils/translator');

const allItems = Object.values(shopData).flat();

/**
 * Membuat Embed untuk toko berdasarkan kategori dan halaman
 */
async function generateShopEmbed(interaction, user, category, page) {
    const itemsToShow =
        category === 'all' ? allItems.filter((item) => item.buyable) : (shopData[category] || []).filter((item) => item.buyable);

    const totalPages = Math.max(1, Math.ceil(itemsToShow.length / 5)); // 5 item per halaman
    page = Math.max(1, Math.min(page, totalPages));
    const startIndex = (page - 1) * 5;
    const pageItems = itemsToShow.slice(startIndex, startIndex + 5);

    const embed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setDescription(
            await t(interaction, 'economy_shop_desc', {
                bot: interaction.client.user.username,
                category: category.charAt(0).toUpperCase() + category.slice(1),
                cash: user.cash.toLocaleString(),
            })
        )
        // .setTimestamp()
        .setFooter(await embedFooter(interaction, await t(interaction, 'economy_shop_footer', { page, totalPages })));

    if (pageItems.length === 0) {
        embed.addFields({
            name: await t(interaction, 'economy_shop_empty_title'),
            value: await t(interaction, 'economy_shop_empty_desc'),
        });
    } else {
        for (const item of pageItems) {
            const itemName = await t(interaction, item.nameKey);
            const itemDesc = await t(interaction, item.descKey);
            embed.addFields({
                name: `${item.emoji} ${itemName} - 🪙 ${item.price.toLocaleString()}`,
                value: `\`\`\`${itemDesc}\`\`\``,
            });
        }
    }
    return { embed, pageItems, page, totalPages };
}

/**
 * Membuat Action Rows (Tombol & Menu)
 */
async function generateActionRows(interaction, page, totalPages, category, pageItems) {
    const categoryOptions = await Promise.all(
        Object.keys(shopData).map(async (cat) => ({
            label: await t(interaction, `economy_shop_category_${cat}`),
            value: `shop_category_${cat}`,
            default: category === cat,
        }))
    );

    const categoryRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('select_category')
            .setPlaceholder(await t(interaction, 'economy_shop_select_category_placeholder'))
            .addOptions([
                {
                    label: await t(interaction, 'economy_shop_category_all'),
                    value: 'shop_category_all',
                    default: category === 'all',
                },
                ...categoryOptions,
            ])
    );
    const buyOptions = await Promise.all(
        pageItems.map(async (item) => ({
            label: await t(interaction, item.nameKey),
            description: await t(interaction, 'economy_shop_item_price', { price: item.price.toLocaleString() }),
            value: item.id,
            emoji: item.emoji,
        }))
    );

    const buyRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('buy_item')
            .setPlaceholder(await t(interaction, 'economy_shop_buy_placeholder'))
            .setDisabled(pageItems.length === 0)
            .addOptions(buyOptions)
    );

    const navigationRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`shop_nav_first_${category}`)
            .setLabel(await t(interaction, 'economy_shop_nav_first'))
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page <= 1),
        new ButtonBuilder()
            .setCustomId(`shop_nav_prev_${category}`)
            .setLabel(await t(interaction, 'economy_shop_nav_prev'))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page <= 1),
        new ButtonBuilder()
            .setCustomId(`shop_nav_next_${category}`)
            .setLabel(await t(interaction, 'economy_shop_nav_next'))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page >= totalPages),
        new ButtonBuilder()
            .setCustomId(`shop_nav_last_${category}`)
            .setLabel(await t(interaction, 'economy_shop_nav_last'))
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page >= totalPages)
    );

    return [categoryRow, buyRow, navigationRow];
}

// --- COMMAND UTAMA ---
module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('shop').setDescription('🛒 Look and buy items from the shop.'),

    async execute(interaction, container) {
        await interaction.deferReply();
        let user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t(interaction, 'economy_withdraw_no_account_desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        let currentPage = 1;
        let currentCategory = 'all';

        let { embed, pageItems, page, totalPages } = await generateShopEmbed(interaction, user, currentCategory, currentPage);
        let components = await generateActionRows(interaction, page, totalPages, currentCategory, pageItems);

        const message = await interaction.editReply({ embeds: [embed], components: components, fetchReply: true });

        const collector = message.createMessageComponentCollector({ time: 300000 }); // 5 menit

        collector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id) {
                const embed = new EmbedBuilder()
                    .setColor(kythia.bot.color)
                    .setDescription(await t(i, 'economy_shop_not_your_interaction_desc'));
                // .setTimestamp();
                return i.reply({ embeds: [embed], ephemeral: true });
            }
            await i.deferUpdate();

            // Handle select_category, buy_item, navigation
            if (i.customId === 'select_category') {
                const selected = i.values[0];
                currentCategory = selected.replace('shop_category_', '');
                currentPage = 1;
            } else if (i.customId.startsWith('shop_nav_')) {
                const parts = i.customId.split('_');
                const navType = parts[2];
                // category is always at the end
                const navCategory = parts.slice(3).join('_');
                if (navCategory) currentCategory = navCategory;
                if (navType === 'next') currentPage++;
                if (navType === 'prev') currentPage--;
                if (navType === 'first') currentPage = 1;
                if (navType === 'last') {
                    // get totalPages for this category
                    const itemsToShow =
                        currentCategory === 'all'
                            ? allItems.filter((item) => item.buyable)
                            : (shopData[currentCategory] || []).filter((item) => item.buyable);
                    currentPage = Math.max(1, Math.ceil(itemsToShow.length / 5));
                }
            } else if (i.customId === 'buy_item') {
                const itemId = i.values[0];
                const selectedItem = allItems.find((item) => item.id === itemId);

                // --- PERBAIKAN DI SINI ---
                // 1. Ambil nama item yang sudah diterjemahkan
                const translatedItemName = await t(interaction, selectedItem.nameKey);
                // 2. Gabungkan emoji dengan NAMA HASIL TERJEMAHAN
                const itemNameWithEmoji = `${selectedItem.emoji} ${translatedItemName}`;
                // --- SELESAI ---

                user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });

                if (!selectedItem) {
                    const embed = new EmbedBuilder()
                        .setColor(kythia.bot.color)
                        .setDescription(await t(i, 'economy_shop_item_not_found_desc'));
                    // .setTimestamp();
                    return i.followUp({ embeds: [embed], ephemeral: true });
                }
                if (user.cash < selectedItem.price) {
                    const embed = new EmbedBuilder()
                        .setColor(kythia.bot.color)
                        .setDescription(await t(i, 'economy_shop_not_enough_money_desc', { item: itemNameWithEmoji }));
                    // .setTimestamp();
                    return i.followUp({ embeds: [embed], ephemeral: true });
                }

                user.cash -= selectedItem.price;
                await user.saveAndUpdateCache();
                // Simpan ke inventory dengan nama yang sudah ada emojinya
                await Inventory.create({ guildId: user.guildId, userId: user.userId, itemName: itemNameWithEmoji });

                // Tampilkan pesan sukses dengan nama yang benar
                const embed = new EmbedBuilder()
                    .setColor(kythia.bot.color)
                    .setDescription(
                        await t(i, 'economy_shop_buy_success_desc', { item: itemNameWithEmoji, price: selectedItem.price.toLocaleString() })
                    );
                // .setTimestamp();
                await i.followUp({ embeds: [embed], ephemeral: true });
            }

            // Re-generate and edit the message
            user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id }); // Re-fetch user data
            const newShop = await generateShopEmbed(interaction, user, currentCategory, currentPage);
            const newComponents = await generateActionRows(
                interaction,
                newShop.page,
                newShop.totalPages,
                currentCategory,
                newShop.pageItems
            );
            await interaction.editReply({ embeds: [newShop.embed], components: newComponents });
        });

        collector.on('end', async () => {
            await interaction.editReply({ components: [] }).catch(() => {});
        });
    },
};
