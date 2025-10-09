/**
 * 🧠 Smart Sequelize Sync Utility
 *
 * @file src/database/KythiaORM.js
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 *
 * @description
 * A utility for intelligent, hash-based syncing of Sequelize models.
 * Only models with schema changes are synced, minimizing downtime and risk.
 *
 * ✨ Core Features:
 * - Per-model schema hashing for change detection.
 * - Selective, safe syncing (avoids unnecessary ALTERs).
 * - Designed for production safety and speed.
 * - No destructive operations; only additive/compatible changes are auto-applied.
 * - Detailed logging for each sync operation.
 */
const sequelize = require('./KythiaSequelize');
const KythiaModel = require('./KythiaModel');
const logger = require('@utils/logger');
const readline = require('readline');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

/**
 * 🧬 generateModelHash
 *
 * Generates a unique, deterministic hash for a single Sequelize model's schema definition.
 *
 * - **Purpose:**
 *   Detects changes in a model's structure (attributes, associations, indexes) so that only changed models are synced.
 *
 * - **How it works:**
 *   1. **Attributes:**
 *      - Iterates all model attributes, sorts them, and serializes their type, nullability, primary/unique status.
 *      - Handles Sequelize's type objects robustly (tries `.toSql()`, then `.toString()`, else "UnknownType").
 *   2. **Associations:**
 *      - Serializes all associations (type, alias, target model, foreign key), sorted by alias.
 *   3. **Indexes:**
 *      - Serializes all indexes (name, fields, uniqueness), sorted by name.
 *   4. **Table Name:**
 *      - Ensures table name is always a string.
 *   5. **Hashing:**
 *      - Concatenates all above into a single string, then hashes with MD5 (first 10 chars).
 *
 * - **Why:**
 *   This ensures that any schema change (even subtle) will result in a new hash, triggering a sync for that model only.
 *
 * @param {import('sequelize').ModelCtor} model - The Sequelize model to hash.
 * @returns {string} - A short MD5 hash representing the model's schema state.
 */
function generateModelHash(model) {
    // 1. Hashing Attributes
    const attributes = Object.entries(model.rawAttributes)
        .sort()
        .map(([attrName, attr]) => {
            let typeString;
            try {
                if (typeof attr.type?.toSql === 'function') {
                    try {
                        typeString = attr.type.toSql({});
                    } catch (e) {
                        typeString = attr.type.toString();
                    }
                } else if (typeof attr.type?.toString === 'function') {
                    typeString = attr.type.toString();
                } else {
                    typeString = 'UnknownType';
                }
            } catch (err) {
                typeString = 'UnknownType';
            }
            return `${attrName}:${typeString}:${!!attr.allowNull}:${!!attr.primaryKey}:${!!attr.unique}`;
        })
        .join(',');

    // 2. Hashing Associations (dependency-aware)
    const associations = Object.values(model.associations)
        .sort((a, b) => a.as.localeCompare(b.as))
        .map((assoc) => `${assoc.associationType}:${assoc.as}:${assoc.target.name}:${assoc.foreignKey}`)
        .join(',');

    // 3. Hashing Indexes
    const indexes = (model.options.indexes || [])
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        .map((idx) => {
            const fields = idx.fields.join(',');
            return `${idx.name || fields}:${fields}:${!!idx.unique}`;
        })
        .join(',');

    let tableName = model.getTableName();
    if (typeof tableName === 'object') tableName = tableName.tableName;

    const definitionString = `${tableName}:{attr:{${attributes}},assoc:{${associations}},idx:{${indexes}}}`;
    return crypto.createHash('md5').update(definitionString).digest('hex').substring(0, 10);
}

/**
 * 📦 loadAllAddonModels
 *
 * Dynamically loads all Sequelize models from every addon's `database/models` directory.
 *
 * - **Purpose:**
 *   Ensures that all models from all installed addons are registered with Sequelize before syncing.
 *
 * - **How it works:**
 *   1. Looks for the `addons` directory in the given root.
 *   2. For each addon folder, checks for a `database/models` subdirectory.
 *   3. Requires every `.js` file in that directory, which should register the model with Sequelize.
 *   4. Logs each loaded model for visibility.
 *
 * - **Why:**
 *   This allows the system to support modular, pluggable features (addons) with their own database models.
 *
 * @param {string} rootDir - The root directory of the project.
 */
