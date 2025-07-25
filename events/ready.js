const logger = require('../utils/logger.js');
const commandHandler = require('../handlers/commandHandler.js');
const config = require('../config/config.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        logger.info(`✅ Bot đã sẵn sàng! Đăng nhập với tên: ${client.user.tag}`);
        logger.info(`🏠 Bot đang hoạt động trong ${client.guilds.cache.size} server(s)`);
        
        // Set bot activity
        client.user.setActivity('Geometry Dash Việt Nam | /help', { 
            type: 'PLAYING' 
        });

        // Register slash commands
        await commandHandler.registerCommands(client);

        // Log additional info
        logger.info(`👤 Phục vụ ${client.users.cache.size} người dùng`);
        logger.info(`📝 Đã tải ${client.commands.size} lệnh`);
        
        // Set up periodic tasks
        setInterval(() => {
            const memUsage = process.memoryUsage();
            logger.debug(`Memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
        }, 300000); // Log memory usage every 5 minutes

        logger.info('🚀 GDVN Bot hoàn toàn sẵn sàng phục vụ cộng đồng Geometry Dash Việt Nam!');
    }
};
