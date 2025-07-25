const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger.js');

const eventHandler = {
    /**
     * Load all events from the events directory
     */
    loadEvents(client) {
        const eventsPath = path.join(__dirname, '..', 'events');
        
        if (!fs.existsSync(eventsPath)) {
            logger.error('Events directory not found!');
            return;
        }

        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
        let loadedEvents = 0;

        for (const file of eventFiles) {
            try {
                const filePath = path.join(eventsPath, file);
                const event = require(filePath);

                // Validate event structure
                if (!event.name || !event.execute) {
                    logger.warn(`Event ${file} is missing required 'name' or 'execute' properties`);
                    continue;
                }

                // Register the event
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args));
                } else {
                    client.on(event.name, (...args) => event.execute(...args));
                }

                loadedEvents++;
                logger.debug(`Loaded event: ${event.name}`);

            } catch (error) {
                logger.error(`Error loading event ${file}:`, error);
            }
        }

        logger.info(`Successfully loaded ${loadedEvents} events`);
    }
};

module.exports = eventHandler;
