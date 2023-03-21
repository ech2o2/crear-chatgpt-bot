import 'module-alias/register';

import { createBot } from '@/bot';
import { createServer } from '@/server';

import { container } from './container';

async function main() {
    const { config, logger } = container.items;

    const bot = createBot(config.BOT_TOKEN, {
        container
    });

    await bot.init();

    const server = await createServer(bot, container);

    if (config.isProd) {
        await server.listen({
            port: config.BOT_SERVER_PORT
        });

        await bot.api.setWebhook(config.BOT_WEBHOOK, {
            allowed_updates: config.BOT_ALLOWED_UPDATES
        });
    } else if (config.isDev) {
        await bot.start({
            allowed_updates: config.BOT_ALLOWED_UPDATES,
            onStart: ({ username }) =>
                logger.info({
                    msg: 'bot running...',
                    username
                })
        });
    }
}

main().catch((err) => {
    container.items.logger.error(err);
    process.exit(1);
});