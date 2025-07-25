import { users, guilds, commandUsage, aiChatHistory, moderationLogs, type User, type InsertUser, type Guild, type InsertGuild, type InsertCommandUsage, type InsertAiChatHistory, type InsertModerationLog } from "../shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(discordId: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUserActivity(discordId: string): Promise<void>;
  getUserStats(discordId: string): Promise<{ commandsUsed: number; lastSeen: Date | null }>;

  // Guild methods
  getGuild(guildId: string): Promise<Guild | undefined>;
  createGuild(insertGuild: InsertGuild): Promise<Guild>;
  updateGuildSettings(guildId: string, settings: any): Promise<void>;

  // Command usage tracking
  logCommandUsage(usage: InsertCommandUsage): Promise<void>;
  getCommandStats(guildId?: string): Promise<any[]>;

  // AI chat history
  saveAiChat(chat: InsertAiChatHistory): Promise<void>;
  getAiChatHistory(userId: number, limit?: number): Promise<any[]>;

  // Moderation logs
  logModerationAction(log: InsertModerationLog): Promise<void>;
  getModerationLogs(guildId: string, limit?: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(discordId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.discordId, discordId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserActivity(discordId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        lastSeen: new Date(),
        commandsUsed: sql`${users.commandsUsed} + 1`
      })
      .where(eq(users.discordId, discordId));
  }

  async getUserStats(discordId: string): Promise<{ commandsUsed: number; lastSeen: Date | null }> {
    const [user] = await db
      .select({
        commandsUsed: users.commandsUsed,
        lastSeen: users.lastSeen
      })
      .from(users)
      .where(eq(users.discordId, discordId));
    
    return user ? {
      commandsUsed: user.commandsUsed || 0,
      lastSeen: user.lastSeen
    } : { commandsUsed: 0, lastSeen: null };
  }

  async getGuild(guildId: string): Promise<Guild | undefined> {
    const [guild] = await db.select().from(guilds).where(eq(guilds.guildId, guildId));
    return guild || undefined;
  }

  async createGuild(insertGuild: InsertGuild): Promise<Guild> {
    const [guild] = await db
      .insert(guilds)
      .values(insertGuild)
      .returning();
    return guild;
  }

  async updateGuildSettings(guildId: string, settings: any): Promise<void> {
    await db
      .update(guilds)
      .set({ 
        settings,
        lastActive: new Date()
      })
      .where(eq(guilds.guildId, guildId));
  }

  async logCommandUsage(usage: InsertCommandUsage): Promise<void> {
    await db.insert(commandUsage).values(usage);
  }

  async getCommandStats(guildId?: string): Promise<any[]> {
    let query = db
      .select({
        commandName: commandUsage.commandName,
        count: sql<number>`count(*)`,
        avgExecutionTime: sql<number>`avg(${commandUsage.executionTime})`,
        successRate: sql<number>`(count(*) filter (where ${commandUsage.success} = true) * 100.0 / count(*))`
      })
      .from(commandUsage)
      .groupBy(commandUsage.commandName)
      .orderBy(desc(sql`count(*)`));

    if (guildId) {
      const guild = await this.getGuild(guildId);
      if (guild) {
        query = query.where(eq(commandUsage.guildId, guild.id)) as any;
      }
    }

    return await query;
  }

  async saveAiChat(chat: InsertAiChatHistory): Promise<void> {
    await db.insert(aiChatHistory).values(chat);
  }

  async getAiChatHistory(userId: number, limit: number = 10): Promise<any[]> {
    return await db
      .select()
      .from(aiChatHistory)
      .where(eq(aiChatHistory.userId, userId))
      .orderBy(desc(aiChatHistory.createdAt))
      .limit(limit);
  }

  async logModerationAction(log: InsertModerationLog): Promise<void> {
    await db.insert(moderationLogs).values(log);
  }

  async getModerationLogs(guildId: string, limit: number = 50): Promise<any[]> {
    const guild = await this.getGuild(guildId);
    if (!guild) return [];

    return await db
      .select({
        id: moderationLogs.id,
        action: moderationLogs.action,
        targetId: moderationLogs.targetId,
        reason: moderationLogs.reason,
        duration: moderationLogs.duration,
        createdAt: moderationLogs.createdAt,
        moderator: {
          username: users.username,
          discordId: users.discordId
        }
      })
      .from(moderationLogs)
      .leftJoin(users, eq(moderationLogs.moderatorId, users.id))
      .where(eq(moderationLogs.guildId, guild.id))
      .orderBy(desc(moderationLogs.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();