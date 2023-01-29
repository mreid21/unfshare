import express from "express"
import healthCheckRouter from "./routes/healthcheck"
import projectRouter from "./routes/projects"
import * as dotenv from "dotenv"
dotenv.config({ path: "../.env" })

const app = express()

app.use(express.json())

app.use("/healthcheck", healthCheckRouter)
app.use("/projects", projectRouter)

app.listen(process.env.PORT || 8080, () => {
    console.log("listening on port 8080")
})
