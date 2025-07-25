require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config/config.js');
const logger = require('./utils/logger.js');
const commandHandler = require('./handlers/commandHandler.js');
const eventHandler = require('./handlers/eventHandler.js');
const { keepAlive, startSelfPing } = require('./utils/keepAlive.js');

// Create Discord client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

// Initialize collections
client.commands = new Collection();
client.cooldowns = new Collection();

// Load commands and events
commandHandler.loadCommands(client);
eventHandler.loadEvents(client);

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Start keep-alive system
keepAlive();

// Start self-ping to prevent sleeping
setTimeout(() => {
    startSelfPing();
}, 30000); // Wait 30 seconds after startup

// Login to Discord
client.login(config.DISCORD_TOKEN)
    .then(() => {
        logger.info('Bot đang khởi động...');
    })
    .catch(error => {
        logger.error('Không thể kết nối đến Discord:', error.message || error);
        logger.error('Discord Token length:', config.DISCORD_TOKEN ? config.DISCORD_TOKEN.length : 'undefined');
        logger.error('Full error details:', JSON.stringify(error, null, 2));
        process.exit(1);
    });

module.exports = client;
