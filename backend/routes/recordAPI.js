import express from 'express'
import { query } from '../db.js'
import { randomUUID } from 'crypto'


const api=express.Router()

api.post('/',async(req,res)=>{
    if(req.body?.participants?.length){
        let key=randomUUID()
        await query("insert into Record(id_record,id_duty,id_group)values(?,?)",[key,req.body?.id_duty,req.body.id_group])
        for(let i=0;i<req.body?.participants?.length;i++){
            await query('insert into Omission(id_participant,date_omission)')
        }
    }
    else res.status(400).json({code:400,message:"Не был передан список отсутствующих",data:[]})
})

export default api