function loadAllAddonModels(rootDir) {
    const addonsDir = path.join(rootDir, 'addons');
    if (!fs.existsSync(addonsDir)) return;

    const addonFolders = fs
        .readdirSync(addonsDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    for (const addonName of addonFolders) {
        const modelsDir = path.join(addonsDir, addonName, 'database', 'models');
        if (fs.existsSync(modelsDir) && fs.statSync(modelsDir).isDirectory()) {
            logger.info(`📂 Loading models from addon: ${addonName}`);
            const files = fs.readdirSync(modelsDir).filter((file) => file.endsWith('.js'));
            for (const file of files) {
                const modelPath = path.join(modelsDir, file);
                logger.info(`  └─> Initializing model: ${file}`);
                require(modelPath);
            }
        }
    }
}

/**
 * Helper: Interactive prompt for production force sync
 * @returns {Promise<boolean>}
 */
function askForProductionSyncConfirmation(changedModels) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        logger.warn('\n==================== 🚨 PRODUCTION WARNING 🚨 ====================');
        logger.warn(`Database schema for [${changedModels}] is OUT OF DATE.`);
        logger.warn('You are about to ALTER tables in PRODUCTION.');
        logger.warn('This operation may be risky. Please ensure you have a backup.');
        logger.warn('==================================================================');
        rl.question('Do you want to continue with force sync? (y/N): ', (answer) => {
            rl.close();
            const normalized = answer.trim().toLowerCase();
            if (normalized === 'y' || normalized === 'yes') {
                resolve(true);
            } else {
                logger.error('❌ Force sync aborted by user.');
                resolve(false);
            }
        });
    });
}

/**
 * Helper: Interactive prompt for destructive changes (column removal)
 * @returns {Promise<boolean>}
 */
function askForDestructiveChangeConfirmation(modelName, droppedColumns) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        logger.error(`\n==================== ⚠️ DANGEROUS CHANGE WARNING ⚠️ ====================`);
        logger.error(`Model '${modelName}' detected potential COLUMN REMOVAL:`);
        logger.error(` -> ${droppedColumns.join(', ')}`);
        logger.error('\nThese columns exist in the database but are not found in the latest model file.');
        logger.error('To prevent data loss, automatic sync is blocked by default.');
        logger.error('\nSOLUTION:');
        logger.error('1. If this is a mistake, fix your model file to include these columns.');
        logger.error('2. If you are SURE you want to remove these columns, you can continue, but data will be lost.');
        logger.error('================================================================================\n');
        rl.question('Do you want to continue with this destructive change? (y/N): ', (answer) => {
            rl.close();
            const normalized = answer.trim().toLowerCase();
            if (normalized === 'y' || normalized === 'yes') {
                logger.warn('⚠️  Proceeding with destructive change as requested by user.');
                resolve(true);
            } else {
                logger.error('❌ Destructive change aborted by user.');
                resolve(false);
            }
        });
    });
}

/**
 * 🚨 Safety Net: Pengecekan Perubahan Destruktif
 *
 * Membandingkan skema model di kode dengan skema di database.
 * Jika ada kolom yang ada di DB tapi tidak ada di model (potensi DROP COLUMN),
 * proses akan berhenti dengan pesan error yang jelas, atau bertanya ke user jika di production.
 *
 * @param {import('sequelize').ModelCtor} model - Model Sequelize yang akan dicek.
 * @returns {Promise<boolean>} - true jika aman lanjut, false jika user abort.
 */
