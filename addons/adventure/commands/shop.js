/**
 * @namespace: addons/adventure/commands/shop.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    EmbedBuilder,
    MessageFlags,
} = require('discord.js');

const itemsDataFile = require('../helpers/items');
const shopData = itemsDataFile.items;
const allItems = Object.values(shopData).flat();

// Human-friendly number display for gold
function safeLocaleString(value, fallback = '0') {
    return typeof value === 'number' && isFinite(value) ? value.toLocaleString() : fallback;
}

// UI container with header, paged items, and gold display
async function generateShopContainer(interaction, user, category, page, pageItems, componentsBelow = []) {
    const container = interaction.client.container;
    const { t, kythiaConfig, helpers } = container;
    const { convertColor } = helpers.color;

    let goldDisplay = '0';
    if (user && typeof user.gold !== 'undefined' && user.gold !== null) {
        goldDisplay = safeLocaleString(user.gold, '0');
    }

    const headerText = await t(interaction, 'adventure.shop.desc', {
        bot: interaction.client.user.username,
        category: await t(interaction, `adventure.shop.category.${category}`),
        gold: goldDisplay,
    });

    let itemBlocks = [];
    if (pageItems.length === 0) {
        itemBlocks.push(
            new TextDisplayBuilder().setContent(
                `**${await t(interaction, 'adventure.shop.empty.title')}**\n${await t(interaction, 'adventure.shop.empty.desc')}`
            )
        );
    } else {
        for (const item of pageItems) {
            const itemName = await t(interaction, item.nameKey);
            const itemDesc = await t(interaction, item.descKey);
            const priceStr = safeLocaleString(item.price, '?');
            itemBlocks.push(new TextDisplayBuilder().setContent(`**${item.emoji} ${itemName} — 🪙 ${priceStr}**\n\`\`\`${itemDesc}\`\`\``));
        }
    }

    const totalPages = Math.max(
        1,
        Math.ceil(
            (category === 'all' ? allItems.filter((item) => item.buyable) : (shopData[category] || []).filter((item) => item.buyable))
                .length / 5
        )
    );
    page = Math.max(1, Math.min(page, totalPages));

    const footerText = await t(interaction, 'adventure.shop.footer', { page, totalPages });

    const shopContainer = new ContainerBuilder()
        .setAccentColor(convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(headerText))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(...itemBlocks)
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(footerText || ''));

    if (componentsBelow && componentsBelow.length) {
        shopContainer
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
            .addActionRowComponents(...componentsBelow);
    }

    return {
        shopContainer,
        pageItems,
        page,
        totalPages,
    };
}

// Generate dropdowns/buttons for shop UI
async function generateShopComponentRows(interaction, page, totalPages, category, pageItems) {
    const t = interaction.client.container.t;

    const categoryOptions = await Promise.all(
        Object.keys(shopData).map(async (cat) => ({
            label: await t(interaction, `adventure.shop.category.${cat}`),
            value: `shop_category_${cat}`,
            default: category === cat,
        }))
    );

    const rows = [];

    const categoryRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('adventure_shop_category')
            .setPlaceholder(await t(interaction, 'adventure.shop.select.category'))
            .addOptions(categoryOptions)
    );
    rows.push(categoryRow);

    const navButtons = [];
    if (page > 1) {
        navButtons.push(
            new ButtonBuilder()
                .setCustomId('adventure_shop_page_prev')
                .setLabel(await t(interaction, 'common.previous'))
                .setStyle(ButtonStyle.Secondary)
        );
    }

    if (page < totalPages) {
        navButtons.push(
            new ButtonBuilder()
                .setCustomId('adventure_shop_page_next')
                .setLabel(await t(interaction, 'common.next'))
                .setStyle(ButtonStyle.Primary)
        );
    }

    if (navButtons.length > 0) {
        rows.push(new ActionRowBuilder().addComponents(navButtons));
    }

    if (pageItems.length > 0) {
        const itemOptions = await Promise.all(
            pageItems.map(async (item) => ({
                label: await t(interaction, item.nameKey),
                description: await t(interaction, 'adventure.shop.select.option.desc', { price: item.price }),
                value: item.id,
                emoji: item.emoji,
            }))
        );

        rows.push(
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('adventure_shop_select_item')
                    .setPlaceholder(await t(interaction, 'adventure.shop.select.item.placeholder'))
                    .addOptions(itemOptions)
            )
        );
    }

    return rows;
}

// Get list of buyable items in a category and page for display
function getItemsInCategory(category, page = 1, itemsPerPage = 5) {
    const items = category === 'all' ? allItems.filter((item) => item.buyable) : (shopData[category] || []).filter((item) => item.buyable);

    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;

    return {
        items: items.slice(startIdx, endIdx),
        totalItems: items.length,
        totalPages: Math.ceil(items.length / itemsPerPage),
    };
}

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('shop')
            .setNameLocalizations({ id: 'toko', fr: 'boutique', ja: 'ショップ' })
            .setDescription('🛒 Buy items from the adventure shop!')
            .setDescriptionLocalizations({
                id: '🛒 Beli item petualangan di toko',
                fr: "🛒 Achète des objets d'aventure à la boutique !",
                ja: '🛒 冒険アイテムをショップで買おう！',
            })
            .addStringOption((option) =>
                option
                    .setName('category')
                    .setDescription('The category of items to show')
                    .addChoices(
                        { name: 'All', value: 'all' },
                        ...Object.keys(shopData).map((cat) => ({
                            name: cat.charAt(0).toUpperCase() + cat.slice(1),
                            value: cat,
                        }))
                    )
                    .setRequired(false)
            ),

    async execute(interaction, container) {
        // Dependency
        const { t, models, kythiaConfig, helpers } = container;
        const { UserAdventure, InventoryAdventure } = models;
        const { embedFooter } = helpers.discord;
        const { convertColor } = helpers.color;

        await interaction.deferReply();
        const user = await UserAdventure.getCache({ userId: interaction.user.id });

        if (!user) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'adventure.no.character'))
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const category = interaction.options.getString('category') || 'equipment';
        let currentPage = 1;
        const { items: pageItems, totalPages } = getItemsInCategory(category, currentPage, 5);

        const components = await generateShopComponentRows(interaction, currentPage, totalPages, category, pageItems);
        const { shopContainer } = await generateShopContainer(interaction, user, category, currentPage, pageItems, components);

        const replyMessage = await interaction.editReply({
            components: [shopContainer],
            flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
            fetchReply: true,
        });

        const filter = (i) => i.user.id === interaction.user.id;
        const collector = replyMessage.createMessageComponentCollector({ filter, time: 300000 });

        collector.on('collect', async (i) => {
            try {
                await i.deferUpdate();

                let currentCategory = category;
                let userForUpdate = await UserAdventure.getCache({ userId: interaction.user.id });

                if (i.isStringSelectMenu()) {
                    if (i.customId === 'adventure_shop_category') {
                        currentCategory = i.values[0].replace('shop_category_', '');
                        currentPage = 1;
                    } else if (i.customId === 'adventure_shop_select_item') {
                        const itemId = i.values[0];
                        const item = allItems.find((it) => it.id === itemId);

                        if (!item) {
                            return i.followUp({
                                content: await t(interaction, 'adventure.shop.item.not.found'),
                                ephemeral: true,
                            });
                        }

                        if (userForUpdate.gold < item.price) {
                            return i.followUp({
                                content: await t(interaction, 'adventure.shop.not.enough.gold', {
                                    price: item.price,
                                    gold: userForUpdate.gold,
                                    item: await t(interaction, item.nameKey),
                                }),
                                ephemeral: true,
                            });
                        }

                        // Deduct gold and add inventory
                        userForUpdate.gold -= item.price;
                        await InventoryAdventure.create({ userId: userForUpdate.userId, itemName: item.nameKey });

                        await i.followUp({
                            content: await t(interaction, 'adventure.shop.purchase.success', {
                                item: await t(interaction, item.nameKey),
                                price: item.price,
                            }),
                            ephemeral: true,
                        });

                        userForUpdate = await UserAdventure.getCache({ userId: interaction.user.id });
                        currentPage = 1;
                    }
                } else if (i.isButton()) {
                    if (i.customId === 'adventure_shop_page_prev') {
                        currentPage = Math.max(1, currentPage - 1);
                    } else if (i.customId === 'adventure_shop_page_next') {
                        currentPage = currentPage + 1;
                    }
                }

                const { items: newPageItems, totalPages: newTotalPages } = getItemsInCategory(currentCategory, currentPage, 5);
                currentPage = Math.max(1, Math.min(currentPage, newTotalPages));

                const newComponents = await generateShopComponentRows(
                    interaction,
                    currentPage,
                    newTotalPages,
                    currentCategory,
                    newPageItems
                );
                const { shopContainer: newContainer } = await generateShopContainer(
                    interaction,
                    userForUpdate,
                    currentCategory,
                    currentPage,
                    newPageItems,
                    newComponents
                );

                await i.editReply({
                    components: [newContainer],
                    flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                });
            } catch (error) {
                console.error('Error in shop interaction:', error);
                try {
                    await i.followUp({ content: await t(interaction, 'common.error.generic'), ephemeral: true });
                } catch (e) {
                    console.error('Failed to send error followUp:', e);
                }
            }
        });

        collector.on('end', () => {
            const disabledComponents = replyMessage.components.map((row) => {
                const newRow = ActionRowBuilder.from(row);
                newRow.components = newRow.components.map((component) => {
                    if (component instanceof ButtonBuilder) {
                        return ButtonBuilder.from(component).setDisabled(true);
                    } else if (component instanceof StringSelectMenuBuilder) {
                        return StringSelectMenuBuilder.from(component).setDisabled(true);
                    }
                    return component;
                });
                return newRow;
            });

            replyMessage.edit({ components: disabledComponents }).catch(console.error);
        });
    },
};
