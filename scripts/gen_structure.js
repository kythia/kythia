/**
 * @namespace: scripts/gen_structure.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

/**
 * 📄 Generate Project Structure Markdown
 *
 * @file scripts/gen_structure.js
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 *
 * @description
 * This script scans the project directory and generates a Markdown file
 * representing the folder and file structure of the project.
 *
 * ✨ Core Features:
 * - Recursively traverses the project directory.
 * - Excludes common build, config, and dependency folders.
 * - Outputs a tree-like structure to temp/structure.md.
 * - Ensures the temp directory exists before writing.
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'temp');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'structure.md');
const EXCLUDE = ['.git', '.vscode', 'vendor', 'storage', 'dist', 'node_modules', 'logs', '.husky'];

function generateTree(dir, prefix = '') {
    const items = fs.readdirSync(dir).filter((item) => !EXCLUDE.includes(item));
    let tree = '';

    items.forEach((item, index) => {
        const fullPath = path.join(dir, item);
        const isLast = index === items.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        tree += `${prefix}${connector}${item}\n`;

        if (fs.statSync(fullPath).isDirectory()) {
            tree += generateTree(fullPath, prefix + (isLast ? '    ' : '│   '));
        }
    });

    return tree;
}

const targetDir = path.join(__dirname, '..');
const tree = generateTree(targetDir);

// Ensure temp directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Write to file
fs.writeFileSync(OUTPUT_FILE, tree, 'utf8');
console.log(`✅ Project structure saved to ${OUTPUT_FILE}`);
