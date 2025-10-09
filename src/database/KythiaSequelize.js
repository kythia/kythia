/**
 * 🧠 Sequelize Connection
 *
 * @file src/database/KythiaSequelize.js
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 *
 * @description
 * Main Sequelize connection factory for the application
 */
const { Sequelize } = require('sequelize');
const logger = require('@utils/logger');
const clc = require('cli-color');

/**
 * 🧩 Initializes and returns a Sequelize instance for connecting to the MySQL database.
 *
 * This instance uses environment variables for configuration, and sets the default
 * charset and collation to support full Unicode (including emoji).
 *
 * @function
 * @returns {Sequelize} Sequelize instance connected to the configured database.
 */

const { DB_DRIVER, DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_STORAGE_PATH, DB_SOCKET_PATH, DB_DIALECT_OPTIONS, DB_SSL } =
    process.env;

const config = {
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASSWORD,
    dialect: DB_DRIVER,
    logging: (sql) => {
        logger.debug(sql);
    },
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
    },
    timezone: kythia.db.timezone || '+00:00',
};

switch (DB_DRIVER) {
    case 'sqlite':
        config.storage = DB_STORAGE_PATH;
        break;

    case 'mysql':
    case 'mariadb':
        config.host = DB_HOST;
        config.port = DB_PORT;
        if (DB_SOCKET_PATH) {
            config.dialectOptions = {
                socketPath: DB_SOCKET_PATH,
            };
        }
        break;

    case 'postgres':
        config.host = DB_HOST;
        config.port = DB_PORT;
        if (DB_SSL === 'true') {
            config.dialectOptions = {
                ssl: {
                    require: true,
                    rejectUnauthorized: false,
                },
            };
        }
        break;

    case 'mssql':
        config.host = DB_HOST;
        config.port = DB_PORT;
        if (DB_DIALECT_OPTIONS) {
            try {
                config.dialectOptions = JSON.parse(DB_DIALECT_OPTIONS);
            } catch (e) {
                logger.error('Error parsing DB_DIALECT_OPTIONS:', e.message);
            }
        }
        break;

    default:
        throw new Error(`${DB_DRIVER} is not supported or not configured.`);
}

const sequelize = new Sequelize(config);

module.exports = sequelize;
