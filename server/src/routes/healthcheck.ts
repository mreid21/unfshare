import express from "express"

const healthCheckRouter = express.Router()

healthCheckRouter.get("/", (_, res) => {
    res.sendStatus(200)
})

export default healthCheckRouter
