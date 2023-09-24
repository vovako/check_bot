import express from 'express'
import { query } from '../db.js'
import { randomUUID } from 'crypto'


const api=express.Router()


api.post('/addrecord',express.json(),async(req,res)=>{
    if(req.body?.id_group&&(req.body?.absent||req.body?.participants?.length)){
        let key=randomUUID()
        let group=await query("select count(*) as count from OKEI.Participant where id_group=?",[req?.body?.id_group])
        if(req.body?.absent>=group[0].count)res.status(400).json({code:400,message:"❌ Число отсутствующих не может быть больше, чем число студентов в группе",data:null})
        else if(req.body?.absent||req.body?.participants?.length){
            if(req.body.chat){
                let student=await query("select Participant.id_participant from OKEI.Participant where chat=?",[req.body?.chat])
                req.body.id_duty=student[0].id_participant
            }
            await query("insert into Record(id_record,id_duty,id_group,absent)values(?,?,?,?)",[key,req.body?.id_duty,req.body?.id_group,req.body?.absent?req.body?.absent:req.body?.participants?.length])
            for(let i=0;i<req.body?.participants?.length;i++){
                let participant=await query("select Participant.id_group from Participant where id_participant=?",[req.body.participants[i].id_participant])
                if(participant?.length)await query('insert into Omission(id_participant,id_record)values(?,?)',[req.body?.participants[i].id_participant,key])
            }
            res.status(200).json({code:200,message:"Запись отсутствующих в группе осуществлена",data:{id_record:key}})
        }
    }
    else res.status(400).json({code:400,message:"Не был передан список отсутствующих или идентификатор группы",data:null})
})

api.put('/changerecord',express.json(),async(req,res)=>{
    if(req.body?.id_record&&(req.body?.absent||req.body?.participants?.length)){
        let record=await query('select case when now()<=adddate(date_rec,interval 5 minute) then 2 when now()>=adddate(date_rec,interval 5 minute) then 1 else 0 end as record,Record.ID_group from Record where id_record=?',[req.body?.id_record])
        if(record?.length&&record[0].record!=2)res.status(500).json({code:500,message:record[0].record==1?"Запись изменить нельзя, прошло больше пяти минут":"Запись не была найдена",data:null}) 
        else {
            if(req.body?.participants?.length){
                let omissions=await query('select id_participant,id_omission from Omission where id_record=?',[req.body.id_record])
                let exists=omissions?.length?omissions?.map(el=>el.id_participant):[]
                let partsId=req.body.participants.map(el=>el.id_participant)
                for(let i=0;i<partsId.length;i++)if(!exists?.includes(partsId[i]))await query('insert into Omission(id_participant,id_record)values(?,?)',[req.body.participants[i].id_participant,req.body.id_record])
                for(let j=0;j<exists.length;j++)if(!partsId?.includes(exists[j]))await query('delete from Omission where id_omission=?',[omissions[j].id_omission])
            }
            let studentsInGroup=await query("select count(*) as count from OKEI.Participant where id_group=?",[record[0].ID_group])
            if(studentsInGroup.length&&studentsInGroup[0].count<req?.body?.absent)res.status(500).json({code:500,message:"Число отсутствующих не может быть больше, чем число студентов в группе",data:null})
            else if(req?.body?.absent||req?.body?.participants?.length){
                await query("update Record set absent=? where id_record=?",[req?.body?.absent?req.body.absent:req.body?.participants?.length,req.body?.id_record])
                res.status(200).json({code:200,message:"Запись изменена",data:null})
            }
        }
    }
    else res.status(400).json({code:400,message:"Не было передано измененное число отсутствующих или идентификатор группы",data:null})
})

export default api