async function checkForDestructiveChanges(model) {
    const isProduction = kythia.env === 'production';
    const queryInterface = sequelize.getQueryInterface();
    const tableName = model.getTableName();

    try {
        const dbSchema = await queryInterface.describeTable(tableName);
        const dbColumns = Object.keys(dbSchema);
        const modelColumns = new Set(Object.keys(model.rawAttributes));
        const droppedColumns = dbColumns.filter((col) => !modelColumns.has(col));

        if (isProduction && droppedColumns.length > 0) {
            // Tanyakan ke user, bukan langsung exit
            const proceed = await askForDestructiveChangeConfirmation(model.name, droppedColumns);
            if (!proceed) {
                process.exit(1);
            }
            // else lanjut saja
        }

        // Jika tidak ada destructive change, atau user setuju, lanjut
        return true;
    } catch (error) {
        // Inilah bagian yang di-upgrade!
        // Cek jika errornya adalah "table doesn't exist", baik dari pesan error Sequelize atau error code asli dari MySQL.
        const isTableNotFoundError =
            (error.name === 'SequelizeDatabaseError' && error.original && error.original.code === 'ER_NO_SUCH_TABLE') ||
            (typeof error.message === 'string' && error.message.match(/table.*?doesn't exist/i)) ||
            (typeof error.message === 'string' && error.message.match(/^No description found for/i));

        if (isTableNotFoundError) {
            logger.info(` -> Table '${tableName}' not found, will be created.`);
            // Karena tabel belum ada, tidak ada perubahan destruktif.
            // Kita tidak perlu melakukan apa-apa di sini, biarkan KythiaORM yang melakukan model.sync() nanti.
            return true; // Cukup kembalikan dan lanjutkan proses
        }

        // Untuk error lain yang tidak terduga, kita tetap lemparkan
        logger.error(`❌ Error when checking for destructive changes in model '${model.name}':`, error);
        throw error;
    }
}

/**
 * 🧠 KythiaORM
 *
 * Intelligently synchronizes the database schema on a per-model basis, only syncing models whose schema has changed.
 *
 * - **Purpose:**
 *   Avoids unnecessary full-database syncs by tracking a hash of each model's schema.
 *   Only models with a changed hash are synced, making migrations safer and faster.
 *
 * - **How it works:**
 *   1. Loads all addon models so Sequelize knows about every model.
 *   2. Ensures a `model_versions` table exists to track each model's last known schema hash.
 *   3. For each model:
 *      - Computes its current schema hash.
 *      - Compares to the hash stored in `model_versions`.
 *      - If different, adds to the sync list.
 *   4. If any models need syncing:
 *      - In **production**, refuses to sync unless `options.force` is true (safety net).
 *      - Otherwise, syncs each changed model with `{ alter: true }`.
 *      - Updates the hash in `model_versions` for each synced model (UPSERT).
 *   5. Logs the result.
 *
 * - **Why:**
 *   This approach minimizes risk in production, speeds up development, and makes schema management more robust.
 *
 * @param {object} [options] - Options for the sync.
 * @param {boolean} [options.force=false] - Force sync in production mode.
 */
async function KythiaORM(client, options = { force: false }) {
    try {
        const rootDir = path.join(__dirname, '..', '..');
        loadAllAddonModels(rootDir);

        KythiaModel.attachHooksToAllModels(sequelize, client);

        const isProduction = kythia.env === 'production';
        const versionTable = 'model_versions';

        // Create the model_versions table if it doesn't exist
        await sequelize.query(`CREATE TABLE IF NOT EXISTS ${versionTable} (
            model_name VARCHAR(255) PRIMARY KEY,
            hash VARCHAR(50) NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`);

        // Fetch all current model hashes from DB
        const [dbVersions] = await sequelize.query(`SELECT model_name, hash FROM ${versionTable}`);
        const dbVersionsMap = new Map(dbVersions.map((row) => [row.model_name, row.hash]));

        const modelsToSync = [];
        const allModels = Object.values(sequelize.models);

        for (const model of allModels) {
            const newHash = generateModelHash(model);
            const currentHash = dbVersionsMap.get(model.name);

            if (newHash !== currentHash) {
                // !! INI DIA UPGRADENYA !!
                // Sebelum memasukkan model ke daftar sync, cek dulu keamanannya.
                const safe = await checkForDestructiveChanges(model);
                if (!safe) {
                    // Sudah di-handle di checkForDestructiveChanges (exit), tapi jaga-jaga
                    continue;
                }
                modelsToSync.push({ model, newHash });
            }
        }

        if (modelsToSync.length > 0) {
            const changedModels = modelsToSync.map((m) => m.model.name).join(', ');
            logger.warn(`🔄 Schema change detected for models: ${changedModels}`);

            // Interactive safety net for production
            if (isProduction && !options.force) {
                // Interactive prompt
                const proceed = await askForProductionSyncConfirmation(changedModels);
                if (!proceed) {
                    process.exit(1);
                }
            }

            logger.info(
                `[${isProduction ? (options.force ? 'FORCED SYNC' : 'PRODUCTION SYNC') : 'DEV MODE'}] Syncing ${modelsToSync.length} model(s)...`
            );

            for (const { model, newHash } of modelsToSync) {
                logger.info(`  -> Syncing ${model.name}...`);
                await model.sync({ alter: true });

                // Update hash in DB for this model (UPSERT)
                await sequelize.query(
                    `INSERT INTO ${versionTable} (model_name, hash) VALUES (?, ?)
                     ON DUPLICATE KEY UPDATE hash = ?`,
                    { replacements: [model.name, newHash, newHash] }
                );
            }
            logger.info('✅ Database successfully synced!');
        } else {
            logger.info('💾 All model schemas are up to date.');
        }

        return sequelize;
    } catch (err) {
        // Custom error log for missing table description
        if (err && typeof err.message === 'string' && err.message.match(/^No description found for "?(.+?)"? table/i)) {
            logger.error(
                '❌ An error occurred during the smart sync process: ' +
                    err.message +
                    ' Check the table name and schema; remember, they _are_ case sensitive.'
            );
        } else {
            logger.error('❌ An error occurred during the smart sync process:', err);
        }
    }
}

module.exports = KythiaORM;
