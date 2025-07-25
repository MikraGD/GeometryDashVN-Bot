import { pgTable, serial, text, integer, timestamp, boolean, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table - store Discord user information
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  discordId: text('discord_id').notNull().unique(),
  username: text('username').notNull(),
  discriminator: text('discriminator'),
  avatar: text('avatar'),
  joinedAt: timestamp('joined_at').defaultNow(),
  lastSeen: timestamp('last_seen').defaultNow(),
  commandsUsed: integer('commands_used').default(0),
  isActive: boolean('is_active').default(true)
});

// Guilds table - store Discord server information
export const guilds = pgTable('guilds', {
  id: serial('id').primaryKey(),
  guildId: text('guild_id').notNull().unique(),
  name: text('name').notNull(),
  ownerId: text('owner_id').notNull(),
  memberCount: integer('member_count').default(0),
  addedAt: timestamp('added_at').defaultNow(),
  lastActive: timestamp('last_active').defaultNow(),
  settings: json('settings').$type<{
    prefix?: string;
    autoRoleId?: string;
    logChannelId?: string;
    welcomeChannelId?: string;
    aiEnabled?: boolean;
  }>(),
  isActive: boolean('is_active').default(true)
});

// Command usage tracking
export const commandUsage = pgTable('command_usage', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  guildId: integer('guild_id').references(() => guilds.id),
  commandName: text('command_name').notNull(),
  usedAt: timestamp('used_at').defaultNow(),
  success: boolean('success').default(true),
  errorMessage: text('error_message'),
  executionTime: integer('execution_time') // in milliseconds
});

// AI chat history
export const aiChatHistory = pgTable('ai_chat_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  guildId: integer('guild_id').references(() => guilds.id),
  message: text('message').notNull(),
  response: text('response').notNull(),
  tokensUsed: integer('tokens_used'),
  model: text('model').default('gpt-3.5-turbo'),
  createdAt: timestamp('created_at').defaultNow()
});

// Moderation logs
export const moderationLogs = pgTable('moderation_logs', {
  id: serial('id').primaryKey(),
  guildId: integer('guild_id').references(() => guilds.id),
  moderatorId: integer('moderator_id').references(() => users.id),
  targetId: text('target_id').notNull(), // Discord ID of target user
  action: text('action').notNull(), // ban, kick, mute, etc.
  reason: text('reason'),
  duration: integer('duration'), // in minutes, null for permanent
  createdAt: timestamp('created_at').defaultNow(),
  active: boolean('active').default(true)
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  commandUsage: many(commandUsage),
  aiChatHistory: many(aiChatHistory),
  moderationActions: many(moderationLogs, { relationName: 'moderator' })
}));

export const guildsRelations = relations(guilds, ({ many }) => ({
  commandUsage: many(commandUsage),
  aiChatHistory: many(aiChatHistory),
  moderationLogs: many(moderationLogs)
}));

export const commandUsageRelations = relations(commandUsage, ({ one }) => ({
  user: one(users, {
    fields: [commandUsage.userId],
    references: [users.id]
  }),
  guild: one(guilds, {
    fields: [commandUsage.guildId],
    references: [guilds.id]
  })
}));

export const aiChatHistoryRelations = relations(aiChatHistory, ({ one }) => ({
  user: one(users, {
    fields: [aiChatHistory.userId],
    references: [users.id]
  }),
  guild: one(guilds, {
    fields: [aiChatHistory.guildId],
    references: [guilds.id]
  })
}));

export const moderationLogsRelations = relations(moderationLogs, ({ one }) => ({
  guild: one(guilds, {
    fields: [moderationLogs.guildId],
    references: [guilds.id]
  }),
  moderator: one(users, {
    fields: [moderationLogs.moderatorId],
    references: [users.id],
    relationName: 'moderator'
  })
}));

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Guild = typeof guilds.$inferSelect;
export type InsertGuild = typeof guilds.$inferInsert;
export type CommandUsage = typeof commandUsage.$inferSelect;
export type InsertCommandUsage = typeof commandUsage.$inferInsert;
export type AiChatHistory = typeof aiChatHistory.$inferSelect;
export type InsertAiChatHistory = typeof aiChatHistory.$inferInsert;
export type ModerationLog = typeof moderationLogs.$inferSelect;
export type InsertModerationLog = typeof moderationLogs.$inferInsert;