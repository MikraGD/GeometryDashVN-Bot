const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Store for runtime configuration
let runtimeConfig = {};

// Load configuration from file
async function loadConfigFromFile() {
    try {
        const configPath = path.join(__dirname, 'config', 'runtime.json');
        const data = await fs.readFile(configPath, 'utf8');
        runtimeConfig = JSON.parse(data);
        return runtimeConfig;
    } catch (error) {
        // If file doesn't exist, create with default values
        runtimeConfig = {
            discordToken: process.env.DISCORD_TOKEN || '',
            clientId: process.env.CLIENT_ID || '',
            logChannelId: process.env.LOG_CHANNEL_ID || '',
            autoRoleId: process.env.AUTO_ROLE_ID || '',
            openaiApiKey: process.env.OPENAI_API_KEY || '',
            aiModel: process.env.AI_MODEL || 'gpt-3.5-turbo',
            systemPrompt: process.env.SYSTEM_PROMPT || 'Bạn là một trợ lý AI cho cộng đồng Geometry Dash Việt Nam. Hãy trả lời bằng tiếng Việt và giúp đỡ người chơi về game Geometry Dash.'
        };
        await saveConfigToFile();
        return runtimeConfig;
    }
}

// Save configuration to file
async function saveConfigToFile() {
    try {
        const configPath = path.join(__dirname, 'config', 'runtime.json');
        await fs.writeFile(configPath, JSON.stringify(runtimeConfig, null, 2));
        logger.info('Đã lưu cấu hình vào file');
    } catch (error) {
        logger.error('Lỗi khi lưu cấu hình:', error);
        throw error;
    }
}

// API Routes
app.get('/api/status', (req, res) => {
    try {
        // Get bot client if available
        const client = require('./index.js');
        
        if (client && client.isReady()) {
            res.json({
                online: true,
                username: client.user.tag,
                guilds: client.guilds.cache.size,
                users: client.users.cache.size
            });
        } else {
            res.json({
                online: false
            });
        }
    } catch (error) {
        res.json({
            online: false,
            error: error.message
        });
    }
});

app.get('/api/config', async (req, res) => {
    try {
        await loadConfigFromFile();
        
        // Return config without sensitive data
        const safeConfig = { ...runtimeConfig };
        if (safeConfig.discordToken) safeConfig.discordToken = safeConfig.discordToken.substring(0, 10) + '...';
        if (safeConfig.openaiApiKey) safeConfig.openaiApiKey = safeConfig.openaiApiKey.substring(0, 10) + '...';
        
        res.json(safeConfig);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/config', async (req, res) => {
    try {
        const newConfig = req.body;
        
        // Validate required fields
        if (!newConfig.discordToken || !newConfig.clientId) {
            return res.status(400).json({ error: 'Discord Token và Client ID là bắt buộc' });
        }
        
        // Update runtime config
        runtimeConfig = { ...runtimeConfig, ...newConfig };
        
        // Save to file
        await saveConfigToFile();
        
        // Update environment variables for current process
        process.env.DISCORD_TOKEN = runtimeConfig.discordToken;
        process.env.CLIENT_ID = runtimeConfig.clientId;
        process.env.LOG_CHANNEL_ID = runtimeConfig.logChannelId;
        process.env.AUTO_ROLE_ID = runtimeConfig.autoRoleId;
        process.env.OPENAI_API_KEY = runtimeConfig.openaiApiKey;
        process.env.AI_MODEL = runtimeConfig.aiModel;
        process.env.SYSTEM_PROMPT = runtimeConfig.systemPrompt;
        
        logger.info('Đã cập nhật cấu hình bot');
        
        res.json({ 
            success: true, 
            message: 'Cấu hình đã được lưu thành công',
            restart_required: true
        });
        
        // Restart bot after a short delay
        setTimeout(() => {
            logger.info('Đang khởi động lại bot với cấu hình mới...');
            process.exit(0); // Let the process manager restart the bot
        }, 2000);
        
    } catch (error) {
        logger.error('Lỗi khi lưu cấu hình:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Simple uptime page
app.get('/uptime', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>GDVN Bot - Uptime</title>
            <style>
                body { font-family: Arial; text-align: center; margin-top: 100px; background: #2c3e50; color: white; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .status { background: #27ae60; padding: 20px; border-radius: 10px; margin: 20px 0; }
                .info { background: #34495e; padding: 15px; border-radius: 8px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🤖 GDVN Bot Status</h1>
                <div class="status">
                    <h2>✅ Bot Online</h2>
                    <p>Uptime: ${Math.floor(process.uptime() / 3600)} hours</p>
                </div>
                <div class="info">
                    <h3>For Admins:</h3>
                    <p>Use <code>/botstatus</code> command in Discord for detailed information</p>
                    <p>Only server administrators can access detailed stats</p>
                </div>
                <div class="info">
                    <h3>UptimeRobot Setup:</h3>
                    <p>Monitor: <code>${req.get('host')}/ping</code></p>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Error handling middleware
app.use((error, req, res, next) => {
    logger.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
    logger.info(`🌐 Configuration server running on port ${PORT}`);
    logger.info(`🔗 Open http://localhost:${PORT} to configure your bot`);
    
    // Load initial configuration
    await loadConfigFromFile();
});

module.exports = app;