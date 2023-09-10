import express from 'express'
import dotenv from 'dotenv'
import { setRoutes,setApi } from './backend/route.js'

process.on('uncaughtException',(err)=>{
    console.log('Неотловленная ошибка',err)
})

dotenv.config()
const server = express()
server.use(express.static('public/'))
setApi(server)
server.use(express.urlencoded({ extended: true }))

server.listen(process.env.SERVER_PORT,()=>console.log(`Server was started on: http://localhost:${process.env.SERVER_PORT}`))