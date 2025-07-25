const axios = require('axios');
const config = require('../config/config.js');
const logger = require('../utils/logger.js');

class GeometryDashAPI {
    constructor() {
        this.baseURL = config.GD_API_BASE;
        this.serverURL = config.GD_SERVER_BASE;
        this.timeout = 10000; // 10 seconds timeout
    }

    /**
     * Get level information by ID
     * @param {string|number} levelId - The level ID
     * @returns {Object|null} Level data or null if not found
     */
    async getLevelById(levelId) {
        try {
            logger.info(`Fetching level data for ID: ${levelId}`);

            const response = await axios.post(`${this.baseURL}/downloadGJLevel22.php`, 
                `levelID=${levelId}&secret=Wmfd2893gb7`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'GDVN Bot'
                    },
                    timeout: this.timeout
                }
            );

            if (response.data === '-1' || !response.data) {
                logger.warn(`Level not found for ID: ${levelId}`);
                return null;
            }

            return this.parseLevelData(response.data);

        } catch (error) {
            logger.error(`Error fetching level ${levelId}:`, error.message);
            
            // Try alternative API as fallback
            try {
                return await this.getLevelByIdFallback(levelId);
            } catch (fallbackError) {
                logger.error(`Fallback API also failed for level ${levelId}:`, fallbackError.message);
                throw new Error(`Không thể lấy thông tin level ${levelId}`);
            }
        }
    }

    /**
     * Fallback method using alternative API
     */
    async getLevelByIdFallback(levelId) {
        const response = await axios.get(`${this.serverURL}/level/${levelId}`, {
            timeout: this.timeout,
            headers: {
                'User-Agent': 'GDVN Bot'
            }
        });

        if (!response.data || response.data.error) {
            return null;
        }

        return this.normalizeAlternativeData(response.data);
    }

    /**
     * Search levels by name
     * @param {string} query - Search query
     * @param {number} limit - Maximum number of results
     * @returns {Array} Array of level objects
     */
    async searchLevels(query, limit = 10) {
        try {
            logger.info(`Searching levels with query: ${query}`);

            const response = await axios.post(`${this.baseURL}/getGJLevels21.php`,
                `str=${encodeURIComponent(query)}&type=0&page=0&secret=Wmfd2893gb7`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'GDVN Bot'
                    },
                    timeout: this.timeout
                }
            );

            if (response.data === '-1' || !response.data) {
                logger.warn(`No levels found for query: ${query}`);
                return [];
            }

            const levels = this.parseSearchResults(response.data);
            return levels.slice(0, limit);

        } catch (error) {
            logger.error(`Error searching levels with query "${query}":`, error.message);
            
            // Try alternative search API
            try {
                return await this.searchLevelsFallback(query, limit);
            } catch (fallbackError) {
                logger.error(`Fallback search also failed for query "${query}":`, fallbackError.message);
                throw new Error(`Không thể tìm kiếm level với từ khóa "${query}"`);
            }
        }
    }

    /**
     * Fallback search method
     */
    async searchLevelsFallback(query, limit = 10) {
        const response = await axios.get(`${this.serverURL}/search/${encodeURIComponent(query)}`, {
            timeout: this.timeout,
            headers: {
                'User-Agent': 'GDVN Bot'
            }
        });

        if (!response.data || !Array.isArray(response.data)) {
            return [];
        }

        return response.data.slice(0, limit).map(level => this.normalizeAlternativeData(level));
    }

    /**
     * Parse level data from GD server response
     */
    parseLevelData(data) {
        const parts = data.split('#')[0].split(':');
        const levelData = {};

        for (let i = 0; i < parts.length; i += 2) {
            if (parts[i + 1] !== undefined) {
                levelData[parts[i]] = parts[i + 1];
            }
        }

        return {
            id: parseInt(levelData['1']) || 0,
            name: this.decodeGDString(levelData['2']) || 'Unknown',
            description: this.decodeGDString(levelData['3']) || '',
            author: levelData['6'] || 'Unknown',
            difficulty: parseInt(levelData['9']) || 0,
            downloads: parseInt(levelData['10']) || 0,
            likes: parseInt(levelData['14']) || 0,
            length: parseInt(levelData['15']) || 0,
            song: levelData['12'] || 'Stereo Madness',
            featured: levelData['19'] === '1',
            epic: levelData['42'] === '1',
            stars: parseInt(levelData['18']) || 0,
            coins: parseInt(levelData['37']) || 0,
            requestedStars: parseInt(levelData['39']) || 0
        };
    }

    /**
     * Parse search results from GD server response
     */
    parseSearchResults(data) {
        const levels = [];
        const levelStrings = data.split('#')[0].split('|');

        levelStrings.forEach(levelString => {
            if (levelString.trim()) {
                const parts = levelString.split(':');
                const levelData = {};

                for (let i = 0; i < parts.length; i += 2) {
                    if (parts[i + 1] !== undefined) {
                        levelData[parts[i]] = parts[i + 1];
                    }
                }

                levels.push({
                    id: parseInt(levelData['1']) || 0,
                    name: this.decodeGDString(levelData['2']) || 'Unknown',
                    author: levelData['6'] || 'Unknown',
                    difficulty: parseInt(levelData['9']) || 0,
                    downloads: parseInt(levelData['10']) || 0,
                    likes: parseInt(levelData['14']) || 0,
                    length: parseInt(levelData['15']) || 0,
                    featured: levelData['19'] === '1',
                    epic: levelData['42'] === '1',
                    stars: parseInt(levelData['18']) || 0
                });
            }
        });

        return levels;
    }

    /**
     * Normalize data from alternative API
     */
    normalizeAlternativeData(data) {
        return {
            id: data.id || 0,
            name: data.name || 'Unknown',
            description: data.description || '',
            author: data.author || data.creator || 'Unknown',
            difficulty: this.mapDifficultyFromName(data.difficulty) || 0,
            downloads: data.downloads || 0,
            likes: data.likes || 0,
            length: this.mapLengthFromName(data.length) || 0,
            song: data.song || 'Stereo Madness',
            featured: data.featured || false,
            epic: data.epic || false,
            stars: data.stars || 0,
            coins: data.coins || 0
        };
    }

    /**
     * Decode GD base64-like string
     */
    decodeGDString(str) {
        if (!str) return '';
        try {
            return decodeURIComponent(str);
        } catch {
            return str;
        }
    }

    /**
     * Map difficulty name to number
     */
    mapDifficultyFromName(difficultyName) {
        const difficultyMap = {
            'Easy': 10,
            'Normal': 20,
            'Hard': 30,
            'Harder': 40,
            'Insane': 50,
            'Demon': 50
        };
        return difficultyMap[difficultyName] || 0;
    }

    /**
     * Map length name to number
     */
    mapLengthFromName(lengthName) {
        const lengthMap = {
            'Tiny': 0,
            'Short': 1,
            'Medium': 2,
            'Long': 3,
            'XL': 4
        };
        return lengthMap[lengthName] || 0;
    }
}

module.exports = new GeometryDashAPI();
