import express, { application } from 'express'
import { setApi } from './backend/route.js'
import cors from 'cors'
import axios from 'axios'

process.on('uncaughtException', (err) => {
    console.log('Неотловленная ошибка', err)
})

const server = express()
server.use(express.static('public/'))
server.use(cors())
setApi(server)
server.use(express.urlencoded({ extended: true }))

server.listen(3000, () => console.log(`Server was started on: http://localhost:3000`))

import config from './config.js';
import { Markup, Telegraf, Scenes, session } from 'telegraf'

const checkDuty=(ctx,isreturn)=>{
    axios.post(`http://localhost:3000/api/student/${ctx.chat.id}`)
        .then((resp) => {
            if(!isreturn){
                ctx.reply(`Дежурный: ${resp.data?.student?.fullname}`, Markup.inlineKeyboard([[Markup.button.callback("📝 Отметить", "mark")], [Markup.button.callback("🗄 Изменить запись", "change_mark")]]))
                .catch(err => console.log(err))
            }
            else {
                ctx.editMessageText(`Дежурный: ${resp.data?.student?.fullname}`, Markup.inlineKeyboard([[Markup.button.callback("📝 Отметить", "mark")], [Markup.button.callback("🗄 Изменить запись", "change_mark")]]))
                .catch(err => console.log(err))
            }
        })
        .catch(err => getGroups(ctx))
}
const getGroups = (ctx, ischange, ismarking) => {
    axios.post('http://localhost:3000/api/groups/getgroups')
        .then(resp => {
            resp.data.data = resp.data.data.map(el => Markup.button.callback(el.id_group, `group:${el.id_group}`))
            let rows = []
            for (let i = 0; i < resp.data.data.length; i += 4)rows.push(resp.data.data.slice(i, i + 4))
            let message = ismarking ? "Выберите свою группу для регистрации в боте" : "Выберите группу для отметки"
            if (ischange) ctx.editMessageText(message, Markup.inlineKeyboard(rows))
            else ctx.reply(message, Markup.inlineKeyboard(rows))
        })
        .catch(err => {
            ctx.editMessageText("❌ Ошибка при загрузке данных о группах")
                .catch(err => console.log(err))
        })
}
const getGroup = (ctx, ismarking) => {
    axios.post(`http://localhost:3000/api/groups/getgroup/${ctx.callbackQuery.data.split(":")[1]}`)
        .then(resp => {
            let keyboard = resp.data?.data?.participants.map(el => [Markup.button.callback(el.fullname, `student:${el.ID_participant}`)])
            keyboard.push([Markup.button.callback("👈 Назад", "prevstep")])
            if (!ismarking) {
                ctx.editMessageText("Выберите себя из списка", Markup.inlineKeyboard(keyboard))
                    .catch(err => console.log(err))
            }
            else {
                ctx.editMessageText("Напишите боту число отсутствющих в группе ✏️")
                    .then(resp => {
                        ctx.session.message_red = resp.message_id
                        ctx.wizard.next()
                    })
                    .catch(err => console.log("❌ Попробуйте повторить попытку"))
            }
        })
        .catch(err => {
            ctx.editMessageText("❌ Ошибка при загрузке данных о студентах")
                .catch(err => console.log(err))
        })
}
const getBotsToChange=(ctx)=>{
    axios.post('http://localhost:3000/api/groups/getgroups',JSON.stringify({chat:ctx.chat.id}),{headers:{'Content-Type':'application/json'}})
            .then(resp => {
                resp.data.data = resp.data.data.filter(el => el.duty_records?.length)
                resp.data.data=resp.data.data.map(el=>Markup.button.callback(el.id_group, `group:${el.id_group}`))
                let rows = []
                if (resp.data?.data?.length){
                    for (let i = 0; i < resp.data.data.length; i += 4)rows.push(resp.data.data.slice(i, i + 4))
                    ctx.editMessageText("Выберите группу, запись которой хотите изменить", Markup.inlineKeyboard(rows))
                    .then(resp=>{
                        ctx.session.edit_mes=resp.message_id
                    })
                    .catch(err=>{
                        ctx.editMessageText("❌ Ошибка, повторите запрос",Markup.inlineKeyboard([Markup.button.callback("🕰 Вернуться","returnhome")]))
                        .catch(err=>console.log(err))
                    })
                }
                else {
                    ctx.editMessageText("❌ За последние пять минут вами не было произведено записей",Markup.inlineKeyboard([Markup.button.callback("🕰 Вернуться","returnhome")]))
                    .catch(err=>console.log(err))
                }
            })
            .catch(err => {
                ctx.editMessageText("❌ Ошибка при загрузке данных о группах")
                    .catch(err => console.log(err))
            })
}
const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);

