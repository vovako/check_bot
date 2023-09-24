import groupAPI from './routes/groupAPI.js'
import recordAPI from './routes/recordAPI.js'
import studentAPI from './routes/studentAPI.js'

export function setApi(app){
    app.use('/api/groups',groupAPI)
    app.use('/api/record',recordAPI)
    app.use('/api/student',studentAPI)
}