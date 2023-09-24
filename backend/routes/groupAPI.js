import express from 'express'
import { query } from '../db.js'

const api=express.Router()

api.post('/getgroups',express.json(),async(req,res)=>{
    let groups=await query("select Class.id_group,Class.participants,teacher.fullname as teacher from Class left join teacher on Class.id_teacher=teacher.id_teacher")
    for(let i=0;i<groups?.length;i++){
        //groups[i].participants=(await query("select count(*) as participants from Participant where id_group=?",[groups[i].ID_group]))[0].participants
        groups[i].ismarked=(await query("select if(exists(select id_record from Record where date(date_rec)=curdate() and id_group=?),1,0) as marked",[groups[i].id_group]))[0].marked
        groups[i].ismarked=groups[i].ismarked==1?true:false
        if(req?.body?.chat){
            let duty=await query("select * from OKEI.Participant where chat=?",[req.body.chat])
            if(duty.length)groups[i].duty_records=await query("select * from OKEI.Record where now()<=adddate(date_rec,interval 5 minute) and ID_duty=? and ID_group=?",[duty[0].ID_participant,groups[i].id_group])
        }
        if(req?.body?.date)groups[i].records=(await query("select time(Record.date_rec) as time,case when (select count(distinct id_participant) from Omission where Omission.id_record=Record.id_record)>0 then (select count(distinct id_participant) from Omission where Omission.id_record=Record.id_record) else Record.absent end as absent from Record where Record.id_group=? and date(date_rec)=date(?) order by date_rec",[groups[i].id_group,req?.body?.date]))
    }

    if(groups?.length)res.status(200).json({code:200,message:"Информация о группах получена",data:groups})
    else res.status(404).json({code:404,message:"Групп не зарегестрировано",data:null})
})

api.post('/getgroup/:id',express.json(),async(req,res)=>{
    let group=await query("select Class.id_group,teacher.fullname from Class left join teacher on Class.id_teacher=teacher.id_teacher where id_group=?",[req.params.id])
    if(group?.length){
        group[0].participants=await query("select * from Participant where id_group=?",[req.params.id])
        if(req?.body?.chat){
            let duty=await query("select * from OKEI.Participant where chat=?",[req.body.chat])
            if(duty.length)group[0].duty_records=await query("select * from OKEI.Record where now()<=adddate(date_rec,interval 5 minute) and ID_duty=? and ID_group=?",[duty[0].ID_participant,group[0].id_group])
        }
        res.status(200).json({code:200,message:"Информация о группе получена",data:group[0]})
    }
    else res.status(404).json({code:404,message:"Не было найдено группы",data:null})
})


export default api