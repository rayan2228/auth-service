import { app } from './app.js';
import { Config } from './config/index.js';
import { logger } from './config/logger.js';
import { AppDataSource } from './data-source.js';

async function startServer() {
    const PORT = Config.PORT;
    try {
        await AppDataSource.initialize();
        logger.info('database connected....');
        app.listen(PORT, () => {
            logger.info(`server is running`, { PORT });
        });
    } catch (err) {
        logger.error(err);
        process.exit(1);
    }
}

await startServer();
