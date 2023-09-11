import express from 'express'
import { query } from '../db.js'
import { randomUUID } from 'crypto'


const api=express.Router()


api.post('/getstats',async(req,res)=>{
    if(req?.body?.date){
        let date=new Date(req?.body?.date)
        if(date){
            let groups=await query("select * from Omission")
            for(let i=0;i<groups?.length;i++){
                groups[i].participants=(await query("select count(*) as participants from Participant where id_group=?",[groups[i].ID_group]))[0].participants
                groups[i].omissions=(await query("select count(distinct Omission.id_participant) as omissions from Omission left join Participant on Omission.id_participant=Participant.id_participant where Participant.id_group=? and day(date_omission)=day(now())",[groups[i].ID_group]))[0].omissions
            }
        }
        res.status(500).json({code:500,message:"Был передан неверный формат даты",data:[]})
    }
    else res.status(400).json({code:400,message:"Не был передан список отсутствующих",data:[]})
})

api.post('/addrecord',express.json(),async(req,res)=>{
    if(req.body?.participants?.length&&req.body?.id_group){
        let key=randomUUID()
        await query("insert into Record(id_record,id_duty,id_group)values(?,?)",[key,req.body?.id_duty,req.body?.id_group])
        for(let i=0;i<req.body?.participants?.length;i++)await query('insert into Omission(id_participant,id_record)',[req.body?.participants[i].id_participant,key])
        res.status(200).json({code:200,message:"Запись отсутствующих в группе осуществлена",data:{id_record:key}})
    }
    else res.status(400).json({code:400,message:"Не был передан список отсутствующих или идентификатор группы",data:[]})
})

export default api