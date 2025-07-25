const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const aiService = require('../services/aiService.js');
const localAI = require('../services/localAI.js');
const config = require('../config/config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Hỏi AI về Geometry Dash hoặc bất cứ điều gì')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Câu hỏi bạn muốn hỏi AI')
                .setRequired(true)
        ),

    async execute(interaction) {
        const question = interaction.options.getString('question');
        const userId = interaction.user.id;
        const username = interaction.user.username;

        // Defer reply since AI might take time
        await interaction.deferReply();

        try {
            // Try OpenAI first, fallback to local AI if not available
            let result;
            let isLocalAI = false;

            if (aiService.isReady()) {
                // Get AI response with enhanced prompt for Geometry Dash
                const enhancedPrompt = `Câu hỏi về Geometry Dash từ cộng đồng Việt Nam: ${question}`;
                result = await aiService.chat(enhancedPrompt, userId, username);
            } else {
                // Use local AI as fallback
                result = await localAI.processQuestion(question);
                isLocalAI = true;
            }

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
                .setTitle(isLocalAI ? '🧠 GDVN Local AI' : '🤖 GDVN AI Assistant')
                .setDescription(result.response)
                .setColor(config.COLORS.PRIMARY)
                .addFields(
                    {
                        name: '❓ Câu hỏi',
                        value: question.length > 100 ? question.substring(0, 100) + '...' : question,
                        inline: false
                    },
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
                    text: isLocalAI ? 'GDVN Local AI • Free Vietnamese GD Knowledge' : 'GDVN AI • Powered by OpenAI • Hỗ trợ cộng đồng GD Việt Nam',
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [responseEmbed] });

        } catch (error) {
            console.error('Ask command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Lỗi Hệ Thống')
                .setDescription('Đã xảy ra lỗi khi xử lý câu hỏi của bạn.')
                .setColor(config.COLORS.ERROR)
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};