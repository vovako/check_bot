import express from 'express'
import { query } from '../db.js'
import { randomUUID } from 'crypto'


const api=express.Router()


api.post('/addrecord',express.json(),async(req,res)=>{
    //req.body?.participants?.length
    if(req.body?.id_group){
        let key=randomUUID()
        await query("insert into Record(id_record,id_duty,id_group)values(?,?,?)",[key,req.body?.id_duty,req.body?.id_group])
        //for(let i=0;i<req.body?.participants?.length;i++)await query('insert into Omission(id_participant,id_record)',[req.body?.participants[i].id_participant,key])
        res.status(200).json({code:200,message:"Запись отсутствующих в группе осуществлена",data:{id_record:key}})
    }
    else res.status(400).json({code:400,message:"Не был передан список отсутствующих или идентификатор группы",data:null})
})

api.put('/changerecord/:id',express.json(),async(req,res)=>{
    if(req.body?.id_group){
        //let record=await query('select * from Record where ')
    }
    else res.status(400).json({code:400,message:"Не было передано измененное число отсутствующих или идентификатор группы",data:null})
})

export default api