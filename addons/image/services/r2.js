/**
 * @namespace: addons/image/services/r2.js
 * @type: Service
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 *
 * Cloudflare R2 Storage Service
 * Uses the S3 compatibility API via @aws-sdk/client-s3.
 * Docs: https://developers.cloudflare.com/r2/api/s3/api/
 *
 * Credentials are sourced from kythiaConfig.addons.image (passed in by the caller).
 * Configure them in kythia.config.js under addons.image:
 *
 *   addons: {
 *     image: {
 *       // ← Your Cloudflare Account ID
 *       // Found at: https://dash.cloudflare.com → right sidebar → Account ID
 *       accountId: 'your-cloudflare-account-id',
 *
 *       // ← R2 API Token Access Key ID
 *       // Generated at: Cloudflare Dashboard → R2 → Manage R2 API Tokens
 *       accessKeyId: 'your-r2-access-key-id',
 *
 *       // ← R2 API Token Secret Access Key
 *       secretAccessKey: 'your-r2-secret-access-key',
 *
 *       // ← The name of your R2 bucket
 *       bucketName: 'your-bucket-name',
 *
 *       // ← Public base URL for your bucket (no trailing slash)
 *       // Either a custom domain:  'https://img.example.com'
 *       // Or the R2.dev URL:       'https://pub-xxxx.r2.dev'
 *       publicUrl: 'https://pub-xxxx.r2.dev',
 *     },
 *   },
 */

const {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const path = require('node:path');

/**
 * Map common image file extensions to their MIME types.
 * Ensures the file renders correctly in the browser rather than being downloaded.
 *
 * @param {string} filename - Original filename (e.g. "photo.jpg")
 * @returns {string} MIME type string
 */
function getContentType(filename) {
	const ext = path.extname(filename).toLowerCase();

	const mimeTypes = {
		'.jpg': 'image/jpeg',
		'.jpeg': 'image/jpeg',
		'.png': 'image/png',
		'.gif': 'image/gif',
		'.webp': 'image/webp',
		'.svg': 'image/svg+xml',
		'.bmp': 'image/bmp',
		'.tiff': 'image/tiff',
		'.tif': 'image/tiff',
		'.ico': 'image/x-icon',
		'.avif': 'image/avif',
	};

	return mimeTypes[ext] ?? 'application/octet-stream';
}

/**
 * Build an S3Client pointed at the Cloudflare R2 endpoint.
 *
 * @param {{ accountId: string, accessKeyId: string, secretAccessKey: string }} config
 * @returns {S3Client}
 */
function createR2Client(config) {
	const { accountId, accessKeyId, secretAccessKey } = config;

	if (!accountId)
		throw new Error('kythiaConfig.addons.image.accountId is not set.');
	if (!accessKeyId)
		throw new Error('kythiaConfig.addons.image.accessKeyId is not set.');
	if (!secretAccessKey)
		throw new Error('kythiaConfig.addons.image.secretAccessKey is not set.');

	return new S3Client({
		// Cloudflare R2 S3-compatible endpoint:
		// https://<ACCOUNT_ID>.r2.cloudflarestorage.com
		endpoint: `https://${accountId}.r2.cloudflarestorage.com`,

		// R2 is region-agnostic; "auto" is the correct value.
		region: 'auto',

		credentials: { accessKeyId, secretAccessKey },
	});
}

/**
 * Upload an image Buffer to Cloudflare R2.
 *
 * @param {Buffer} buffer          - Raw image data to upload
 * @param {string} key             - Object key to store under in the bucket (e.g. "images/<userId>/<uuid>.png")
 * @param {string} originalName    - Original filename, used to derive ContentType
 * @param {object} config          - kythiaConfig.addons.image
 * @param {string} config.accountId
 * @param {string} config.accessKeyId
 * @param {string} config.secretAccessKey
 * @param {string} config.bucketName
 * @param {string} config.publicUrl
 * @returns {Promise<{ key: string, publicUrl: string }>}
 */
async function uploadToR2(buffer, key, originalName, config) {
	const { bucketName, publicUrl: rawPublicUrl } = config;
	const publicUrlBase = (rawPublicUrl || '').replace(/\/$/, '');

	if (!bucketName)
		throw new Error('kythiaConfig.addons.image.bucketName is not set.');
	if (!publicUrlBase)
		throw new Error('kythiaConfig.addons.image.publicUrl is not set.');

	const client = createR2Client(config);
	const contentType = getContentType(originalName);

	await client.send(
		new PutObjectCommand({
			Bucket: bucketName,
			Key: key, // Object key inside the bucket
			Body: buffer, // Raw Buffer from the Discord attachment download
			ContentType: contentType, // Ensures the browser renders the image, not downloads it
		}),
	);

	return { key, publicUrl: `${publicUrlBase}/${key}` };
}

/**
 * Delete an object from Cloudflare R2 by its key.
 *
 * @param {string} key     - Object key inside the bucket (e.g. "images/<userId>/<uuid>.png")
 * @param {object} config  - kythiaConfig.addons.image
 * @param {string} config.accountId
 * @param {string} config.accessKeyId
 * @param {string} config.secretAccessKey
 * @param {string} config.bucketName
 * @returns {Promise<void>}
 */
async function deleteFromR2(key, config) {
	const { bucketName } = config;

	if (!bucketName)
		throw new Error('kythiaConfig.addons.image.bucketName is not set.');

	const client = createR2Client(config);

	await client.send(
		new DeleteObjectCommand({
			Bucket: bucketName,
			Key: key,
		}),
	);
}

module.exports = { uploadToR2, deleteFromR2, getContentType };
