const OpenAI = require('openai');
const config = require('../config/config.js');
const logger = require('../utils/logger.js');

class AIService {
    constructor() {
        this.openai = null;
        this.initialized = false;
        this.init();
    }

    init() {
        if (config.OPENAI_API_KEY && config.OPENAI_API_KEY !== '') {
            try {
                this.openai = new OpenAI({
                    apiKey: config.OPENAI_API_KEY
                });
                this.initialized = true;
                logger.info('🤖 AI Service initialized successfully');
            } catch (error) {
                logger.error('❌ Failed to initialize AI Service:', error);
                this.initialized = false;
            }
        } else {
            logger.warn('⚠️ OpenAI API key not provided, AI features disabled');
            this.initialized = false;
        }
    }

    isReady() {
        return this.initialized && this.openai !== null;
    }

    async chat(message, userId = null, username = null) {
        if (!this.isReady()) {
            return {
                success: false,
                error: 'AI Service chưa được cấu hình. Vui lòng thêm OpenAI API key.'
            };
        }

        try {
            const systemPrompt = config.SYSTEM_PROMPT || 'Bạn là một trợ lý AI cho cộng đồng Geometry Dash Việt Nam. Hãy trả lời bằng tiếng Việt và giúp đỡ người chơi về game Geometry Dash.';
            
            const messages = [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: message
                }
            ];

            const completion = await this.openai.chat.completions.create({
                model: config.AI_MODEL || 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: 1000,
                temperature: 0.7,
            });

            const response = completion.choices[0]?.message?.content;
            
            if (!response) {
                throw new Error('No response from AI');
            }

            // Log the interaction
            logger.info(`🤖 AI Chat - User: ${username || userId} | Tokens: ${completion.usage.total_tokens}`);

            return {
                success: true,
                response: response,
                tokens_used: completion.usage.total_tokens
            };

        } catch (error) {
            logger.error('❌ AI Chat error:', error);
            
            // Handle specific OpenAI error types with detailed Vietnamese messages
            if (error.code === 'insufficient_quota' || error.status === 429) {
                return {
                    success: false,
                    error: '💳 **Hết quota OpenAI API**\n\nTài khoản OpenAI của bạn đã hết credit hoặc vượt quá giới hạn sử dụng.\n\n📋 **Cách khắc phục:**\n• Kiểm tra billing tại: https://platform.openai.com/usage\n• Thêm payment method hoặc nâng cấp plan\n• Đợi reset quota hàng tháng\n\n💡 Bot vẫn hoạt động bình thường với các lệnh khác!'
                };
            } else if (error.code === 'invalid_api_key' || error.status === 401) {
                return {
                    success: false,
                    error: '🔑 **API Key không hợp lệ**\n\nOpenAI API key có vấn đề.\n\n📋 **Cách khắc phục:**\n• Kiểm tra API key tại: https://platform.openai.com/api-keys\n• Tạo API key mới nếu cần\n• Liên hệ admin để cập nhật'
                };
            } else if (error.status === 503 || error.status === 500) {
                return {
                    success: false,
                    error: '🔧 **OpenAI đang bảo trì**\n\nDịch vụ OpenAI tạm thời không khả dụng.\nVui lòng thử lại sau ít phút.'
                };
            } else {
                return {
                    success: false,
                    error: `❌ **Lỗi AI không xác định**\n\n${error.message || 'Không thể kết nối với AI service'}\n\nVui lòng thử lại hoặc liên hệ admin.`
                };
            }
        }
    }

    // Reinitialize with new API key
    updateApiKey(newApiKey) {
        config.OPENAI_API_KEY = newApiKey;
        process.env.OPENAI_API_KEY = newApiKey;
        this.init();
    }

    // Update model
    updateModel(newModel) {
        config.AI_MODEL = newModel;
        process.env.AI_MODEL = newModel;
        logger.info(`🔄 AI model updated to: ${newModel}`);
    }

    // Update system prompt
    updateSystemPrompt(newPrompt) {
        config.SYSTEM_PROMPT = newPrompt;
        process.env.SYSTEM_PROMPT = newPrompt;
        logger.info('🔄 System prompt updated');
    }
}

module.exports = new AIService();