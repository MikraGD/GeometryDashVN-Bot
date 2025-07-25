const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const aiService = require('../services/aiService.js');
const localAI = require('../services/localAI.js');
const config = require('../config/config.js');
const dbUtils = require('../utils/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai')
        .setDescription('Chat với AI trợ lý GDVN')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Tin nhắn bạn muốn gửi cho AI')
                .setRequired(true)
        ),

    async execute(interaction) {
        const startTime = Date.now();
        const message = interaction.options.getString('message');
        const userId = interaction.user.id;
        const username = interaction.user.username;

        // Defer reply since AI might take time
        await interaction.deferReply();

        try {
            // Try OpenAI first, fallback to local AI if not available
            let result;
            let isLocalAI = false;

            if (aiService.isReady()) {
                result = await aiService.chat(message, userId, username);
            } else {
                // Use local AI as fallback
                result = await localAI.processQuestion(message);
                isLocalAI = true;
            }

            // AI response already obtained above

            if (!result.success) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle('❌ Lỗi AI')
                    .setDescription(result.error)
                    .setColor(config.COLORS.ERROR)
                    .setTimestamp();

                return interaction.editReply({ embeds: [errorEmbed] });
            }

            // Create response embed
            const responseEmbed = new EmbedBuilder()
                .setTitle(isLocalAI ? '🧠 GDVN Local AI' : '🤖 GDVN AI Trợ Lý')
                .setDescription(result.response)
                .setColor(config.COLORS.PRIMARY)
                .addFields(
                    {
                        name: '👤 Người hỏi',
                        value: `${interaction.user.displayName}`,
                        inline: true
                    },
                    {
                        name: '🔧 AI Type',
                        value: isLocalAI ? '🧠 Local Knowledge Base' : (config.AI_MODEL || 'gpt-3.5-turbo'),
                        inline: true
                    },
                    {
                        name: '📊 Status',
                        value: isLocalAI ? '🆓 Free & Local' : `Tokens: ${result.tokens_used || 'N/A'}`,
                        inline: true
                    }
                )
                .setFooter({
                    text: isLocalAI ? 'GDVN Local AI • Free Vietnamese GD Knowledge' : 'GDVN AI • Powered by OpenAI',
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [responseEmbed] });

            // Save to database
            await dbUtils.saveAiChat(interaction, message, result.response, result.tokens_used, config.AI_MODEL);
            await dbUtils.logCommand(interaction, 'ai', true, Date.now() - startTime);

        } catch (error) {
            console.error('AI command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Lỗi Hệ Thống')
                .setDescription('Đã xảy ra lỗi khi xử lý yêu cầu AI của bạn.')
                .setColor(config.COLORS.ERROR)
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};