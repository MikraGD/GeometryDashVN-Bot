const logger = require('../utils/logger.js');
const config = require('../config/config.js');
const vietnamese = require('../utils/vietnamese.js');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Ignore bot messages and system messages
        if (message.author.bot || message.system) return;

        // Only respond to messages that mention the bot or start with prefix
        const mentionRegex = new RegExp(`^<@!?${message.client.user.id}>`);
        const isMentioned = mentionRegex.test(message.content);
        const hasPrefix = message.content.toLowerCase().startsWith(config.PREFIX.toLowerCase());

        if (!isMentioned && !hasPrefix) return;

        try {
            // Log the message for monitoring
            logger.debug(`Message from ${message.author.tag} in ${message.guild?.name || 'DM'}: ${message.content}`);

            // Handle prefix commands (legacy support)
            if (hasPrefix) {
                const args = message.content.slice(config.PREFIX.length).trim().split(/ +/);
                const commandName = args.shift().toLowerCase();

                // Suggest using slash commands instead
                const reply = await message.reply({
                    content: `⚠️ **Lệnh văn bản đã lỗi thời!**\n` +
                            `Vui lòng sử dụng lệnh slash thay thế: \`/${commandName}\`\n` +
                            `Gõ \`/help\` để xem tất cả lệnh có sẵn.`,
                    allowedMentions: { repliedUser: false }
                });

                // Auto-delete the suggestion after 10 seconds
                setTimeout(() => {
                    reply.delete().catch(() => {});
                }, 10000);

                return;
            }

            // Handle bot mentions with funny Vietnamese responses
            if (isMentioned) {
                const responses = [
                    'Ủa ai ping tui zạ? Đang ngủ mơ thấy Geometry Dash nè 😴',
                    'Tui đang tính perfect cái level, ai gọi vậy 😤',
                    'Zzzz... Ping cái gì mà ping, đang AFK farming icon mà!',
                    'Tui là bot cute, đừng làm phiền chớ! (≧◡≦)',
                    'Ủa alo? Ping tui có gì hông? Tui biết tất cả về Geometry Dash nha!',
                    `Xin chào ${message.author}! 👋 Tôi là GDVN Bot - bot hỗ trợ cộng đồng Geometry Dash Việt Nam.\nSử dụng \`/help\` để xem danh sách lệnh có sẵn.`,
                    '🎮 Xin chào! Bạn cần hỗ trợ gì về Geometry Dash không?',
                    '⚡ Tôi đang ở đây! Sử dụng `/help` để xem các lệnh khả dụng.',
                    '🌟 Chào bạn! Tôi có thể giúp bạn tìm level, thông tin game và nhiều thứ khác nữa!',
                    '🚀 Hello! Tôi là bot chuyên về Geometry Dash của cộng đồng Việt Nam!'
                ];

                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                
                await message.reply({
                    content: randomResponse,
                    allowedMentions: { repliedUser: false }
                });

                logger.info(`Responded to mention from ${message.author.tag}`);
            }

        } catch (error) {
            logger.error('Error handling message:', error);
            
            try {
                await message.reply({
                    content: vietnamese.phrases.serverError,
                    allowedMentions: { repliedUser: false }
                });
            } catch (replyError) {
                logger.error('Error sending error message:', replyError);
            }
        }
    }
};
