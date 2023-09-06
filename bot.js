import config from './config.js';
import { Bot } from 'grammy';

const bot = new Bot(config.TELEGRAM_BOT_TOKEN);

bot.on("message", (ctx) => ctx.reply(ctx.chat.id));
bot.command('s', ctx => ctx.reply())
// bot.api.setChatMenuButton()

bot.start();