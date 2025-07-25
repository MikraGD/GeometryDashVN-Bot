const express = require('express');
const logger = require('./logger');

// Create a simple web server to keep the bot alive
function keepAlive() {
    const app = express();
    const port = process.env.KEEP_ALIVE_PORT || 3000;

    // Public health check endpoint (basic info only)
    app.get('/', (req, res) => {
        res.status(200).json({
            status: 'alive',
            message: 'GDVN Bot is running!',
            version: '1.0.0',
            uptime_hours: Math.floor(process.uptime() / 3600),
            timestamp: new Date().toISOString()
        });
    });

    // Public status endpoint (basic info only)
    app.get('/status', (req, res) => {
        res.status(200).json({
            bot: 'GDVN Bot',
            status: 'online',
            uptime_hours: Math.floor(process.uptime() / 3600),
            version: '1.0.0',
            features: ['Discord Bot', 'Geometry Dash Community'],
            message: 'Use /botstatus command in Discord for detailed admin info'
        });
    });

    // Ping endpoint for external monitoring
    app.get('/ping', (req, res) => {
        res.status(200).send('pong');
    });

    // Start the keep-alive server
    const server = app.listen(port, '0.0.0.0', () => {
        logger.info(`🔄 Keep-Alive server running on port ${port}`);
        logger.info(`📡 Health check: http://localhost:${port}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        logger.info('🛑 SIGTERM received, shutting down keep-alive server...');
        server.close(() => {
            logger.info('✅ Keep-alive server closed');
        });
    });

    return server;
}

// Self-ping function to keep the bot active
function startSelfPing(url = null) {
    if (!url) {
        // Try to detect Replit URL or use local
        url = process.env.REPL_URL || `http://localhost:${process.env.KEEP_ALIVE_PORT || 3000}`;
    }

    const pingInterval = 5 * 60 * 1000; // 5 minutes

    setInterval(async () => {
        try {
            const response = await fetch(`${url}/ping`);
            if (response.ok) {
                logger.info(`🏓 Self-ping successful: ${response.status}`);
            } else {
                logger.warn(`⚠️ Self-ping failed with status: ${response.status}`);
            }
        } catch (error) {
            logger.error('❌ Self-ping error:', error.message);
        }
    }, pingInterval);

    logger.info(`🔄 Self-ping started, interval: ${pingInterval / 1000 / 60} minutes`);
    logger.info(`📍 Ping URL: ${url}/ping`);
}

module.exports = { keepAlive, startSelfPing };