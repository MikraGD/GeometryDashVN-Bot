const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config/config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Xem thông tin cập nhật mới nhất của bot'),

    async execute(interaction) {
        const updateEmbed = new EmbedBuilder()
            .setTitle('✨ GDVN Bot - Cập nhật mới nhất')
            .setDescription('Dưới đây là những tính năng và cải tiến mới nhất của bot!')
            .addFields(
                {
                    name: '🆕 Tính năng mới',
                    value: [
                        '• **AI Chat** - Trò chuyện với AI thông minh về Geometry Dash',
                        '• **Web Config** - Giao diện web để cấu hình bot',
                        '• **Auto Role** - Tự động gán role cho thành viên mới',
                        '• **Moderation** - Lệnh ban với log chi tiết',
                        '• **Fun Commands** - Lệnh funny và update'
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '🔧 Cải tiến',
                    value: [
                        '• Hệ thống log nâng cao',
                        '• Hỗ trợ múi giờ Việt Nam', 
                        '• Slash commands với autocomplete',
                        '• Embed messages đẹp hơn',
                        '• Error handling tốt hơn'
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '🎯 Sắp tới',
                    value: [
                        '• Dashboard web hoàn chỉnh',
                        '• Level leaderboard',
                        '• User profiles',
                        '• Custom prefixes',
                        '• More GD API integrations'
                    ].join('\n'),
                    inline: false
                }
            )
            .setColor(config.COLORS.SUCCESS)
            .setFooter({ 
                text: 'GDVN Bot • Version 2.0 • Made for Vietnamese GD Community' 
            })
            .setTimestamp();

        await interaction.reply({ embeds: [updateEmbed] });
    }
};