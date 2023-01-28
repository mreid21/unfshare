import express from 'express'
import healthCheckRouter from './routes/healthcheck';
import projectRouter from './routes/projects';

const app = express()

app.use(express.json());

app.use('/healthcheck', healthCheckRouter)
app.use('/projects', projectRouter)



app.listen(8080, () => {
  console.log('listening on port 8080')
})