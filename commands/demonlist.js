const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const demonListAPI = require('../services/demonListAPI.js');
const config = require('../config/config.js');
const logger = require('../utils/logger.js');
const dbUtils = require('../utils/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('demonlist')
        .setDescription('Xem top demon từ Pointercrate Demon List')
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('Trang muốn xem (mỗi trang 10 demon)')
                .setMinValue(1)
                .setMaxValue(10)
                .setRequired(false)
        ),

    async execute(interaction) {
        const startTime = Date.now();
        const requestedPage = interaction.options.getInteger('page') || 1;

        try {
            await interaction.deferReply();

            // Fetch demon list data
            const demons = await demonListAPI.getTopDemons(100);
            const pageData = demonListAPI.getDemonPage(demons, requestedPage);

            if (pageData.demons.length === 0) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle('❌ Không tìm thấy dữ liệu')
                    .setDescription('Không thể tải danh sách demon. Vui lòng thử lại sau.')
                    .setColor(config.COLORS.ERROR)
                    .setTimestamp();

                await interaction.editReply({ embeds: [errorEmbed] });
                await dbUtils.logCommand(interaction, 'demonlist', false, Date.now() - startTime, 'No demon data found');
                return;
            }

            // Create embed with demon list
            const embed = this.createDemonListEmbed(pageData, demons.length);
            
            // Create navigation buttons
            const buttons = this.createNavigationButtons(pageData, interaction.user.id);

            await interaction.editReply({ 
                embeds: [embed], 
                components: buttons.length > 0 ? [buttons] : []
            });

            await dbUtils.logCommand(interaction, 'demonlist', true, Date.now() - startTime);

        } catch (error) {
            logger.error('❌ Demon list command error:', error);

            const executionTime = Date.now() - startTime;
            await dbUtils.logCommand(interaction, 'demonlist', false, executionTime, error.message);

            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Lỗi Hệ Thống')
                .setDescription('Không thể tải danh sách demon từ Pointercrate. Vui lòng thử lại sau.')
                .addFields({
                    name: '🔧 Khắc phục',
                    value: [
                        '• Kiểm tra kết nối internet',
                        '• Thử lại sau vài phút',
                        '• Liên hệ admin nếu lỗi tiếp tục'
                    ].join('\n')
                })
                .setColor(config.COLORS.ERROR)
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },

    createDemonListEmbed(pageData, totalDemons) {
        const embed = new EmbedBuilder()
            .setTitle('🔥 Pointercrate Demon List')
            .setDescription(`**Top ${totalDemons} Extreme Demon khó nhất thế giới**\n*Dựa trên độ khó và rating từ cộng đồng*`)
            .setColor(config.COLORS.PRIMARY)
            .setThumbnail('https://i.imgur.com/dL8fE7M.png') // Demon icon
            .setFooter({
                text: `Trang ${pageData.currentPage}/${pageData.totalPages} • Dữ liệu từ Pointercrate.com`,
                iconURL: 'https://pointercrate.com/static/images/pointercrate2.png'
            })
            .setTimestamp();

        // Add demon list
        const demonList = pageData.demons.map(demon => {
            const medal = this.getDemonMedal(demon.position);
            const difficultyIcon = this.getDifficultyIcon(demon.position);
            
            return `${medal} **#${demon.position}** ${difficultyIcon} **${demon.name}**\n` +
                   `└ 👤 ${demon.creator} • 🏆 ${demon.points} points`;
        }).join('\n\n');

        embed.addFields({
            name: `📊 Top ${pageData.demons[0].position}-${pageData.demons[pageData.demons.length - 1].position}`,
            value: demonList,
            inline: false
        });

        // Add difficulty explanation
        if (pageData.currentPage === 1) {
            embed.addFields({
                name: '📈 Phân loại độ khó',
                value: [
                    '🔴 #1-10: Impossible/Beyond Extreme',
                    '🟠 #11-30: Extreme+',
                    '🟡 #31-75: Extreme',
                    '🟢 #76-150: Insane+'
                ].join('\n'),
                inline: true
            });
        }

        return embed;
    },

    createNavigationButtons(pageData, userId) {
        if (pageData.totalPages <= 1) return [];

        const row = new ActionRowBuilder();

        // Previous button
        if (pageData.hasPrev) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`demonlist_prev_${pageData.currentPage}_${userId}`)
                    .setLabel('◀ Trang trước')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📖')
            );
        }

        // Page info button (disabled)
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('page_info')
                .setLabel(`${pageData.currentPage}/${pageData.totalPages}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        );

        // Next button
        if (pageData.hasNext) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`demonlist_next_${pageData.currentPage}_${userId}`)
                    .setLabel('Trang sau ▶')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📖')
            );
        }

        // Refresh button
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`demonlist_refresh_${pageData.currentPage}_${userId}`)
                .setLabel('🔄')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🔄')
        );

        return row;
    },

    getDemonMedal(position) {
        if (position === 1) return '🥇';
        if (position === 2) return '🥈';
        if (position === 3) return '🥉';
        if (position <= 10) return '🏆';
        if (position <= 25) return '⭐';
        if (position <= 50) return '🔸';
        return '🔹';
    },

    getDifficultyIcon(position) {
        if (position <= 10) return '🔴'; // Impossible
        if (position <= 30) return '🟠'; // Extreme+
        if (position <= 75) return '🟡'; // Extreme
        return '🟢'; // Insane+
    }
};