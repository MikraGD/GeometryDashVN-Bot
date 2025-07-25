const { Events } = require('discord.js');
const config = require('../config/config.js');
const logger = require('../utils/logger.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        try {
            // Auto role assignment
            if (config.AUTO_ROLE_ID && config.AUTO_ROLE_ID !== '') {
                const role = member.guild.roles.cache.get(config.AUTO_ROLE_ID);
                
                if (role) {
                    await member.roles.add(role);
                    logger.info(`🎭 Đã tự động gán role "${role.name}" cho ${member.user.tag}`);
                    
                    // Log to designated channel if configured
                    if (config.LOG_CHANNEL_ID && config.LOG_CHANNEL_ID !== '') {
                        const logChannel = member.guild.channels.cache.get(config.LOG_CHANNEL_ID);
                        if (logChannel) {
                            await logChannel.send(`🆕 **${member.user.tag}** đã tham gia server và được gán role **${role.name}**`);
                        }
                    }
                } else {
                    logger.warn(`⚠️ Không tìm thấy role với ID: ${config.AUTO_ROLE_ID}`);
                }
            }

            // Welcome message to log channel
            if (config.LOG_CHANNEL_ID && config.LOG_CHANNEL_ID !== '') {
                const logChannel = member.guild.channels.cache.get(config.LOG_CHANNEL_ID);
                if (logChannel && !config.AUTO_ROLE_ID) {
                    await logChannel.send(`👋 **${member.user.tag}** đã tham gia server **${member.guild.name}**!`);
                }
            }

        } catch (error) {
            logger.error('❌ Lỗi khi xử lý thành viên mới:', error);
        }
    }
};