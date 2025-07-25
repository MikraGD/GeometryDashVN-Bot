const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config/config.js');
const logger = require('../utils/logger.js');
const dbUtils = require('../utils/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban một thành viên khỏi server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Người dùng cần ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Lý do ban')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const reason = interaction.options.getString('reason') || 'Không có lý do';

        // Check if user exists in guild
        if (!member) {
            return interaction.reply({
                content: '❌ Không tìm thấy người dùng này trong server.',
                ephemeral: true
            });
        }

        // Check if user can be banned
        if (!member.bannable) {
            return interaction.reply({
                content: '❌ Không thể ban người dùng này (có thể do role cao hơn hoặc là owner).',
                ephemeral: true
            });
        }

        try {
            // Ban the user
            await member.ban({ reason: `${reason} - Banned by ${interaction.user.tag}` });

            // Create embed for confirmation
            const banEmbed = new EmbedBuilder()
                .setTitle('🔨 Người dùng đã bị ban')
                .addFields(
                    { name: '👤 Người dùng', value: `${user.tag} (${user.id})`, inline: true },
                    { name: '👮 Ban bởi', value: interaction.user.tag, inline: true },
                    { name: '📝 Lý do', value: reason, inline: false }
                )
                .setColor(config.COLORS.ERROR)
                .setTimestamp()
                .setThumbnail(user.displayAvatarURL());

            await interaction.reply({ embeds: [banEmbed] });

            // Log to designated channel
            if (config.LOG_CHANNEL_ID && config.LOG_CHANNEL_ID !== '') {
                const logChannel = interaction.guild.channels.cache.get(config.LOG_CHANNEL_ID);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('🔨 Ban Log')
                        .addFields(
                            { name: '👤 Banned User', value: `${user.tag} (${user.id})`, inline: true },
                            { name: '👮 Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                            { name: '📍 Channel', value: `${interaction.channel.name}`, inline: true },
                            { name: '📝 Reason', value: reason, inline: false }
                        )
                        .setColor(config.COLORS.ERROR)
                        .setTimestamp();

                    await logChannel.send({ embeds: [logEmbed] });
                }
            }

            // Log to database
            await dbUtils.logCommand(interaction, 'ban', true);

            logger.info(`🔨 ${user.tag} đã bị ban bởi ${interaction.user.tag} - Lý do: ${reason}`);

        } catch (error) {
            logger.error('❌ Lỗi khi ban người dùng:', error);
            await interaction.reply({
                content: '❌ Đã xảy ra lỗi khi ban người dùng này.',
                ephemeral: true
            });
        }
    }
};