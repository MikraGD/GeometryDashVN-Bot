const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const config = require('../config/config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Kiểm tra độ trễ của bot'),

    async execute(interaction) {
        const sent = await interaction.deferReply({ fetchReply: true });
        const timeDiff = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        let latencyColor = config.COLORS.SUCCESS;
        let latencyStatus = 'Tuyệt vời';

        if (timeDiff > 200 || apiLatency > 200) {
            latencyColor = config.COLORS.WARNING;
            latencyStatus = 'Bình thường';
        }
        if (timeDiff > 500 || apiLatency > 500) {
            latencyColor = config.COLORS.ERROR;
            latencyStatus = 'Chậm';
        }

        const pingEmbed = new EmbedBuilder()
            .setColor(latencyColor)
            .setTitle('🏓 Pong!')
            .addFields(
                { name: '📡 Độ trễ Bot', value: `${timeDiff}ms`, inline: true },
                { name: '🌐 Độ trễ API', value: `${apiLatency}ms`, inline: true },
                { name: '📊 Trạng thái', value: latencyStatus, inline: true }
            )
            .setFooter({ text: 'GDVN Bot • Geometry Dash Việt Nam' })
            .setTimestamp();

        await interaction.editReply({ embeds: [pingEmbed] });
    }
};
