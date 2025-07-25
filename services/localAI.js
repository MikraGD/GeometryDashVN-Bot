const logger = require('../utils/logger.js');

class LocalAI {
    constructor() {
        this.knowledgeBase = {
            // Geometry Dash difficulty levels
            difficulties: {
                'easy': 'Dễ - Levels dành cho người mới bắt đầu, thường có 1-2 sao',
                'normal': 'Bình thường - Levels cơ bản với 3-4 sao',
                'hard': 'Khó - Levels challenging với 5-6 sao',
                'harder': 'Khó hơn - Levels advanced với 7-8 sao',
                'insane': 'Điên rồ - Levels rất khó với 9 sao',
                'demon': 'Demon - Levels khó nhất, đòi hỏi kỹ năng cao'
            },

            // Popular demons and tips
            demons: {
                'clubstep': 'Clubstep - Demon đầu tiên của RobTop, tập trung vào timing và nhảy',
                'toe2': 'Theory of Everything 2 - Demon nổi tiếng với phần ship khó',
                'deadlocked': 'Deadlocked - Level cuối của RobTop với nhiều wave và ship',
                'bloodbath': 'Bloodbath - Extreme demon nổi tiếng, rất khó beat',
                'sonic wave': 'Sonic Wave - Extreme demon với speed portal và timing khó'
            },

            // Game modes and tips
            gamemodes: {
                'cube': 'Cube - Mode cơ bản, nhấn để nhảy',
                'ship': 'Ship - Giữ để bay lên, thả để bay xuống',
                'ball': 'Ball - Nhấn để đổi hướng gravity',
                'ufo': 'UFO - Nhấn để boost nhảy ngắn',
                'wave': 'Wave - Nhấn để bay lên, thả để bay xuống (liên tục)',
                'robot': 'Robot - Nhấn để nhảy cao, giữ để nhảy thấp',
                'spider': 'Spider - Teleport qua các portal'
            },

            // Common questions and answers
            faq: {
                'làm sao để beat demon': 'Để beat demon: 1) Practice mode trước, 2) Học timing chính xác, 3) Kiên nhẫn và luyện tập nhiều, 4) Xem video hướng dẫn',
                'cách tạo level': 'Vào Editor, chọn Create, dùng các block và decoration để design level. Nhớ test level trước khi publish!',
                'rate level': 'Chỉ moderator mới rate được level. Level cần unique, fun và quality tốt để được rate',
                'user coins': 'User coins ẩn trong level, cần skill để lấy. Giúp tăng stars và unlock icons',
                'geometry dash world': 'GD World là phiên bản free với levels từ GD Meltdown và GD World',
                'sync': 'Sync là việc gameplay match với nhạc. Level hay thường có sync tốt'
            },

            // Vietnamese GD community specific
            vietnam: {
                'gdvn': 'GDVN - Cộng đồng Geometry Dash Việt Nam, nơi share level và thảo luận',
                'vietnamese creators': 'Có nhiều creator Việt Nam tài năng như Knots, Dorami, và nhiều người khác',
                'discord vietnam': 'Discord GDVN là nơi giao lưu, share level và organized events'
            }
        };

        this.responses = {
            greetings: [
                'Xin chào! Tôi là AI assistant của GDVN Bot',
                'Hello! Tôi có thể giúp bạn về Geometry Dash',
                'Chào bạn! Hỏi tôi bất cứ điều gì về GD nhé'
            ],
            unknown: [
                'Xin lỗi, tôi chưa hiểu câu hỏi này. Hãy hỏi về Geometry Dash, demons, levels, hoặc gameplay!',
                'Tôi chưa có thông tin về điều này. Thử hỏi về difficulty, game modes, hoặc tips chơi GD!',
                'Câu hỏi này hơi khó với tôi. Hãy hỏi về levels, creators, hoặc cách chơi GD nhé!'
            ]
        };

        logger.info('🧠 Local AI Knowledge Base initialized');
    }

