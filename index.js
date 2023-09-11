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