const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const config = require('../config/config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Hiển thị danh sách lệnh và hướng dẫn sử dụng bot'),

    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setColor(config.COLORS.PRIMARY)
            .setTitle('🎮 GDVN Bot - Hướng dẫn sử dụng')
            .setDescription('Bot hỗ trợ cộng đồng Geometry Dash Việt Nam')
            .addFields(
                {
                    name: '🎮 Lệnh Geometry Dash',
                    value: [
                        '`/level <id>` - Xem thông tin chi tiết level theo ID',
                        '`/search <tên>` - Tìm kiếm level theo tên',
                        '`/demonlist [page]` - Xem top demon từ Pointercrate',
                        '`/ping` - Kiểm tra độ trễ của bot'
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '🤖 Lệnh AI & Fun',
                    value: [
                        '`/ai <tin nhắn>` - Chat với AI trợ lý GDVN',
                        '`/ask <câu hỏi>` - Hỏi AI về Geometry Dash',
                        '`/funny` - Xem tin nhắn hài hước',
                        '`/update` - Xem cập nhật mới nhất'
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '🛠️ Lệnh Moderation & Thống kê',
                    value: [
                        '`/ban <user> [lý do]` - Ban thành viên (cần quyền)',
                        '`/stats user [target]` - Xem thống kê người dùng',
                        '`/stats server` - Xem thống kê server',
                        '`/stats commands` - Xem thống kê lệnh',
                        '`/help` - Hiển thị hướng dẫn này'
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '🎯 Ví dụ sử dụng',
                    value: [
                        '`/level 128` - Xem thông tin level ID 128',
                        '`/search Bloodbath` - Tìm kiếm level có tên "Bloodbath"',
                        '`/demonlist 2` - Xem trang 2 của top demon list',
                        '`/ask Làm thế nào để pass Bloodbath?` - Hỏi AI về game',
                        '`/funny` - Xem meme Geometry Dash hài hước',
                        '`/stats user` - Xem thống kê cá nhân',
                        '`/ban @user spam` - Ban user vì spam'
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '📊 Thông tin hiển thị',
                    value: [
                        '• ID và tên level',
                        '• Tác giả',
                        '• Độ khó và độ dài',
                        '• Lượt tải và lượt thích',
                        '• Nhạc nền'
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '🌟 Tính năng đặc biệt',
                    value: [
                        '• Hỗ trợ tiếng Việt 100%',
                        '• AI trợ lý thông minh (OpenAI)',
                        '• Auto role cho thành viên mới',
                        '• Moderation với log chi tiết', 
                        '• Database tracking & statistics',
                        '• Web interface cấu hình',
                        '• Funny responses khi ping'
                    ].join('\n'),
                    inline: true
                },
                {
                    name: '⚙️ Cấu hình Admin',
                    value: [
                        '• Web config: `localhost:5000`',
                        '• Auto role assignment',
                        '• Log channel cho moderation',
                        '• OpenAI API integration',
                        '• PostgreSQL database',
                        '• Command usage tracking',
                        '• Custom system prompts'
                    ].join('\n'),
                    inline: true
                }
            )
            .setFooter({ 
                text: 'GDVN Bot • Geometry Dash Việt Nam • Made with ❤️ for Vietnamese GD Community' 
            })
            .setTimestamp();

        await interaction.reply({ embeds: [helpEmbed] });
    }
};
