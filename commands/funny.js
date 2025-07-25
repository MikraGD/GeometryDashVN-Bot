const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config/config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('funny')
        .setDescription('Gửi một tin nhắn hài hước'),

    async execute(interaction) {
        const funnyMessages = [
            'https://tenor.com/view/meme-funny-lol-gif-18250642',
            'https://tenor.com/view/geometry-dash-gd-funny-meme-gif-12345',
            'Tại sao player Geometry Dash luôn stress? Vì họ cứ bị "spike" trong cuộc sống! 😂',
            'Bạn biết tại sao Stereo Madness dễ không? Vì nó chỉ cần... JUMP! 🤣',
            'Khi bạn die ở 99%: "Tại sao tôi lại chơi game này?" 😭',
            'Bloodbath players be like: "Ez level" *proceeds to die at 4%* 💀',
            'Normal people: Relaxing music 😌\nGD players: FIRE IN THE HOLE! 🔥',
            'Khi bạn finally beat một extreme demon: "I AM THE BEST PLAYER EVER!" 🎉'
        ];

        const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
        
        const funnyEmbed = new EmbedBuilder()
            .setTitle('🤣 GDVN Funny Corner')
            .setDescription(randomMessage)
            .setColor(config.COLORS.WARNING)
            .setFooter({ 
                text: 'GDVN Bot • Bringing laughs to the GD community!' 
            })
            .setTimestamp();

        await interaction.reply({ embeds: [funnyEmbed] });
    }
};