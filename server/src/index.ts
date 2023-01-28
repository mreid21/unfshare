import express from 'express'

const app = express()

app.use(express.json());

app.get("/healthcheck", (_, res) => {
  res.sendStatus(200)
})

app.listen(8080, () => {
  console.log('listening on port 8080')
})