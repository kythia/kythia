/**
 * @namespace: addons/core/commands/utils/convert.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { t } = require('@utils/translator');

// --- Helper conversion functions (detailed) ---
const lengthUnits = {
    m: 1,
    km: 1000,
    ft: 0.3048,
    mi: 1609.34,
    in: 0.0254,
    cm: 0.01,
    mm: 0.001,
    yd: 0.9144,
    nm: 1852, // Nautical mile
    au: 1.496e11, // Astronomical unit
    ly: 9.461e15, // Light year
};

const massUnits = {
    kg: 1,
    g: 0.001,
    lb: 0.453592,
    oz: 0.0283495,
    mg: 0.000001,
    ton: 1000,
    st: 6.35029, // Stone
    ct: 0.0002, // Carat
    slug: 14.5939,
};

const tempUnits = ['c', 'f', 'k', 'r', 're']; // Added Rankine and Réaumur

const dataUnits = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
    tb: 1024 * 1024 * 1024 * 1024,
    pb: 1024 * 1024 * 1024 * 1024 * 1024,
    eb: 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
    zb: 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
    yb: 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
    bit: 1 / 8,
};

const areaUnits = {
    sqm: 1,
    sqkm: 1e6,
    sqmi: 2.59e6,
    sqyd: 0.836127,
    sqft: 0.092903,
    sqin: 0.00064516,
    ha: 10000,
    acre: 4046.86,
};

const volumeUnits = {
    l: 1,
    ml: 0.001,
    m3: 1000,
    cm3: 0.001,
    gal: 3.78541,
    qt: 0.946353,
    pt: 0.473176,
    cup: 0.24,
    floz: 0.0295735,
    tbsp: 0.0147868,
    tsp: 0.00492892,
};

function convertLength(value, from, to) {
    if (!(from in lengthUnits) || !(to in lengthUnits)) return null;
    return value * (lengthUnits[from] / lengthUnits[to]);
}

function convertMass(value, from, to) {
    if (!(from in massUnits) || !(to in massUnits)) return null;
    return value * (massUnits[from] / massUnits[to]);
}

function convertTemperature(value, from, to) {
    from = from.toLowerCase();
    to = to.toLowerCase();
    if (!tempUnits.includes(from) || !tempUnits.includes(to)) return null;
    let c;
    // Convert from any to Celsius
    if (from === 'c') c = value;
    else if (from === 'f') c = ((value - 32) * 5) / 9;
    else if (from === 'k') c = value - 273.15;
    else if (from === 'r') c = ((value - 491.67) * 5) / 9;
    else if (from === 're') c = value * 1.25;
    else return null;
    // Convert from Celsius to any
    let result;
    if (to === 'c') result = c;
    else if (to === 'f') result = (c * 9) / 5 + 32;
    else if (to === 'k') result = c + 273.15;
    else if (to === 'r') result = ((c + 273.15) * 9) / 5;
    else if (to === 're') result = c * 0.8;
    else return null;
    return result;
}

function convertData(value, from, to) {
    from = from.toLowerCase();
    to = to.toLowerCase();
    if (!(from in dataUnits) || !(to in dataUnits)) return null;
    return value * (dataUnits[from] / dataUnits[to]);
}

function convertArea(value, from, to) {
    from = from.toLowerCase();
    to = to.toLowerCase();
    if (!(from in areaUnits) || !(to in areaUnits)) return null;
    return value * (areaUnits[from] / areaUnits[to]);
}

function convertVolume(value, from, to) {
    from = from.toLowerCase();
    to = to.toLowerCase();
    if (!(from in volumeUnits) || !(to in volumeUnits)) return null;
    return value * (volumeUnits[from] / volumeUnits[to]);
}

// --- Currency conversion (API) ---
const fetch = require('node-fetch');
async function convertCurrency(amount, from, to) {
    // Use exchangerate.host (free, no key)
    const url = `https://api.exchangerate.host/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${amount}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.result) return null;
    return data.result;
}

// --- Timezone conversion ---
const { DateTime } = require('luxon');
function convertTimezone(time, from, to) {
    // time: "10:00", from: "Asia/Jakarta", to: "America/New_York"
    // Accepts "10:00", "2024-06-01 10:00", etc.
    let dt = DateTime.fromFormat(time, 'HH:mm', { zone: from });
    if (!dt.isValid) dt = DateTime.fromISO(time, { zone: from });
    if (!dt.isValid) return null;
    return dt.setZone(to);
}

// --- Supported units for choices ---
const lengthChoices = [
    { name: 'Meter (m)', value: 'm' },
    { name: 'Kilometer (km)', value: 'km' },
    { name: 'Centimeter (cm)', value: 'cm' },
    { name: 'Millimeter (mm)', value: 'mm' },
    { name: 'Mile (mi)', value: 'mi' },
    { name: 'Yard (yd)', value: 'yd' },
    { name: 'Foot (ft)', value: 'ft' },
    { name: 'Inch (in)', value: 'in' },
    { name: 'Nautical Mile (nm)', value: 'nm' },
    { name: 'Astronomical Unit (au)', value: 'au' },
    { name: 'Light Year (ly)', value: 'ly' },
];
const massChoices = [
    { name: 'Kilogram (kg)', value: 'kg' },
    { name: 'Gram (g)', value: 'g' },
    { name: 'Milligram (mg)', value: 'mg' },
    { name: 'Ton (ton)', value: 'ton' },
    { name: 'Pound (lb)', value: 'lb' },
    { name: 'Ounce (oz)', value: 'oz' },
    { name: 'Stone (st)', value: 'st' },
    { name: 'Carat (ct)', value: 'ct' },
    { name: 'Slug (slug)', value: 'slug' },
];
const tempChoices = [
    { name: 'Celsius (C)', value: 'c' },
    { name: 'Fahrenheit (F)', value: 'f' },
    { name: 'Kelvin (K)', value: 'k' },
    { name: 'Rankine (R)', value: 'r' },
    { name: 'Réaumur (Re)', value: 're' },
];
const dataChoices = [
    { name: 'Byte (B)', value: 'b' },
    { name: 'Kilobyte (KB)', value: 'kb' },
    { name: 'Megabyte (MB)', value: 'mb' },
    { name: 'Gigabyte (GB)', value: 'gb' },
    { name: 'Terabyte (TB)', value: 'tb' },
    { name: 'Petabyte (PB)', value: 'pb' },
    { name: 'Exabyte (EB)', value: 'eb' },
    { name: 'Zettabyte (ZB)', value: 'zb' },
    { name: 'Yottabyte (YB)', value: 'yb' },
    { name: 'Bit (bit)', value: 'bit' },
];
const areaChoices = [
    { name: 'Square Meter (m²)', value: 'sqm' },
    { name: 'Square Kilometer (km²)', value: 'sqkm' },
    { name: 'Square Mile (mi²)', value: 'sqmi' },
    { name: 'Square Yard (yd²)', value: 'sqyd' },
    { name: 'Square Foot (ft²)', value: 'sqft' },
    { name: 'Square Inch (in²)', value: 'sqin' },
    { name: 'Hectare (ha)', value: 'ha' },
    { name: 'Acre (acre)', value: 'acre' },
];
const volumeChoices = [
    { name: 'Liter (L)', value: 'l' },
    { name: 'Milliliter (mL)', value: 'ml' },
    { name: 'Cubic Meter (m³)', value: 'm3' },
    { name: 'Cubic Centimeter (cm³)', value: 'cm3' },
    { name: 'Gallon (gal)', value: 'gal' },
    { name: 'Quart (qt)', value: 'qt' },
    { name: 'Pint (pt)', value: 'pt' },
    { name: 'Cup (cup)', value: 'cup' },
    { name: 'Fluid Ounce (fl oz)', value: 'floz' },
    { name: 'Tablespoon (tbsp)', value: 'tbsp' },
    { name: 'Teaspoon (tsp)', value: 'tsp' },
];

// --- Timezone choices (partial, for demo) ---
const timezoneChoices = [
    { name: 'WIB (Asia/Jakarta)', value: 'Asia/Jakarta' },
    { name: 'WITA (Asia/Makassar)', value: 'Asia/Makassar' },
    { name: 'WIT (Asia/Jayapura)', value: 'Asia/Jayapura' },
    { name: 'UTC', value: 'UTC' },
    { name: 'EST (America/New_York)', value: 'America/New_York' },
    { name: 'PST (America/Los_Angeles)', value: 'America/Los_Angeles' },
    { name: 'CET (Europe/Berlin)', value: 'Europe/Berlin' },
    { name: 'JST (Asia/Tokyo)', value: 'Asia/Tokyo' },
];

// --- Currency choices (partial, for demo) ---
const currencyChoices = [
    { name: 'IDR', value: 'IDR' },
    { name: 'USD', value: 'USD' },
    { name: 'EUR', value: 'EUR' },
    { name: 'JPY', value: 'JPY' },
    { name: 'GBP', value: 'GBP' },
    { name: 'SGD', value: 'SGD' },
    { name: 'AUD', value: 'AUD' },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('convert')
        .setDescription('🔄 Convert between units, currencies, timezones, etc.')
        // Currency
        .addSubcommand((sub) =>
            sub
                .setName('currency')
                .setDescription('💰 Convert currency (e.g. USD to IDR)')
                .addStringOption((opt) =>
                    opt
                        .setName('from')
                        .setDescription('Currency code (e.g. USD)')
                        .setRequired(true)
                        .addChoices(...currencyChoices)
                )
                .addStringOption((opt) =>
                    opt
                        .setName('to')
                        .setDescription('Currency code to convert to (e.g. IDR)')
                        .setRequired(true)
                        .addChoices(...currencyChoices)
                )
                .addNumberOption((opt) => opt.setName('amount').setDescription('Amount to convert').setRequired(true))
        )
        // Timezone
        .addSubcommand((sub) =>
            sub
                .setName('timezone')
                .setDescription('⏰ Convert time between timezones')
                .addStringOption((opt) =>
                    opt
                        .setName('from')
                        .setDescription('From timezone')
                        .setRequired(true)
                        .addChoices(...timezoneChoices)
                )
                .addStringOption((opt) =>
                    opt
                        .setName('to')
                        .setDescription('To timezone')
                        .setRequired(true)
                        .addChoices(...timezoneChoices)
                )
                .addStringOption((opt) => opt.setName('time').setDescription('Time (e.g. 10:00 or 2024-06-01 10:00)').setRequired(true))
        )
        // Length
        .addSubcommand((sub) =>
            sub
                .setName('length')
                .setDescription('📏 Convert length units (e.g. m to km)')
                .addStringOption((opt) =>
                    opt
                        .setName('from')
                        .setDescription('From unit')
                        .setRequired(true)
                        .addChoices(...lengthChoices)
                )
                .addStringOption((opt) =>
                    opt
                        .setName('to')
                        .setDescription('To unit')
                        .setRequired(true)
                        .addChoices(...lengthChoices)
                )
                .addNumberOption((opt) => opt.setName('value').setDescription('Value to convert').setRequired(true))
        )
        // Mass
        .addSubcommand((sub) =>
            sub
                .setName('mass')
                .setDescription('⚖️ Convert mass units (e.g. kg to lb)')
                .addStringOption((opt) =>
                    opt
                        .setName('from')
                        .setDescription('From unit')
                        .setRequired(true)
                        .addChoices(...massChoices)
                )
                .addStringOption((opt) =>
                    opt
                        .setName('to')
                        .setDescription('To unit')
                        .setRequired(true)
                        .addChoices(...massChoices)
                )
                .addNumberOption((opt) => opt.setName('value').setDescription('Value to convert').setRequired(true))
        )
        // Temperature
        .addSubcommand((sub) =>
            sub
                .setName('temperature')
                .setDescription('🌡️ Convert temperature (C, F, K, R, Re)')
                .addStringOption((opt) =>
                    opt
                        .setName('from')
                        .setDescription('From unit')
                        .setRequired(true)
                        .addChoices(...tempChoices)
                )
                .addStringOption((opt) =>
                    opt
                        .setName('to')
                        .setDescription('To unit')
                        .setRequired(true)
                        .addChoices(...tempChoices)
                )
                .addNumberOption((opt) => opt.setName('value').setDescription('Value to convert').setRequired(true))
        )
        // Data Storage
        .addSubcommand((sub) =>
            sub
                .setName('data')
                .setDescription('💾 Convert data storage units (e.g. MB to GB)')
                .addStringOption((opt) =>
                    opt
                        .setName('from')
                        .setDescription('From unit')
                        .setRequired(true)
                        .addChoices(...dataChoices)
                )
                .addStringOption((opt) =>
                    opt
                        .setName('to')
                        .setDescription('To unit')
                        .setRequired(true)
                        .addChoices(...dataChoices)
                )
                .addNumberOption((opt) => opt.setName('value').setDescription('Value to convert').setRequired(true))
        )
        // Area
        .addSubcommand((sub) =>
            sub
                .setName('area')
                .setDescription('🟦 Convert area units (e.g. m² to acre)')
                .addStringOption((opt) =>
                    opt
                        .setName('from')
                        .setDescription('From unit')
                        .setRequired(true)
                        .addChoices(...areaChoices)
                )
                .addStringOption((opt) =>
                    opt
                        .setName('to')
                        .setDescription('To unit')
                        .setRequired(true)
                        .addChoices(...areaChoices)
                )
                .addNumberOption((opt) => opt.setName('value').setDescription('Value to convert').setRequired(true))
        )
        // Volume
        .addSubcommand((sub) =>
            sub
                .setName('volume')
                .setDescription('🧪 Convert volume units (e.g. L to gal)')
                .addStringOption((opt) =>
                    opt
                        .setName('from')
                        .setDescription('From unit')
                        .setRequired(true)
                        .addChoices(...volumeChoices)
                )
                .addStringOption((opt) =>
                    opt
                        .setName('to')
                        .setDescription('To unit')
                        .setRequired(true)
                        .addChoices(...volumeChoices)
                )
                .addNumberOption((opt) => opt.setName('value').setDescription('Value to convert').setRequired(true))
        ),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        await interaction.deferReply({ ephemeral: true });

        if (sub === 'currency') {
            const amount = interaction.options.getNumber('amount');
            const from = interaction.options.getString('from');
            const to = interaction.options.getString('to');
            try {
                const result = await convertCurrency(amount, from, to);
                if (result == null) {
                    const embed = new EmbedBuilder()
                        .setDescription('## ' + (await t(interaction, 'core_utils_convert_currency_failed')))
                        .setColor(0xe17055);
                    return interaction.editReply({ embeds: [embed] });
                }
                const embed = new EmbedBuilder()
                    .setDescription(
                        '## ' +
                            (await t(interaction, 'core_utils_convert_currency_title')) +
                            '\n' +
                            (await t(interaction, 'core_utils_convert_currency_result', {
                                amount: amount,
                                from: from,
                                result: result.toLocaleString(undefined, { maximumFractionDigits: 4 }),
                                to: to,
                            }))
                    )
                    .setColor(0x00b894);
                return interaction.editReply({ embeds: [embed] });
            } catch (e) {
                const embed = new EmbedBuilder()
                    .setDescription('## ' + (await t(interaction, 'core_utils_convert_currency_error')))
                    .setColor(0xe17055);
                return interaction.editReply({ embeds: [embed] });
            }
        } else if (sub === 'timezone') {
            const time = interaction.options.getString('time');
            const from = interaction.options.getString('from');
            const to = interaction.options.getString('to');
            const converted = convertTimezone(time, from, to);
            if (!converted) {
                const embed = new EmbedBuilder()
                    .setDescription('## ' + (await t(interaction, 'core_utils_convert_timezone_failed')))
                    .setColor(0xe17055);
                return interaction.editReply({ embeds: [embed] });
            }
            const embed = new EmbedBuilder()
                .setDescription(
                    '## ' +
                        (await t(interaction, 'core_utils_convert_timezone_title')) +
                        '\n' +
                        (await t(interaction, 'core_utils_convert_timezone_result', {
                            time: time,
                            from: from,
                            converted: converted.toFormat('yyyy-MM-dd HH:mm'),
                            to: to,
                        }))
                )
                .setColor(0x0984e3);
            return interaction.editReply({ embeds: [embed] });
        } else if (sub === 'length') {
            const value = interaction.options.getNumber('value');
            const from = interaction.options.getString('from');
            const to = interaction.options.getString('to');
            const result = convertLength(value, from, to);
            if (result == null) {
                const embed = new EmbedBuilder()
                    .setDescription('## ' + (await t(interaction, 'core_utils_convert_length_failed')))
                    .setColor(0xe17055);
                return interaction.editReply({ embeds: [embed] });
            }
            const embed = new EmbedBuilder()
                .setDescription(
                    '## ' +
                        (await t(interaction, 'core_utils_convert_length_title')) +
                        '\n' +
                        (await t(interaction, 'core_utils_convert_length_result', {
                            value: value,
                            from: from,
                            result: result,
                            to: to,
                        }))
                )
                .setColor(0x6c5ce7);
            return interaction.editReply({ embeds: [embed] });
        } else if (sub === 'mass') {
            const value = interaction.options.getNumber('value');
            const from = interaction.options.getString('from');
            const to = interaction.options.getString('to');
            const result = convertMass(value, from, to);
            if (result == null) {
                const embed = new EmbedBuilder()
                    .setDescription('## ' + (await t(interaction, 'core_utils_convert_mass_failed')))
                    .setColor(0xe17055);
                return interaction.editReply({ embeds: [embed] });
            }
            const embed = new EmbedBuilder()
                .setDescription(
                    '## ' +
                        (await t(interaction, 'core_utils_convert_mass_title')) +
                        '\n' +
                        (await t(interaction, 'core_utils_convert_mass_result', {
                            value: value,
                            from: from,
                            result: result,
                            to: to,
                        }))
                )
                .setColor(0x00b894);
            return interaction.editReply({ embeds: [embed] });
        } else if (sub === 'temperature') {
            const value = interaction.options.getNumber('value');
            const from = interaction.options.getString('from');
            const to = interaction.options.getString('to');
            const result = convertTemperature(value, from, to);
            if (result == null) {
                const embed = new EmbedBuilder()
                    .setDescription('## ' + (await t(interaction, 'core_utils_convert_temperature_failed')))
                    .setColor(0xe17055);
                return interaction.editReply({ embeds: [embed] });
            }
            const embed = new EmbedBuilder()
                .setDescription(
                    '## ' +
                        (await t(interaction, 'core_utils_convert_temperature_title')) +
                        '\n' +
                        (await t(interaction, 'core_utils_convert_temperature_result', {
                            value: value,
                            from: from.toUpperCase(),
                            result: result,
                            to: to.toUpperCase(),
                        }))
                )
                .setColor(0xfdcb6e);
            return interaction.editReply({ embeds: [embed] });
        } else if (sub === 'data') {
            const value = interaction.options.getNumber('value');
            const from = interaction.options.getString('from');
            const to = interaction.options.getString('to');
            const result = convertData(value, from, to);
            if (result == null) {
                const embed = new EmbedBuilder()
                    .setDescription('## ' + (await t(interaction, 'core_utils_convert_data_failed')))
                    .setColor(0xe17055);
                return interaction.editReply({ embeds: [embed] });
            }
            const embed = new EmbedBuilder()
                .setDescription(
                    '## ' +
                        (await t(interaction, 'core_utils_convert_data_title')) +
                        '\n' +
                        (await t(interaction, 'core_utils_convert_data_result', {
                            value: value,
                            from: from.toUpperCase(),
                            result: result,
                            to: to.toUpperCase(),
                        }))
                )
                .setColor(0x636e72);
            return interaction.editReply({ embeds: [embed] });
        } else if (sub === 'area') {
            const value = interaction.options.getNumber('value');
            const from = interaction.options.getString('from');
            const to = interaction.options.getString('to');
            const result = convertArea(value, from, to);
            if (result == null) {
                const embed = new EmbedBuilder().setDescription('## Area conversion failed. Please check your units.').setColor(0xe17055);
                return interaction.editReply({ embeds: [embed] });
            }
            const embed = new EmbedBuilder()
                .setDescription('## Area Conversion\n' + `${value} ${from} = ${result} ${to}`)
                .setColor(0x00cec9);
            return interaction.editReply({ embeds: [embed] });
        } else if (sub === 'volume') {
            const value = interaction.options.getNumber('value');
            const from = interaction.options.getString('from');
            const to = interaction.options.getString('to');
            const result = convertVolume(value, from, to);
            if (result == null) {
                const embed = new EmbedBuilder().setDescription('## Volume conversion failed. Please check your units.').setColor(0xe17055);
                return interaction.editReply({ embeds: [embed] });
            }
            const embed = new EmbedBuilder()
                .setDescription('## Volume Conversion\n' + `${value} ${from} = ${result} ${to}`)
                .setColor(0x81ecec);
            return interaction.editReply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setDescription('## ' + (await t(interaction, 'core_utils_convert_unknown_subcommand')))
                .setColor(0xe17055);
            return interaction.editReply({ embeds: [embed] });
        }
    },
};
