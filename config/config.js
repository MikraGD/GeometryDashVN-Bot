const config = {
    // Discord Bot Configuration
    DISCORD_TOKEN: process.env.DISCORD_TOKEN || 'your_discord_bot_token',
    CLIENT_ID: process.env.CLIENT_ID || 'your_client_id',
    
    // Bot Settings
    PREFIX: process.env.PREFIX || '!gd',
    OWNER_ID: process.env.OWNER_ID || 'your_discord_user_id',
    LOG_CHANNEL_ID: process.env.LOG_CHANNEL_ID || '',
    AUTO_ROLE_ID: process.env.AUTO_ROLE_ID || '',
    
    // AI Chatbot Configuration
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    AI_MODEL: process.env.AI_MODEL || 'gpt-3.5-turbo',
    SYSTEM_PROMPT: process.env.SYSTEM_PROMPT || 'Bạn là một trợ lý AI cho cộng đồng Geometry Dash Việt Nam. Hãy trả lời bằng tiếng Việt và giúp đỡ người chơi về game Geometry Dash or english.',
    
    // Geometry Dash API
    GD_API_BASE: 'http://www.boomlings.com/database',
    GD_SERVER_BASE: 'https://gdutils.com/api',
    
    // Bot Configuration
    MAX_SEARCH_RESULTS: 10,
    COMMAND_COOLDOWN: 3000, // 3 seconds
    
    // Colors for embeds (Vietnamese flag colors)
    COLORS: {
        PRIMARY: '#DA020E', // Red
        SUCCESS: '#00FF00',
        ERROR: '#FF0000',
        WARNING: '#FFFF00',
        INFO: '#0099FF'
    },
    
    // Vietnamese Text
    LANGUAGE: 'vi',
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

module.exports = config;
