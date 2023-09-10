import groupAPI from './routes/groupAPI.js'
import recordAPI from './routes/recordAPI.js'

export function setApi(app){
    app.use('/api/groups',groupAPI)
    app.use('/api/record',recordAPI)
}

export function setRoutes(app){
    
}