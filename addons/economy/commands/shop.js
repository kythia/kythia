/**
 * @namespace: addons/economy/commands/shop.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
} = require('discord.js');
const shopData = require('../helpers/items');

const allItems = Object.values(shopData).flat();

function safeLocaleString(value, fallback = '0') {
    return typeof value === 'number' && isFinite(value) ? value.toLocaleString() : fallback;
}

async function generateShopContainer(interaction, user, category, page, pageItems, componentsBelow = []) {
    const { t, kythiaConfig, helpers } = interaction.client.container;

    let cashDisplay = '0';
    if (user && typeof user.kythiaCoin !== 'undefined' && user.kythiaCoin !== null) {
        cashDisplay = safeLocaleString(user.kythiaCoin, '0');
    }
    const headerText = await t(interaction, 'economy.shop.desc', {
        bot: interaction.client.user.username,
        category: category.charAt(0).toUpperCase() + category.slice(1),
        cash: cashDisplay,
    });

    let itemBlocks = [];
    if (pageItems.length === 0) {
        itemBlocks.push(
            new TextDisplayBuilder().setContent(
                `**${await t(interaction, 'economy.shop.empty.title')}**\n${await t(interaction, 'economy.shop.empty.desc')}`
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

    const footerText = await t(interaction, 'economy.shop.footer', { page, totalPages });

    const shopContainer = new ContainerBuilder()
        .setAccentColor(kythiaConfig.bot.color ? parseInt(kythiaConfig.bot.color.replace('#', ''), 16) : undefined)
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(headerText))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(...itemBlocks)
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(footerText ?? ''));

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

async function generateShopComponentRows(interaction, page, totalPages, category, pageItems) {
    const { t } = interaction.client.container;
    const categoryOptions = await Promise.all(
        Object.keys(shopData).map(async (cat) => ({
            label: await t(interaction, `economy.shop.category.${cat}`),
            value: `shop_category_${cat}`,
            default: category === cat,
        }))
    );

    const categoryRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('select_category')
            .setPlaceholder(await t(interaction, 'economy.shop.select.category.placeholder'))
            .addOptions([
                {
                    label: await t(interaction, 'economy.shop.category.all'),
                    value: 'shop_category_all',
                    default: category === 'all',
                },
                ...categoryOptions,
            ])
    );

    const buyOptions = await Promise.all(
        pageItems.map(async (item) => ({
            label: await t(interaction, item.nameKey),
            description: await t(interaction, 'economy.shop.item.price', { price: safeLocaleString(item.price, '?') }),
            value: item.id,
            emoji: item.emoji,
        }))
    );

    const buyRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('buy_item')
            .setPlaceholder(await t(interaction, 'economy.shop.buy.placeholder'))
            .setDisabled(pageItems.length === 0)
            .addOptions(buyOptions)
    );

    const navigationRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`shop_nav_first_${category}`)
            .setLabel(await t(interaction, 'economy.shop.nav.first'))
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page <= 1),
        new ButtonBuilder()
            .setCustomId(`shop_nav_prev_${category}`)
            .setLabel(await t(interaction, 'economy.shop.nav.prev'))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page <= 1),
        new ButtonBuilder()
            .setCustomId(`shop_nav_next_${category}`)
            .setLabel(await t(interaction, 'economy.shop.nav.next'))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page >= totalPages),
        new ButtonBuilder()
            .setCustomId(`shop_nav_last_${category}`)
            .setLabel(await t(interaction, 'economy.shop.nav.last'))
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page >= totalPages)
    );

    return [categoryRow, buyRow, navigationRow];
}

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('shop').setDescription('🛒 Look and buy items from the shop.'),

    async execute(interaction) {
        const { t, kythiaConfig, models } = interaction.client.container;
        const { KythiaUser, Inventory } = models;
        await interaction.deferReply();
        let user = await KythiaUser.getCache({ userId: interaction.user.id });
        if (!user) {
            const errShopContainer = new ContainerBuilder()
                .setAccentColor(kythiaConfig.bot.color ? parseInt(kythiaConfig.bot.color.replace('#', ''), 16) : undefined)
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(interaction, 'economy.withdraw.no.account.desc')))
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(''));
            return interaction.reply({
                components: [errShopContainer],
                ephemeral: true,
                flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
            });
        }

        let currentPage = 1;
        let currentCategory = 'all';
        let itemsToShow =
            currentCategory === 'all'
                ? allItems.filter((item) => item.buyable)
                : (shopData[currentCategory] || []).filter((item) => item.buyable);
        let totalPages = Math.max(1, Math.ceil(itemsToShow.length / 5));
        let pageItems = itemsToShow.slice(0, 5);

        let components = await generateShopComponentRows(interaction, currentPage, totalPages, currentCategory, pageItems);
        let { shopContainer } = await generateShopContainer(interaction, user, currentCategory, currentPage, pageItems, components);

        const message = await interaction.editReply({
            components: [shopContainer],
            flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
            fetchReply: true,
        });

        const collector = message.createMessageComponentCollector({ time: 300000 });

        collector.on('collect', async (i) => {
            const { t, kythia } = interaction.client.container;
            if (i.user.id !== interaction.user.id) {
                const errShopContainer = new ContainerBuilder()
                    .setAccentColor(kythiaConfig.bot.color ? parseInt(kythiaConfig.bot.color.replace('#', ''), 16) : undefined)
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(i, 'economy.shop.not.your.interaction.desc')));
                return i.reply({
                    components: [errShopContainer],
                    ephemeral: true,
                    flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                });
            }
            await i.deferUpdate();

            if (i.customId === 'select_category') {
                const selected = i.values[0];
                currentCategory = selected.replace('shop_category_', '');
                currentPage = 1;
            } else if (i.customId.startsWith('shop_nav_')) {
                const parts = i.customId.split('_');
                const navType = parts[2];
                const navCategory = parts.slice(3).join('_');
                if (navCategory) currentCategory = navCategory;
                if (navType === 'next') currentPage++;
                if (navType === 'prev') currentPage--;
                if (navType === 'first') currentPage = 1;
                if (navType === 'last') {
                    let navItemsToShow =
                        currentCategory === 'all'
                            ? allItems.filter((item) => item.buyable)
                            : (shopData[currentCategory] || []).filter((item) => item.buyable);
                    currentPage = Math.max(1, Math.ceil(navItemsToShow.length / 5));
                }
            } else if (i.customId === 'buy_item') {
                const itemId = i.values[0];
                const selectedItem = allItems.find((item) => item.id === itemId);

                if (!selectedItem) {
                    const errShopContainer = new ContainerBuilder()
                        .setAccentColor(kythiaConfig.bot.color ? parseInt(kythiaConfig.bot.color.replace('#', ''), 16) : undefined)
                        .addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(i, 'economy.shop.item.not.found.desc')));
                    return i.followUp({
                        components: [errShopContainer],
                        ephemeral: true,
                        flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                    });
                }

                const translatedItemName = await t(interaction, selectedItem.nameKey);
                const itemNameWithEmoji = `${selectedItem.emoji} ${translatedItemName}`;

                user = await KythiaUser.getCache({ userId: interaction.user.id });

                if (!user || typeof user.kythiaCoin !== 'number' || isNaN(user.kythiaCoin)) {
                    const errShopContainer = new ContainerBuilder()
                        .setAccentColor(kythiaConfig.bot.color ? parseInt(kythiaConfig.bot.color.replace('#', ''), 16) : undefined)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(
                                await t(i, 'economy.shop.not.enough.money.desc', { item: itemNameWithEmoji })
                            )
                        );
                    return i.followUp({
                        components: [errShopContainer],
                        ephemeral: true,
                        flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                    });
                }

                if (user.kythiaCoin < selectedItem.price) {
                    const errShopContainer = new ContainerBuilder()
                        .setAccentColor(kythiaConfig.bot.color ? parseInt(kythiaConfig.bot.color.replace('#', ''), 16) : undefined)
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(
                                await t(i, 'economy.shop.not.enough.money.desc', { item: itemNameWithEmoji })
                            )
                        );
                    return i.followUp({
                        components: [errShopContainer],
                        ephemeral: true,
                        flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                    });
                }

                user.kythiaCoin = BigInt(user.kythiaCoin) - BigInt(selectedItem.price);

                user.changed('kythiaCoin', true);

                await user.saveAndUpdateCache();

                await Inventory.create({ userId: user.userId, itemName: itemNameWithEmoji });

                const priceStr = safeLocaleString(selectedItem.price, '?');
                const successShopContainer = new ContainerBuilder()
                    .setAccentColor(kythiaConfig.bot.color ? parseInt(kythiaConfig.bot.color.replace('#', ''), 16) : undefined)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            await t(i, 'economy.shop.buy.success.desc', {
                                item: itemNameWithEmoji,
                                price: priceStr,
                            })
                        )
                    );
                await i.followUp({
                    components: [successShopContainer],
                    ephemeral: true,
                    flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                });
            }

            let itemsToShow =
                currentCategory === 'all'
                    ? allItems.filter((item) => item.buyable)
                    : (shopData[currentCategory] || []).filter((item) => item.buyable);
            totalPages = Math.max(1, Math.ceil(itemsToShow.length / 5));
            currentPage = Math.max(1, Math.min(currentPage, totalPages));
            const startIndex = (currentPage - 1) * 5;
            pageItems = itemsToShow.slice(startIndex, startIndex + 5);

            const newComponents = await generateShopComponentRows(interaction, currentPage, totalPages, currentCategory, pageItems);
            const { shopContainer: newShopContainer } = await generateShopContainer(
                interaction,
                await KythiaUser.getCache({ userId: interaction.user.id }),
                currentCategory,
                currentPage,
                pageItems,
                newComponents
            );
            await interaction.editReply({ components: [newShopContainer], flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2 });
        });

        collector.on('end', async () => {
            try {
                await interaction.editReply({ components: [] });
            } catch {}
        });
    },
};
