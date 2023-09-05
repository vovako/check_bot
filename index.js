import tgAPI from 'node-telegram-bot-api'
import config from './config.js'


const bot = new tgAPI(config.TELEGRAM_BOT_TOKEN, {
	polling: true
})


bot.on('text', async msg => {
	await bot.sendMessage(msg.chat.id, msg.text);
})