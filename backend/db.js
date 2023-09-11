import mysql from 'mysql2'
import config from '../config.js'

const pool=mysql.createPool({
    host:config.HOST,
    user:config.USER,
    database:config.DATABASE,
    password:config.PASSDB,
    port:config.PORT
})

const awaitPromise=pool.promise()

pool.once('error',(err)=>console.log("Error with connetion to database "+err))

export async function query(req,params){
    const [rows]=await awaitPromise.query(req,params)
    return rows
}