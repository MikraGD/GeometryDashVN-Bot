// We'll implement a simpler database utility without TypeScript imports for now
// This can be enhanced later when the TypeScript setup is fully configured
const logger = require('./logger.js');

class DatabaseUtils {
    constructor() {
        this.userCache = new Map();
        this.guildCache = new Map();
        this.commandStats = new Map();
    }

    // Simple in-memory storage for now - will be replaced with actual DB calls later
    async ensureUser(discordUser) {
        try {
            const key = discordUser.id;
            if (!this.userCache.has(key)) {
                const user = {
                    id: this.userCache.size + 1,
                    discordId: discordUser.id,
                    username: discordUser.username,
                    discriminator: discordUser.discriminator || '0',
                    avatar: discordUser.avatar,
                    joinedAt: new Date(),
                    lastSeen: new Date(),
                    commandsUsed: 0,
                    isActive: true
                };
                this.userCache.set(key, user);
                logger.info(`👤 Created new user in cache: ${discordUser.username}`);
            }
            
            return this.userCache.get(key);
        } catch (error) {
            logger.error('❌ Error ensuring user exists:', error);
            return null;
        }
    }

    // Ensure guild exists in cache
    async ensureGuild(discordGuild) {
        try {
            const key = discordGuild.id;
            if (!this.guildCache.has(key)) {
                const guild = {
                    id: this.guildCache.size + 1,
                    guildId: discordGuild.id,
                    name: discordGuild.name,
                    ownerId: discordGuild.ownerId,
                    memberCount: discordGuild.memberCount,
                    addedAt: new Date(),
                    lastActive: new Date(),
                    settings: {},
                    isActive: true
                };
                this.guildCache.set(key, guild);
                logger.info(`🏠 Created new guild in cache: ${discordGuild.name}`);
            }
            
            return this.guildCache.get(key);
        } catch (error) {
            logger.error('❌ Error ensuring guild exists:', error);
            return null;
        }
    }

    // Log command usage
    async logCommand(interaction, commandName, success = true, executionTime = 0, errorMessage = null) {
        try {
            const user = await this.ensureUser(interaction.user);
            const guild = interaction.guild ? await this.ensureGuild(interaction.guild) : null;

            if (user) {
                const key = `${commandName}_${guild ? guild.id : 'dm'}`;
                if (!this.commandStats.has(key)) {
                    this.commandStats.set(key, {
                        commandName,
                        count: 0,
                        successCount: 0,
                        totalExecutionTime: 0
                    });
                }
                
                const stats = this.commandStats.get(key);
                stats.count++;
                if (success) stats.successCount++;
                stats.totalExecutionTime += executionTime;
                
                // Update user activity
                user.commandsUsed++;
                user.lastSeen = new Date();
                
                logger.info(`📊 Command logged: ${commandName} by ${interaction.user.username}`);
            }
        } catch (error) {
            logger.error('❌ Error logging command usage:', error);
        }
    }

    // Save AI chat to cache
    async saveAiChat(interaction, message, response, tokensUsed, model) {
        try {
            const user = await this.ensureUser(interaction.user);
            if (user) {
                logger.info(`🤖 AI chat logged: ${interaction.user.username} used ${tokensUsed} tokens`);
            }
        } catch (error) {
            logger.error('❌ Error saving AI chat:', error);
        }
    }

    // Get user statistics
    async getUserStats(discordId) {
        try {
            const user = this.userCache.get(discordId);
            return user ? {
                commandsUsed: user.commandsUsed || 0,
                lastSeen: user.lastSeen
            } : { commandsUsed: 0, lastSeen: null };
        } catch (error) {
            logger.error('❌ Error getting user stats:', error);
            return { commandsUsed: 0, lastSeen: null };
        }
    }

    // Get command statistics
    async getCommandStats(guildId = null) {
        try {
            const stats = Array.from(this.commandStats.values()).map(stat => ({
                commandName: stat.commandName,
                count: stat.count,
                avgExecutionTime: stat.totalExecutionTime / stat.count,
                successRate: (stat.successCount / stat.count) * 100
            })).sort((a, b) => b.count - a.count);
            
            return stats;
        } catch (error) {
            logger.error('❌ Error getting command stats:', error);
            return [];
        }
    }

    // Get moderation logs (placeholder)
    async getModerationLogs(guildId, limit = 10) {
        try {
            return []; // Will be implemented when database is fully set up
        } catch (error) {
            logger.error('❌ Error getting moderation logs:', error);
            return [];
        }
    }
}

module.exports = new DatabaseUtils();