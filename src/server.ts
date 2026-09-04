import { log } from 'node:console';
import { app } from './app.js';
import { Config } from './config/index.js';

function startServer() {
    const PORT = Config.PORT;
    try {
        app.listen(PORT, () => {
            log(`server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

startServer();
