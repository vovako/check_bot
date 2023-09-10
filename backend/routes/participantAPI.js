import express from 'express'
import { query } from '../db.js'

const api=express.Router()

api.get('/',async(req,res)=>{
    let participant=await query("select * from `Participant` where `ID_participant`=?",[req.params.id])
    if(participant?.length)res.status(200).json({code:200,message:"Информация о студенте получена",data:participant[0]})
    else res.status(404).json({code:404,message:"Студент не был найден",data:[]})
})

export default api