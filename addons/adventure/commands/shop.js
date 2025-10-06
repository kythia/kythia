/**
 * @namespace: addons/adventure/commands/shop.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const Inventory = require('../database/models/InventoryAdventure');
const User = require('../database/models/UserAdventure');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('shop')
            .setNameLocalizations({ id: 'toko', fr: 'boutique', ja: 'ショップ' })
            .setDescription('🛒 Buy items from the shop!')
            .setDescriptionLocalizations({
                id: '🛒 Beli item di toko',
                fr: '🛒 Achète des objets à la boutique !',
                ja: '🛒 ショップでアイテムを買おう！',
            }),
    guildOnly: true,
    async execute(interaction) {
        await interaction.deferReply();
        const user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });

        if (!user) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'adventure_no_character'))
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const items = [
            {
                name: '🛡️ Shield',
                price: 10,
                descriptionKey: 'adventure_shop_item_shield_desc',
                labelKey: 'adventure_shop_item_shield_label',
            },
            {
                name: '⚔️ Sword',
                price: 15,
                descriptionKey: 'adventure_shop_item_sword_desc',
                labelKey: 'adventure_shop_item_sword_label',
            },
            {
                name: '🥋 Armor',
                price: 30,
                descriptionKey: 'adventure_shop_item_armor_desc',
                labelKey: 'adventure_shop_item_armor_label',
            },
            {
                name: '🍶 Revival',
                price: 35,
                descriptionKey: 'adventure_shop_item_revival_desc',
                labelKey: 'adventure_shop_item_revival_label',
            },
        ];

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(await t(interaction, 'adventure_shop_welcome'))
            .setFooter({
                text: await t(interaction, 'adventure_shop_gold_footer', { gold: user.gold }),
                iconURL: interaction.client.user.displayAvatarURL(),
            });

        for (const item of items) {
            embed.addFields({
                name: `> ${await t(interaction, item.labelKey)} - ${item.price} 🪙`,
                value: await t(interaction, item.descriptionKey),
                inline: false,
            });
        }

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_item_adventure')
                .setPlaceholder(await t(interaction, 'adventure_shop_select_placeholder'))
                .addOptions(
                    await Promise.all(
                        items.map(async (item) => ({
                            label: await t(interaction, item.labelKey),
                            description: await t(interaction, 'adventure_shop_select_option_desc', { price: item.price }),
                            value: item.name.toLowerCase(),
                        }))
                    )
                )
        );

        const replyMessage = await interaction.editReply({ embeds: [embed], components: [row] });

        const filter = (i) => i.user.id === interaction.user.id;
        const collector = replyMessage.createMessageComponentCollector({ filter, time: 60000 });

        let purchased = false;

        collector.on('collect', async (i) => {
            if (i.customId === 'select_item_adventure') {
                await i.deferUpdate();
                const selectedItem = items.find((item) => item.name.toLowerCase() === i.values[0]);
                if (!selectedItem) return;

                if (user.gold < selectedItem.price) {
                    const noGoldEmbed = new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(
                            await t(interaction, 'adventure_shop_not_enough_gold', {
                                price: selectedItem.price,
                                item: await t(interaction, selectedItem.labelKey),
                                gold: user.gold,
                            })
                        )
                        .setFooter({ text: await t(interaction, 'adventure_shop_not_enough_gold_footer') });
                    await interaction.editReply({ embeds: [noGoldEmbed], components: [] });
                    return;
                }

                const confirmEmbed = new EmbedBuilder()
                    .setColor(kythia.bot.color)
                    .setDescription(
                        await t(interaction, 'adventure_shop_confirm_purchase', {
                            item: await t(interaction, selectedItem.labelKey),
                            price: selectedItem.price,
                        })
                    )
                    .setFooter({ text: await t(interaction, 'adventure_shop_gold_footer', { gold: user.gold }) });

                const confirmRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirm_purchase_adventure')
                        .setLabel(await t(interaction, 'adventure_shop_confirm_button'))
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('cancel_purchase_adventure')
                        .setLabel(await t(interaction, 'adventure_shop_cancel_button'))
                        .setStyle(ButtonStyle.Danger)
                );

                const confirmationMessage = await interaction.editReply({ embeds: [confirmEmbed], components: [confirmRow] });

                const confirmationFilter = (btn) => btn.user.id === interaction.user.id;
                const confirmationCollector = confirmationMessage.createMessageComponentCollector({
                    filter: confirmationFilter,
                    time: 15000,
                    max: 1,
                });

                confirmationCollector.on('collect', async (btn) => {
                    await btn.deferUpdate();
                    if (btn.customId === 'confirm_purchase_adventure') {
                        user.gold -= selectedItem.price;
                        await user.saveAndUpdateCache();

                        await Inventory.create({
                            guildId: user.guildId,
                            userId: user.userId,
                            itemName: selectedItem.name,
                        });
                        await Inventory.clearCache({ userId: user.userId });

                        const successEmbed = new EmbedBuilder()
                            .setColor(kythia.bot.color)
                            .setDescription(
                                await t(interaction, 'adventure_shop_purchase_success', {
                                    item: await t(interaction, selectedItem.labelKey),
                                    price: selectedItem.price,
                                })
                            )
                            .setFooter({ text: await t(interaction, 'adventure_shop_gold_footer', { gold: user.gold }) });

                        await interaction.editReply({ embeds: [successEmbed], components: [] });

                        purchased = true;
                        collector.stop('purchased');
                    } else if (btn.customId === 'cancel_purchase_adventure') {
                        const cancelEmbed = new EmbedBuilder()
                            .setColor(kythia.bot.color)
                            .setDescription(
                                await t(interaction, 'adventure_shop_purchase_cancelled', {
                                    item: await t(interaction, selectedItem.labelKey),
                                })
                            )
                            .setFooter(await embedFooter(interaction));
                        await interaction.editReply({ embeds: [cancelEmbed], components: [] });
                    }
                });
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason !== 'purchased') {
                const timeoutEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(await t(interaction, 'adventure_shop_timeout'))
                    .setFooter(await embedFooter(interaction));
                interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
            }
        });
    },
};
