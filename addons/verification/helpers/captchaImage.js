/**
 * @namespace: addons/verification/helpers/captchaImage.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { createCanvas } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I to avoid confusion

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
	return Math.random() * (max - min) + min;
}

/**
 * Generate a canvas-based distorted image captcha.
 * @returns {{ code: string, attachment: AttachmentBuilder }}
 */
function generateImageCaptcha() {
	const code = Array.from(
		{ length: 6 },
		() => CHARS[randomInt(0, CHARS.length - 1)],
	).join('');

	const W = 280;
	const H = 100;
	const canvas = createCanvas(W, H);
	const ctx = canvas.getContext('2d');

	// Background — subtle gradient
	const bg = ctx.createLinearGradient(0, 0, W, H);
	bg.addColorStop(0, `hsl(${randomInt(200, 240)}, 40%, 92%)`);
	bg.addColorStop(1, `hsl(${randomInt(200, 240)}, 30%, 85%)`);
	ctx.fillStyle = bg;
	ctx.fillRect(0, 0, W, H);

	// Noise dots
	for (let i = 0; i < 200; i++) {
		ctx.fillStyle = `rgba(${randomInt(0, 200)},${randomInt(0, 200)},${randomInt(0, 200)},${randomFloat(0.1, 0.4)})`;
		ctx.beginPath();
		ctx.arc(
			randomInt(0, W),
			randomInt(0, H),
			randomFloat(0.5, 2),
			0,
			Math.PI * 2,
		);
		ctx.fill();
	}

	// Noise lines
	for (let i = 0; i < 8; i++) {
		ctx.strokeStyle = `rgba(${randomInt(0, 180)},${randomInt(0, 180)},${randomInt(0, 180)},${randomFloat(0.2, 0.5)})`;
		ctx.lineWidth = randomFloat(0.5, 2);
		ctx.beginPath();
		ctx.moveTo(randomInt(0, W), randomInt(0, H));
		ctx.bezierCurveTo(
			randomInt(0, W),
			randomInt(0, H),
			randomInt(0, W),
			randomInt(0, H),
			randomInt(0, W),
			randomInt(0, H),
		);
		ctx.stroke();
	}

	// Draw each character slightly rotated and offset
	const charWidth = W / 7;
	const startX = charWidth * 0.5;

	ctx.textBaseline = 'middle';
	ctx.textAlign = 'center';

	for (let i = 0; i < code.length; i++) {
		const char = code[i];
		const x = startX + i * charWidth + randomFloat(-4, 4);
		const y = H / 2 + randomFloat(-8, 8);
		const angle = randomFloat(-0.3, 0.3); // radians
		const size = randomInt(34, 44);

		// Random bold font
		const fonts = ['Impact', 'Arial Black', 'sans-serif'];
		ctx.font = `bold ${size}px ${fonts[randomInt(0, fonts.length - 1)]}`;

		// Random dark color with slight variation
		const hue = randomInt(0, 360);
		const color = `hsl(${hue}, 70%, ${randomInt(15, 35)}%)`;

		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(angle);

		// Shadow for depth
		ctx.shadowColor = `rgba(0,0,0,0.4)`;
		ctx.shadowOffsetX = 2;
		ctx.shadowOffsetY = 2;
		ctx.shadowBlur = 3;

		ctx.fillStyle = color;
		ctx.fillText(char, 0, 0);

		// Optional stroke outline
		ctx.shadowColor = 'transparent';
		ctx.strokeStyle = `hsl(${hue}, 60%, 10%)`;
		ctx.lineWidth = 1;
		ctx.strokeText(char, 0, 0);

		ctx.restore();
	}

	// Overlay sine-wave distortion lines on top of text
	for (let i = 0; i < 4; i++) {
		ctx.strokeStyle = `rgba(${randomInt(0, 120)},${randomInt(0, 120)},${randomInt(0, 120)},0.35)`;
		ctx.lineWidth = randomFloat(1, 2.5);
		ctx.beginPath();
		const freq = randomFloat(0.02, 0.05);
		const amp = randomFloat(8, 18);
		const phase = randomFloat(0, Math.PI * 2);
		for (let x = 0; x < W; x++) {
			const y = H / 2 + amp * Math.sin(freq * x + phase) + randomFloat(-3, 3);
			x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
		}
		ctx.stroke();
	}

	const buffer = canvas.toBuffer('image/png');
	const attachment = new AttachmentBuilder(buffer, { name: 'captcha.png' });

	return { code, attachment };
}

module.exports = { generateImageCaptcha };
