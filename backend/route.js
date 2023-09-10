import groupAPI from './routes/groupAPI.js'

export function setApi(app){
    app.use('/api/groups',groupAPI)
}

export function setRoutes(app){
    
}