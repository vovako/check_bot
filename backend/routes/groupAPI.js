import express from 'express'
import { query } from '../db.js'

const api=express.Router()

api.get('/',async(req,res)=>{
    let groups=await query("select * from Class")
    for(let i=0;i<groups?.length;i++){
        groups[i].participants=(await query("select count(*) as participants from Participant where id_group=?",[groups[i].ID_group]))[0].participants
        groups[i].omissions=(await query("select count(distinct Omission.id_participant) as omissions from Omission left join Participant on Omission.id_participant=Participant.id_participant where Participant.id_group=?",[groups[i].ID_group]))[0].omissions
    }

    if(groups?.length)res.status(200).json({code:200,message:"Информация о группах получена",data:groups})
    else res.status(404).json({code:404,message:"Групп не зарегестрировано",data:[]})
})

api.get('/:id',async(req,res)=>{
    let group=await query("select * from Class where id_group=?",[req.params.id])

    if(group?.length){
        group[0].participants=await query("select * from Participant where id_group=?",[group[0].ID_group])
        group[0].omissions=await query("select distinct Omission.id_participant,Participant.* from Omission left join Participant on Omission.id_participant=Participant.id_participant where Participant.id_group=?",[group[0].ID_group])
        res.status(200).json({code:200,message:"Информация о группах получена",data:group})
    }
    else res.status(404).json({code:404,message:"Групп не зарегестрировано",data:[]})
})


export default api