    async processQuestion(question) {
        try {
            const lowerQuestion = question.toLowerCase();
            
            // Check for greetings
            if (this.isGreeting(lowerQuestion)) {
                return this.getRandomResponse(this.responses.greetings);
            }

            // Search in knowledge base
            let response = this.searchKnowledge(lowerQuestion);
            
            if (!response) {
                response = this.getRandomResponse(this.responses.unknown);
            }

            return {
                success: true,
                response: response,
                source: 'GDVN Local AI'
            };

        } catch (error) {
            logger.error('❌ Local AI error:', error);
            return {
                success: false,
                error: 'Lỗi xử lý câu hỏi local AI'
            };
        }
    }

    isGreeting(text) {
        const greetings = ['xin chào', 'hello', 'hi', 'chào', 'hey'];
        return greetings.some(greeting => text.includes(greeting));
    }

    searchKnowledge(question) {
        // Search difficulties
        for (const [key, value] of Object.entries(this.knowledgeBase.difficulties)) {
            if (question.includes(key) || question.includes(key.replace('er', ''))) {
                return `📊 **${key.toUpperCase()}**\n\n${value}\n\n💡 Tip: Chơi từ dễ đến khó để improve skill!`;
            }
        }

        // Search demons
        for (const [key, value] of Object.entries(this.knowledgeBase.demons)) {
            if (question.includes(key.toLowerCase())) {
                return `👹 **${key.toUpperCase()}**\n\n${value}\n\n🎯 Tip: Practice mode là bạn thân của bạn!`;
            }
        }

        // Search game modes
        for (const [key, value] of Object.entries(this.knowledgeBase.gamemodes)) {
            if (question.includes(key)) {
                return `🎮 **${key.toUpperCase()} MODE**\n\n${value}\n\n⚡ Mỗi mode có technique riêng, hãy practice nhiều!`;
            }
        }

        // Search FAQ
        for (const [key, value] of Object.entries(this.knowledgeBase.faq)) {
            if (question.includes(key) || this.hasKeywords(question, key.split(' '))) {
                return `❓ **${key.toUpperCase()}**\n\n${value}\n\n🌟 Chúc bạn chơi game vui vẻ!`;
            }
        }

        // Search Vietnam community
        for (const [key, value] of Object.entries(this.knowledgeBase.vietnam)) {
            if (question.includes(key) || question.includes('việt nam') || question.includes('vietnam')) {
                return `🇻🇳 **CỘNG ĐỒNG VIỆT NAM**\n\n${value}\n\n💪 GDVN strong together!`;
            }
        }

        // General GD topics
        if (question.includes('geometry dash') || question.includes('gd')) {
            return '🎵 **GEOMETRY DASH**\n\nGame rhythm platformer nổi tiếng của RobTop Games!\n\n🎯 **Features:**\n• Nhảy theo nhịp điệu\n• Tạo level custom\n• Cộng đồng sáng tạo\n• Hàng ngàn levels user-made\n\n💡 Hãy hỏi tôi về difficulty, demons, hoặc gameplay tips!';
        }

        if (question.includes('level') || question.includes('tạo')) {
            return '🛠️ **TẠO LEVEL**\n\nDùng Editor trong game để tạo level của riêng bạn!\n\n📋 **Tips:**\n• Bắt đầu đơn giản\n• Sync với nhạc\n• Test kỹ trước khi publish\n• Dùng decoration hợp lý\n\n🎨 Creativity là giới hạn duy nhất!';
        }

        return null;
    }

    hasKeywords(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    }

    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Add new knowledge
    addKnowledge(category, key, value) {
        if (!this.knowledgeBase[category]) {
            this.knowledgeBase[category] = {};
        }
        this.knowledgeBase[category][key] = value;
        logger.info(`📚 Added knowledge: ${category}.${key}`);
    }
}

module.exports = new LocalAI();