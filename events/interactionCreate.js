const logger = require('../utils/logger.js');
const vietnamese = require('../utils/vietnamese.js');
const commandHandler = require('../handlers/commandHandler.js');
const { EmbedBuilder } = require('discord.js');
const config = require('../config/config.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            await handleSlashCommand(interaction);
        }

        // Handle button interactions (if implemented later)
        if (interaction.isButton()) {
            await handleButtonInteraction(interaction);
        }

        // Handle select menu interactions (if implemented later)
        if (interaction.isStringSelectMenu()) {
            await handleSelectMenuInteraction(interaction);
        }
    }
};

async function handleSlashCommand(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        logger.warn(`Unknown command attempted: ${interaction.commandName} by ${interaction.user.tag}`);
        
        await interaction.reply({
            content: vietnamese.phrases.invalidCommand,
            ephemeral: true
        });
        return;
    }

    try {
        // Check cooldown
        const cooldownTime = commandHandler.handleCooldown(interaction, command);
        if (cooldownTime) {
            const cooldownEmbed = new EmbedBuilder()
                .setColor(config.COLORS.WARNING)
                .setTitle('⏰ Chờ một chút!')
                .setDescription(`Bạn cần chờ ${cooldownTime.toFixed(1)} giây nữa trước khi sử dụng lệnh \`${command.data.name}\` lại.`)
                .setTimestamp();

            await interaction.reply({ 
                embeds: [cooldownEmbed], 
                ephemeral: true 
            });
            return;
        }

        // Log command usage
        logger.info(`Command ${interaction.commandName} executed by ${interaction.user.tag} in ${interaction.guild?.name || 'DM'}`);

        // Execute the command
        await command.execute(interaction);

    } catch (error) {
        logger.error(`Error executing command ${interaction.commandName}:`, error);

        const errorEmbed = new EmbedBuilder()
            .setColor(config.COLORS.ERROR)
            .setTitle('❌ Đã xảy ra lỗi')
            .setDescription('Xin lỗi, có lỗi xảy ra khi thực hiện lệnh này. Vui lòng thử lại sau.')
            .addFields(
                { name: '🔍 Mã lỗi', value: `CMD_${Date.now()}`, inline: true },
                { name: '📞 Hỗ trợ', value: 'Liên hệ admin nếu lỗi tiếp tục xảy ra', inline: true }
            )
            .setTimestamp();

        const replyOptions = { embeds: [errorEmbed], ephemeral: true };

        if (interaction.replied || interaction.deferred) {
            await interaction.editReply(replyOptions);
        } else {
            await interaction.reply(replyOptions);
        }
    }
}

async function handleButtonInteraction(interaction) {
    const customId = interaction.customId;
    
    // Handle demon list navigation
    if (customId.startsWith('demonlist_')) {
        await handleDemonListNavigation(interaction);
        return;
    }
    
    // Handle other button interactions here
    logger.debug(`Unhandled button interaction: ${customId} by ${interaction.user.tag}`);
    
    await interaction.reply({
        content: 'Chức năng này chưa được hỗ trợ.',
        ephemeral: true
    });
}

async function handleDemonListNavigation(interaction) {
    const [, action, currentPage, userId] = interaction.customId.split('_');
    
    // Check if the user is authorized to use this button
    if (userId && interaction.user.id !== userId) {
        await interaction.reply({
            content: '❌ Bạn không thể sử dụng nút này. Hãy tạo lệnh `/demonlist` riêng của bạn.',
            ephemeral: true
        });
        return;
    }
    
    try {
        await interaction.deferUpdate();
        
        const demonListAPI = require('../services/demonListAPI.js');
        const demonListCommand = require('../commands/demonlist.js');
        
        let newPage = parseInt(currentPage);
        
        if (action === 'next') {
            newPage += 1;
        } else if (action === 'prev') {
            newPage -= 1;
        } else if (action === 'refresh') {
            // Keep current page but refresh data
        }
        
        // Fetch demon list data
        const demons = await demonListAPI.getTopDemons(100);
        const pageData = demonListAPI.getDemonPage(demons, newPage);
        
        if (pageData.demons.length === 0) {
            await interaction.followUp({
                content: '❌ Trang không tồn tại.',
                ephemeral: true
            });
            return;
        }
        
        // Create updated embed and buttons
        const embed = demonListCommand.createDemonListEmbed(pageData, demons.length);
        const buttons = demonListCommand.createNavigationButtons(pageData, interaction.user.id);
        
        await interaction.editReply({
            embeds: [embed],
            components: buttons.length > 0 ? [buttons] : []
        });
        
        logger.info(`🔥 Demon list page ${newPage} loaded by ${interaction.user.username}`);
        
    } catch (error) {
        logger.error('❌ Error handling demon list navigation:', error);
        
        await interaction.followUp({
            content: '❌ Có lỗi xảy ra khi tải trang. Vui lòng thử lại.',
            ephemeral: true
        });
    }
}

async function handleSelectMenuInteraction(interaction) {
    // Placeholder for future select menu interactions
    logger.debug(`Select menu interaction: ${interaction.customId} by ${interaction.user.tag}`);
    
    await interaction.reply({
        content: 'Chức năng này sẽ được thêm trong bản cập nhật tương lai!',
        ephemeral: true
    });
}
