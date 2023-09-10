import mysql from 'mysql2'
import dotenv from 'dotenv'

dotenv.config()

const pool=mysql.createPool({
    host:process.env.HOST,
    user:process.env.USER,
    database:process.env.DATABASE,
    password:process.env.PASSDB,
    port:process.env.PORT
})

const awaitPromise=pool.promise()

pool.once('error',(err)=>console.log("Error with connetion to database "+err))

export async function query(req,params){
    const [rows]=await awaitPromise.query(req,params)
    return rows
}