let markScene = new Scenes.WizardScene(
    "mark",
    (ctx) => getGroups(ctx, true),
    (ctx) => {
        if (!isNaN(+ctx?.message?.text)) {
            let data = {
                id_group: ctx.session.marked_group,
                absent: +ctx?.message?.text,
                chat: ctx.chat.id
            }
            axios.post("http://localhost:3000/api/record/addrecord", JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
                .then(resp => {
                    bot.telegram.editMessageText(ctx.chat.id, ctx.session.message_red, undefined, "📝 Запись осуществлена")
                        .then(()=>ctx.scene.leave())
                        .catch(err => console.log(err))
                })
                .catch(err => {
                    bot.telegram.editMessageText(ctx.chat.id, ctx.session.message_red, undefined, err?.response?.data?.message ? err.response.data.message : "❌ Повторите запрос")
                    .then(()=>ctx.scene.leave())    
                    .catch(err => console.log(err))
                })
        }
        else {
            bot.telegram.editMessageText(ctx.chat.id, ctx.session.message_red, undefined, "❌ Формат ответа не верен, повторите попытку")
            ctx.scene.leave()
        }
    }
)
let changeScene = new Scenes.WizardScene(
    "change_mark",
    (ctx) => getBotsToChange(ctx),
    (ctx)=>{
        if(!isNaN(+ctx?.message?.text)){
            let data={
                id_record:ctx.session.id_record,
                absent:ctx.message.text
            }
            axios.put("http://localhost:3000/api/record/changerecord",JSON.stringify(data),{headers:{'Content-Type':'application/json'}})
            .then(resp=>{
                ctx.telegram.editMessageText(ctx.chat.id,ctx.session.edit_mes,undefined,"✅ Запись изменена")
                .catch(err=>console.log(err))
                ctx.scene.leave()
            })
            .catch(err=>{
                ctx.telegram.editMessageText(ctx.chat.id,ctx.session.edit_mes,undefined,"❌"+err?.response?.data?.message)
                .catch(err=>console.log(err))
                ctx.scene.leave()
            })
        }
        else {
            bot.telegram.editMessageText(ctx.chat.id, ctx.session.message_red, undefined, "❌ Формат ответа не верен, повторите попытку")
            ctx.scene.leave()
        }
    }
)
let scenes = new Scenes.Stage([markScene, changeScene])
bot.use(session())
bot.use(scenes.middleware())

changeScene.action("returnhome",ctx=>{
    ctx.scene.leave()
    checkDuty(ctx,true)
})
changeScene.action(/^group:([1-4])[А-Яа-я]+([1-4])$/,ctx=>{
    axios.post(`http://localhost:3000/api/groups/getgroup/${ctx.callbackQuery.data.split(":")[1]}`,JSON.stringify({chat:ctx.chat.id}),{headers:{'Content-Type':'application/json'}})
        .then(resp => {
            let keyboard = resp.data?.data?.duty_records.map(el => [Markup.button.callback("🕰 "+(new Date(el.date_rec)).toLocaleString(), `rec:${el.ID_record}`)])
            keyboard.push([Markup.button.callback("👈 Назад", "returnhome")])
            ctx.editMessageText("📋 Выберите запись",Markup.inlineKeyboard(keyboard))
                .then(resp => ctx.session.message_red = resp.message_id)
                .catch(err => console.log("❌ Попробуйте повторить попытку"))
        })
        .catch(err => {
            ctx.editMessageText("❌ Ошибка при загрузке данных о студентах")
                .catch(err => console.log(err))
        })
})
// let data={
//     id_record:ctx.callbackQuery.data.split(":")[1],
//     absent:ctx.message?.text
// }
// axios.put("http://localhost:3000/api/record/changerecord",JSON.stringify(data),{headers:{'Content-Type':'application/json'}})
// .then(resp=>{
//     console.log(resp.data)
// })
// .catch(err=>{
//     console.log(err.response.data)
// })
changeScene.action(/^rec:[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/,ctx=>{
    ctx.editMessageText(`Введите измененное число отсутствующих ✏️`,Markup.inlineKeyboard([Markup.button.callback("👈 Домой","returnhome")]))
    .then(resp=>{
        ctx.session.id_record=ctx.callbackQuery.data.split(":")[1]
        ctx.wizard.next()
    })
    .catch(err=>console.log(err))
})
markScene.action(/^group:([1-4])[А-Яа-я]+([1-4])$/, ctx => {
    ctx.session.marked_group = ctx.callbackQuery.data.split(":")[1]
    getGroup(ctx, true)
})
bot.action(/^group:([1-4])[А-Яа-я]+([1-4])$/, ctx => getGroup(ctx))
bot.action("prevstep", ctx => getGroups(ctx, true))

bot.action(/^student:[0-9]+$/, ctx => {
    let data = {
        student: ctx.callbackQuery.data.split(":")[1],
        chat: ctx.chat.id
    }
    axios.put('http://localhost:3000/api/student/regstudent', JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
        .then(resp => {
            ctx.editMessageText("✅ Регистрация прошла успешно", Markup.inlineKeyboard([Markup.button.callback("Отметить", "mark")]))
                .catch(err => console.log(err))
        })
        .catch(err => {
            ctx.editMessageText("❌ Регистрация не удалась", Markup.inlineKeyboard([Markup.button.callback("Отметить", "mark")]))
                .catch(err => console.log(err))
        })
})

bot.action("mark", ctx => ctx.scene.enter("mark"))
bot.action("change_mark", ctx => ctx.scene.enter("change_mark"))

bot.start((ctx) => checkDuty(ctx))

//!Сделать для пофамильного отмечания
// let duties = []
// bot.action(/^duty:[0-9]+$/, async ctx => {
//     let data = ctx.callbackQuery.data.split(":")[1]
//     let keyboard = ctx.callbackQuery.message.reply_markup.inline_keyboard
//     let row = keyboard[keyboard.findIndex(el => el.find(e => e.callback_data == ctx.callbackQuery.data))]
//     let duty = row.findIndex(el => el.callback_data == ctx.callbackQuery.data)
//     if (duties.includes(data)) {
//         duties = duties.filter(el => el != data)
//         row[duty].text = row[duty].text.slice(0, row[duty].text.length - 2)
//     }
//     else {
//         duties.push(data)
//         row[duty].text = row[duty].text += ' ✅'
//     }
//     keyboard = keyboard.map(el => [Markup.button.callback(el[0].text, el[0].callback_data)])
//     ctx.editMessageText(ctx.callbackQuery.message.text, Markup.inlineKeyboard(keyboard))
// })

bot.launch()
    .then(resp => console.log(resp))
    .catch(err => console.log(err))