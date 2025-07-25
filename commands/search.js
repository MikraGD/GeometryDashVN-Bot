const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const geometryDashAPI = require('../services/geometryDashAPI.js');
const vietnamese = require('../utils/vietnamese.js');
const config = require('../config/config.js');
const logger = require('../utils/logger.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Tìm kiếm level Geometry Dash theo tên')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Tên level cần tìm')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Số lượng kết quả tối đa (1-10)')
                .setMinValue(1)
                .setMaxValue(10)),

    async execute(interaction) {
        await interaction.deferReply();

        const levelName = interaction.options.getString('name');
        const limit = interaction.options.getInteger('limit') || 5;

        try {
            const searchResults = await geometryDashAPI.searchLevels(levelName, limit);

            if (!searchResults || searchResults.length === 0) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(config.COLORS.WARNING)
                    .setTitle('🔍 Không tìm thấy kết quả')
                    .setDescription(`Không tìm thấy level nào với tên: "${levelName}"`)
                    .setTimestamp();

                return await interaction.editReply({ embeds: [errorEmbed] });
            }

            const searchEmbed = new EmbedBuilder()
                .setColor(config.COLORS.PRIMARY)
                .setTitle(`🔍 Kết quả tìm kiếm: "${levelName}"`)
                .setDescription(`Tìm thấy ${searchResults.length} kết quả:`)
                .setTimestamp();

            searchResults.forEach((level, index) => {
                const difficultyIcon = vietnamese.getDifficultyIcon(level.difficulty);
                const fieldValue = [
                    `👤 **Tác giả:** ${level.author || 'Không rõ'}`,
                    `🆔 **ID:** ${level.id}`,
                    `⭐ **Độ khó:** ${difficultyIcon} ${vietnamese.getDifficultyName(level.difficulty)}`,
                    `📊 **Lượt tải:** ${level.downloads ? level.downloads.toLocaleString('vi-VN') : '0'}`,
                    `👍 **Lượt thích:** ${level.likes ? level.likes.toLocaleString('vi-VN') : '0'}`
                ].join('\n');

                searchEmbed.addFields({
                    name: `${index + 1}. ${level.name}`,
                    value: fieldValue,
                    inline: false
                });
            });

            searchEmbed.setFooter({ 
                text: `GDVN Bot • Trang 1/${Math.ceil(searchResults.length / limit)} • Sử dụng /level <id> để xem chi tiết` 
            });

            await interaction.editReply({ embeds: [searchEmbed] });
            logger.info(`Level search completed for query: "${levelName}" by user: ${interaction.user.tag}`);

        } catch (error) {
            logger.error('Error in search command:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Lỗi')
                .setDescription('Đã xảy ra lỗi khi tìm kiếm level. Vui lòng thử lại sau.')
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
