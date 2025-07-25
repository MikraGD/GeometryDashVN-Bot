const axios = require('axios');
const logger = require('../utils/logger.js');

class DemonListAPI {
    constructor() {
        this.baseURL = 'https://pointercrate.com/api/v2';
        this.timeout = 10000;
    }

    // Get top demons from Pointercrate
    async getTopDemons(limit = 100) {
        try {
            logger.info(`🔍 Fetching top ${limit} demons from Pointercrate...`);
            
            const response = await axios.get(`${this.baseURL}/demons`, {
                params: {
                    limit: limit,
                    listed: true
                },
                timeout: this.timeout,
                headers: {
                    'User-Agent': 'GDVN Bot - Vietnamese GD Community Bot'
                }
            });

            if (response.data && Array.isArray(response.data)) {
                logger.info(`✅ Successfully fetched ${response.data.length} demons from Pointercrate`);
                return response.data.map(demon => ({
                    position: demon.position,
                    name: demon.name,
                    creator: demon.publisher ? demon.publisher.name : 'Unknown',
                    video: demon.video || null,
                    id: demon.id,
                    level_id: demon.level_id || null,
                    points: this.calculatePoints(demon.position)
                }));
            }

            throw new Error('Invalid response format from Pointercrate API');

        } catch (error) {
            logger.error('❌ Error fetching demon list from Pointercrate:', error.message);
            
            // Fallback to backup API or cached data if needed
            return this.getFallbackDemonList();
        }
    }

    // Calculate demon points based on position
    calculatePoints(position) {
        if (position <= 50) {
            return Math.round(56.191 * Math.pow(2, (51 - position) / 50) + 83.809);
        } else if (position <= 100) {
            return Math.round(212.61 * Math.pow(2, (51 - position) / 50) - 84.61);
        } else if (position <= 150) {
            return Math.round(79.508 * Math.pow(2, (100 - position) / 50) + 3.492);
        }
        return 0;
    }

    // Fallback demon list in case API is down
    getFallbackDemonList() {
        logger.warn('⚠️ Using fallback demon list data');
        return [
            { position: 1, name: 'SILENT CLUBSTEP', creator: 'sailent', points: 1500, video: null },
            { position: 2, name: 'Acheron', creator: 'ryamu', points: 1450, video: null },
            { position: 3, name: 'Slaughterhouse', creator: 'Icedcave', points: 1400, video: null },
            { position: 4, name: 'Hard Machine', creator: 'komp', points: 1350, video: null },
            { position: 5, name: 'Abyss of Darkness', creator: 'Exen', points: 1300, video: null },
            { position: 6, name: 'Tidal Wave', creator: 'OlimPicBoi', points: 1250, video: null },
            { position: 7, name: 'LIMBO', creator: 'MindCap', points: 1200, video: null },
            { position: 8, name: 'Firework', creator: 'TrickGMD', points: 1150, video: null },
            { position: 9, name: 'Arcturus', creator: 'Maxfs', points: 1100, video: null },
            { position: 10, name: 'Cursed', creator: 'Mbed', points: 1050, video: null }
        ];
    }

    // Get demons for a specific page (10 demons per page)
    getDemonPage(demons, page) {
        const pageSize = 10;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        
        return {
            demons: demons.slice(startIndex, endIndex),
            currentPage: page,
            totalPages: Math.ceil(demons.length / pageSize),
            hasNext: endIndex < demons.length,
            hasPrev: page > 1
        };
    }

    // Get demon details by position
    async getDemonDetails(position) {
        try {
            const demons = await this.getTopDemons();
            return demons.find(demon => demon.position === position);
        } catch (error) {
            logger.error('❌ Error getting demon details:', error.message);
            return null;
        }
    }
}

module.exports = new DemonListAPI();