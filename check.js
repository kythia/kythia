const fs = require('fs');
const path = require('path');

function getObjectPaths(obj, prefix = '') {
	let paths = { branch: [], leaf: [] };
	for (let key in obj) {
		if (typeof obj[key] === 'object' && obj[key] !== null) {
			paths.branch.push(prefix + key);
			let sub = getObjectPaths(obj[key], prefix + key + '.');
			paths.branch.push(...sub.branch);
			paths.leaf.push(...sub.leaf);
		} else {
			paths.leaf.push(prefix + key);
		}
	}
	return paths;
}

function findFiles(dir, ext, fileList = []) {
	const files = fs.readdirSync(dir);
	for (const file of files) {
		const filePath = path.join(dir, file);
		if (fs.statSync(filePath).isDirectory()) {
			findFiles(filePath, ext, fileList);
		} else if (filePath.endsWith(ext)) {
			fileList.push(filePath);
		}
	}
	return fileList;
}

const baseDir = './addons';
const jsonFiles = findFiles(baseDir, '.json').filter(
	(f) => f.includes('lang') || f.includes('locales'),
);

let allBranchKeys = new Set();
let allLeafKeys = new Set();

for (const file of jsonFiles) {
	try {
		const content = JSON.parse(fs.readFileSync(file, 'utf8'));
		const paths = getObjectPaths(content);
		paths.branch.forEach((p) => allBranchKeys.add(p));
		paths.leaf.forEach((p) => allLeafKeys.add(p));
	} catch (e) {
		console.error('Error parsing', file);
	}
}

const jsFiles = findFiles(baseDir, '.js');
const tsFiles = findFiles(baseDir, '.ts');
const codeFiles = [...jsFiles, ...tsFiles];

const regex = /t\([^,]+,\s*(['\"])(.*?)\1/g;
let foundIssues = false;

for (const file of codeFiles) {
	const content = fs.readFileSync(file, 'utf8');
	let match;
	while ((match = regex.exec(content)) !== null) {
		const key = match[2];
		if (allBranchKeys.has(key) && !allLeafKeys.has(key)) {
			console.log('Found branch key usage in:', file);
			console.log('Key used:', key);
			foundIssues = true;
		}
	}
}

if (!foundIssues) {
	console.log('No issues found!');
}
