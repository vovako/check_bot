import express from 'express'
import { setRoutes,setApi } from './backend/route.js'

process.on('uncaughtException',(err)=>{
    console.log('Неотловленная ошибка',err)
})

const server = express()
server.use(express.static('public/'))
setApi(server)
server.use(express.urlencoded({ extended: true }))

server.listen(3000,()=>console.log(`Server was started on: http://localhost:3000`))

// import config from './config.js';
// import { Bot } from 'grammy';

// const bot = new Bot(config.TELEGRAM_BOT_TOKEN);

// bot.on("message", (ctx) => ctx.reply(ctx.chat.id));
// bot.command('s', ctx => ctx.reply())
// // bot.api.setChatMenuButton()

// bot.start();