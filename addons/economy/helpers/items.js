/**
 * @namespace: addons/economy/helpers/items.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

// addons/economy/utils/shopItems.js

module.exports = {
    // Kategori: 'utility', 'adventure', 'cosmetic', 'pet'
    utility: [
        {
            id: 'laptop_tech',
            emoji: '💻',
            nameKey: 'shop.items.laptop_tech.name',
            descKey: 'shop.items.laptop_tech.description',
            price: 2500,
            buyable: true,
            sellPrice: 1250,
        },
        {
            id: 'smartphone_tech',
            emoji: '📱',
            nameKey: 'shop.items.smartphone_tech.name',
            descKey: 'shop.items.smartphone_tech.description',
            price: 5000,
            buyable: true,
            sellPrice: 2500,
        },
        {
            id: 'pcdesktop_tech',
            emoji: '🖥️',
            nameKey: 'shop.items.pcdesktop_tech.name',
            descKey: 'shop.items.pcdesktop_tech.description',
            price: 7500,
            buyable: true,
            sellPrice: 3750,
        },
        {
            id: 'car_vehicle',
            emoji: '🚗',
            nameKey: 'shop.items.car_vehicle.name',
            descKey: 'shop.items.car_vehicle.description',
            price: 15000,
            buyable: true,
            sellPrice: 7500,
        },
        {
            id: 'house_property',
            emoji: '🏠',
            nameKey: 'shop.items.house_property.name',
            descKey: 'shop.items.house_property.description',
            price: 100000,
            buyable: true,
            sellPrice: 50000,
        },
        {
            id: 'company_property',
            emoji: '🏢',
            nameKey: 'shop.items.company_property.name',
            descKey: 'shop.items.company_property.description',
            price: 250000,
            buyable: true,
            sellPrice: 125000,
        },
    ],
    robbing: [
        {
            id: 'poison_item',
            emoji: '🧪',
            nameKey: 'shop.items.poison_item.name',
            descKey: 'shop.items.poison_item.description',
            price: 250,
            buyable: true,
            sellPrice: 100,
        },
        {
            id: 'guard_item',
            emoji: '🚓',
            nameKey: 'shop.items.guard_item.name',
            descKey: 'shop.items.guard_item.description',
            price: 200,
            buyable: true,
            sellPrice: 80,
        },
    ],
    pet: [
        {
            id: 'petfood_item',
            emoji: '🍪',
            nameKey: 'shop.items.petfood_item.name',
            descKey: 'shop.items.petfood_item.description',
            price: 100,
            buyable: true,
            sellPrice: 50,
        },
    ],
};
