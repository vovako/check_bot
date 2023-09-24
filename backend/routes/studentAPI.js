import express from 'express'
import { query } from '../db.js'

const api=express.Router()

api.post('/:chat_student',express.json(),async(req,res)=>{
    let student=await query("select * from OKEI.Participant where chat=?",[req.params.chat_student])
    if(student?.length)res.status(200).json({student:student[0]})
    else res.status(400).json({student:null})
})

api.put('/regstudent',express.json(),async(req,res)=>{
    if(req.body.student,req.body.chat){
        await query("update OKEI.Participant set chat=? where id_participant=?",[req.body.chat,req.body.student])
        res.status(200).json("Студент авторизован")
    }
    else res.status(400).json("Не все обязательные параметры были переданы")
})


export default api