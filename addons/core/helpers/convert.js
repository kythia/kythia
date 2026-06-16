/**
 * @namespace: addons/core/helpers/convert.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const fetch = require('node-fetch');

const lengthUnits = {
	m: 1,
	km: 1000,
	ft: 0.3048,
	mi: 1609.34,
	in: 0.0254,
	cm: 0.01,
	mm: 0.001,
	yd: 0.9144,
	nm: 1852,
	au: 1.496e11,
	ly: 9.461e15,
};

const massUnits = {
	kg: 1,
	g: 0.001,
	lb: 0.453592,
	oz: 0.0283495,
	mg: 0.000001,
	ton: 1000,
	st: 6.35029,
	ct: 0.0002,
	slug: 14.5939,
};

const tempUnits = ['c', 'f', 'k', 'r', 're'];

const dataUnits = {
	b: 1,
	kb: 1024,
	mb: 1024 * 1024,
	gb: 1024 ** 3,
	tb: 1024 ** 4,
	pb: 1024 ** 5,
	eb: 1024 ** 6,
	zb: 1024 ** 7,
	yb: 1024 ** 8,
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
	if (from === 'c') c = value;
	else if (from === 'f') c = ((value - 32) * 5) / 9;
	else if (from === 'k') c = value - 273.15;
	else if (from === 'r') c = ((value - 491.67) * 5) / 9;
	else if (from === 're') c = value * 1.25;
	else return null;
	if (to === 'c') return c;
	if (to === 'f') return (c * 9) / 5 + 32;
	if (to === 'k') return c + 273.15;
	if (to === 'r') return ((c + 273.15) * 9) / 5;
	if (to === 're') return c * 0.8;
	return null;
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

async function convertCurrency(container, amount, from, to) {
	const { kythiaConfig, logger } = container;
	const accessKey = kythiaConfig?.addons?.core?.exchangerateApi;
	if (!accessKey) return null;

	const url = `https://api.exchangerate.host/convert?access_key=${encodeURIComponent(accessKey)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${amount}`;
	try {
		const res = await fetch(url);
		if (!res.ok) return null;
		const data = await res.json();
		if (typeof data.result !== 'number') return null;
		return data.result;
	} catch (err) {
		logger.error(`Currency API error: ${err.message || err}`, {
			label: 'convert',
		});
		return null;
	}
}

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

module.exports = {
	convertLength,
	convertMass,
	convertTemperature,
	convertData,
	convertArea,
	convertVolume,
	convertCurrency,
	lengthChoices,
	massChoices,
	tempChoices,
	dataChoices,
	areaChoices,
	volumeChoices,
};
