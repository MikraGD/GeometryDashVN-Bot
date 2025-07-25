const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config/config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botstatus')
        .setDescription('[Admin] Xem trạng thái chi tiết của bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Check if user has administrator permission
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            const noPermEmbed = new EmbedBuilder()
                .setTitle('❌ Không có quyền')
                .setDescription('Chỉ admin mới có thể xem trạng thái chi tiết của bot.')
                .setColor(config.COLORS.ERROR)
                .setTimestamp();

            return interaction.reply({ embeds: [noPermEmbed], ephemeral: true });
        }

        try {
            // Get detailed bot status
            const uptime = process.uptime();
            const memoryUsage = process.memoryUsage();
            
            const statusEmbed = new EmbedBuilder()
                .setTitle('🤖 GDVN Bot - Trạng thái chi tiết')
                .setColor(config.COLORS.PRIMARY)
                .addFields(
                    {
                        name: '⏱️ Uptime',
                        value: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
                        inline: true
                    },
                    {
                        name: '💾 RAM Usage',
                        value: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
                        inline: true
                    },
                    {
                        name: '🏠 Servers',
                        value: `${interaction.client.guilds.cache.size}`,
                        inline: true
                    },
                    {
                        name: '👥 Users',
                        value: `${interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}`,
                        inline: true
                    },
                    {
                        name: '📝 Commands',
                        value: `${interaction.client.commands.size}`,
                        inline: true
                    },
                    {
                        name: '🏓 Ping',
                        value: `${Math.round(interaction.client.ws.ping)}ms`,
                        inline: true
                    },
                    {
                        name: '🚀 Features',
                        value: '• Demon List Integration\n• AI Chatbot (Local + OpenAI)\n• Level Search & Info\n• Statistics Tracking\n• 24/7 Keep-Alive System',
                        inline: false
                    },
                    {
                        name: '🔧 System Info',
                        value: `Node.js: ${process.version}\nPlatform: ${process.platform}\nEnvironment: ${process.env.NODE_ENV || 'development'}`,
                        inline: false
                    }
                )
                .setFooter({
                    text: 'GDVN Bot Status • Admin Only',
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();

            await interaction.reply({ embeds: [statusEmbed], ephemeral: true });

        } catch (error) {
            console.error('Bot status command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Lỗi Hệ Thống')
                .setDescription('Không thể lấy trạng thái bot.')
                .setColor(config.COLORS.ERROR)
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};