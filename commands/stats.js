const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config/config.js');
const dbUtils = require('../utils/database.js');
const logger = require('../utils/logger.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Xem thống kê sử dụng bot')
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Xem thống kê cá nhân')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('Người dùng muốn xem thống kê (để trống để xem của bản thân)')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('server')
                .setDescription('Xem thống kê server (chỉ admin)')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('commands')
                .setDescription('Xem thống kê lệnh phổ biến')
        ),

    async execute(interaction) {
        const startTime = Date.now();
        const subcommand = interaction.options.getSubcommand();

        try {
            await interaction.deferReply();

            if (subcommand === 'user') {
                const targetUser = interaction.options.getUser('target') || interaction.user;
                const userStats = await dbUtils.getUserStats(targetUser.id);

                const embed = new EmbedBuilder()
                    .setTitle('📊 Thống kê người dùng')
                    .setDescription(`Thống kê cho ${targetUser.displayName}`)
                    .addFields(
                        {
                            name: '🎮 Lệnh đã sử dụng',
                            value: `${userStats.commandsUsed} lệnh`,
                            inline: true
                        },
                        {
                            name: '👁️ Lần cuối online',
                            value: userStats.lastSeen ? 
                                `<t:${Math.floor(userStats.lastSeen.getTime() / 1000)}:R>` : 
                                'Chưa có dữ liệu',
                            inline: true
                        }
                    )
                    .setColor(config.COLORS.INFO)
                    .setThumbnail(targetUser.displayAvatarURL())
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });

            } else if (subcommand === 'server') {
                if (!interaction.guild) {
                    return interaction.editReply('❌ Lệnh này chỉ có thể sử dụng trong server.');
                }

                const commandStats = await dbUtils.getCommandStats(interaction.guild.id);
                const moderationLogs = await dbUtils.getModerationLogs(interaction.guild.id, 5);

                const embed = new EmbedBuilder()
                    .setTitle('📊 Thống kê Server')
                    .setDescription(`Thống kê cho **${interaction.guild.name}**`)
                    .addFields(
                        {
                            name: '👥 Thành viên',
                            value: `${interaction.guild.memberCount} người`,
                            inline: true
                        },
                        {
                            name: '🤖 Bot hoạt động',
                            value: `${commandStats.length > 0 ? 'Có dữ liệu' : 'Chưa có dữ liệu'}`,
                            inline: true
                        }
                    )
                    .setColor(config.COLORS.PRIMARY)
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp();

                if (commandStats.length > 0) {
                    const topCommands = commandStats.slice(0, 5).map(stat => 
                        `\`/${stat.commandName}\` - ${stat.count} lần (${Math.round(stat.successRate)}% thành công)`
                    ).join('\n');

                    embed.addFields({
                        name: '🎯 Top 5 lệnh phổ biến',
                        value: topCommands,
                        inline: false
                    });
                }

                if (moderationLogs.length > 0) {
                    const recentMods = moderationLogs.slice(0, 3).map(log => 
                        `**${log.action}** - <t:${Math.floor(new Date(log.createdAt).getTime() / 1000)}:R>`
                    ).join('\n');

                    embed.addFields({
                        name: '🛡️ Hoạt động moderation gần đây',
                        value: recentMods,
                        inline: false
                    });
                }

                await interaction.editReply({ embeds: [embed] });

            } else if (subcommand === 'commands') {
                const commandStats = await dbUtils.getCommandStats(interaction.guild?.id);

                if (commandStats.length === 0) {
                    return interaction.editReply('📊 Chưa có dữ liệu thống kê lệnh.');
                }

                const embed = new EmbedBuilder()
                    .setTitle('📈 Thống kê lệnh')
                    .setDescription('Lệnh phổ biến và hiệu suất')
                    .setColor(config.COLORS.SUCCESS)
                    .setTimestamp();

                const commandList = commandStats.slice(0, 10).map((stat, index) => {
                    const avgTime = stat.avgExecutionTime ? `${Math.round(stat.avgExecutionTime)}ms` : 'N/A';
                    return `**${index + 1}.** \`/${stat.commandName}\`\n` +
                           `└ ${stat.count} lần • ${Math.round(stat.successRate)}% thành công • ${avgTime}`;
                }).join('\n\n');

                embed.addFields({
                    name: '📊 Top lệnh được sử dụng',
                    value: commandList,
                    inline: false
                });

                await interaction.editReply({ embeds: [embed] });
            }

            // Log command usage
            const executionTime = Date.now() - startTime;
            await dbUtils.logCommand(interaction, 'stats', true, executionTime);

        } catch (error) {
            logger.error('❌ Stats command error:', error);
            
            const executionTime = Date.now() - startTime;
            await dbUtils.logCommand(interaction, 'stats', false, executionTime, error.message);

            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Lỗi Hệ Thống')
                .setDescription('Không thể lấy thống kê. Vui lòng thử lại sau.')
                .setColor(config.COLORS.ERROR)
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};