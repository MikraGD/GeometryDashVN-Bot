const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger.js');

const commandHandler = {
    /**
     * Load all commands from the commands directory
     */
    loadCommands(client) {
        const commandsPath = path.join(__dirname, '..', 'commands');
        
        if (!fs.existsSync(commandsPath)) {
            logger.error('Commands directory not found!');
            return;
        }

        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        let loadedCommands = 0;

        for (const file of commandFiles) {
            try {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);

                // Validate command structure
                if (!command.data || !command.execute) {
                    logger.warn(`Command ${file} is missing required 'data' or 'execute' properties`);
                    continue;
                }

                // Set the command in the collection
                client.commands.set(command.data.name, command);
                loadedCommands++;
                logger.debug(`Loaded command: ${command.data.name}`);

            } catch (error) {
                logger.error(`Error loading command ${file}:`, error);
            }
        }

        logger.info(`Successfully loaded ${loadedCommands} commands`);
    },

    /**
     * Register slash commands with Discord
     */
    async registerCommands(client) {
        try {
            logger.info('Registering slash commands...');

            const commands = [];
            client.commands.forEach(command => {
                commands.push(command.data.toJSON());
            });

            // Register commands globally
            const rest = require('@discordjs/rest');
            const { Routes } = require('discord-api-types/v9');
            const config = require('../config/config.js');

            const restClient = new rest.REST({ version: '9' }).setToken(config.DISCORD_TOKEN);

            await restClient.put(
                Routes.applicationCommands(config.CLIENT_ID),
                { body: commands }
            );

            logger.info(`Successfully registered ${commands.length} slash commands`);

        } catch (error) {
            logger.error('Error registering slash commands:', error);
        }
    },

    /**
     * Handle command cooldowns
     */
    handleCooldown(interaction, command) {
        const { cooldowns } = interaction.client;
        const config = require('../config/config.js');

        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Map());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const cooldownAmount = (command.cooldown || config.COMMAND_COOLDOWN);

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return timeLeft;
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
        
        return false;
    }
};

module.exports = commandHandler;
