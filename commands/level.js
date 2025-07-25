const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const geometryDashAPI = require('../services/geometryDashAPI.js');
const vietnamese = require('../utils/vietnamese.js');
const config = require('../config/config.js');
const logger = require('../utils/logger.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Tìm kiếm thông tin level Geometry Dash')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('ID của level')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();

        const levelId = interaction.options.getString('id');

        try {
            const levelData = await geometryDashAPI.getLevelById(levelId);

            if (!levelData) {
                const errorEmbed = new EmbedBuilder()
                    .setColor(config.COLORS.ERROR)
                    .setTitle('❌ Không tìm thấy level')
                    .setDescription(`Không thể tìm thấy level có ID: ${levelId}`)
                    .setTimestamp();

                return await interaction.editReply({ embeds: [errorEmbed] });
            }

            const levelEmbed = new EmbedBuilder()
                .setColor(config.COLORS.PRIMARY)
                .setTitle(`🎮 ${levelData.name}`)
                .setDescription(levelData.description || 'Không có mô tả')
                .addFields(
                    { name: '🆔 ID Level', value: levelData.id.toString(), inline: true },
                    { name: '👤 Tác giả', value: levelData.author || 'Không rõ', inline: true },
                    { name: '⭐ Độ khó', value: vietnamese.getDifficultyName(levelData.difficulty), inline: true },
                    { name: '🎵 Nhạc', value: levelData.song || 'Không rõ', inline: true },
                    { name: '📊 Lượt tải', value: levelData.downloads ? levelData.downloads.toLocaleString('vi-VN') : '0', inline: true },
                    { name: '👍 Lượt thích', value: levelData.likes ? levelData.likes.toLocaleString('vi-VN') : '0', inline: true }
                )
                .setFooter({ text: 'GDVN Bot • Geometry Dash Việt Nam' })
                .setTimestamp();

            if (levelData.length) {
                levelEmbed.addFields({ name: '⏱️ Độ dài', value: vietnamese.getLengthName(levelData.length), inline: true });
            }

            if (levelData.featured) {
                levelEmbed.addFields({ name: '⭐ Đặc biệt', value: 'Level được đề xuất', inline: true });
            }

            await interaction.editReply({ embeds: [levelEmbed] });
            logger.info(`Level lookup completed for ID: ${levelId} by user: ${interaction.user.tag}`);

        } catch (error) {
            logger.error('Error in level command:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(config.COLORS.ERROR)
                .setTitle('❌ Lỗi')
                .setDescription('Đã xảy ra lỗi khi tìm kiếm level. Vui lòng thử lại sau.')
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
