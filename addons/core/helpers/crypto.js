const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

const SUPPORTED_ALGOS = [
	{ name: 'MD5', value: 'md5' },
	{ name: 'SHA1', value: 'sha1' },
	{ name: 'SHA224', value: 'sha224' },
	{ name: 'SHA256', value: 'sha256' },
	{ name: 'SHA384', value: 'sha384' },
	{ name: 'SHA512', value: 'sha512' },
	{ name: 'SHA3-256', value: 'sha3-256' },
	{ name: 'SHA3-512', value: 'sha3-512' },
	{ name: 'RIPEMD160', value: 'ripemd160' },
];

const SUPPORTED_HASHES = [
	{ name: 'MD5', value: 'md5' },
	{ name: 'SHA1', value: 'sha1' },
	{ name: 'SHA256', value: 'sha256' },
	{ name: 'SHA512', value: 'sha512' },
];

module.exports = {
	ALGORITHM,
	IV_LENGTH,
	AUTH_TAG_LENGTH,
	SUPPORTED_ALGOS,
	SUPPORTED_HASHES,
};
