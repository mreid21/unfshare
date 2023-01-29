import express from "express"
import invariant from "tiny-invariant"
import { AnyZodObject, z, ZodError } from "zod"
import { DatabaseError as PgDatabaseError } from "pg"
import pool from "../db/pool"

const projectRouter = express.Router()

class DbError extends Error {
    inner: PgDatabaseError
    responseStatusCode?: number

    constructor(message: string | undefined, inner: PgDatabaseError, responseStatusCode?: number) {
        super(message)
        this.name = "DbError"
        this.inner = inner
        this.responseStatusCode = responseStatusCode
    }
}

const Project = z.object({
    id: z.number(),
    name: z.string().min(3).max(25),
    repoLink: z.optional(z.string().url()),
    liveSiteLink: z.optional(z.string().url()),
})

const NewProject = Project.omit({ id: true })
const ProjectUpdate = Project.pick({
    liveSiteLink: true,
    repoLink: true,
}).refine((data) => data.liveSiteLink || data.repoLink, "Either the live site link or repo link must be updated")

type Project = z.infer<typeof Project>
type NewProject = z.infer<typeof NewProject>

projectRouter.get("/", async (req, res) => {
    const projects = await getAllProjects()
    res.status(200).send(projects)
})

projectRouter.post("/", async (req, res) => {
    const result = await NewProject.safeParseAsync(req.body)

    if (!result.success) {
        return res.status(400).send(result.error)
    }

    invariant(result.success, "This shouldn't happen")

    try {
        const newProject = await addProject(result.data)
        res.status(201).send(newProject[0])
    } catch (error) {
        //can map error code to something more semantic
        if (error instanceof DbError && error.responseStatusCode) {
            return res.status(error.responseStatusCode).send({ error: error.message })
        }

        res.status(500).send({ error: "Something went wrong" })
    }
})

projectRouter.get("/:id", async (req, res) => {
    const id = parseInt(req.params.id)

    try {
        const project = await getProjectById(id)

        if (project) return res.status(200).send(project)

        return res.status(404).send({ error: `Project with id: ${id} not found` })
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).send({ error: error.message })
        }
    }
})

projectRouter.patch("/:id", async (req, res) => {
    const id = parseInt(req.params.id)
    const update = await ProjectUpdate.safeParseAsync(req.body)

    if (!update.success) {
        return res.status(400).send({ error: update.error.flatten().formErrors })
    }

    invariant(update.success, "This should not happen")

    try {
        const { repoLink, liveSiteLink } = update.data
        const updated = await pool.query(
            "UPDATE projects SET liveSiteLink = COALESCE($1, liveSiteLink), repoLink = COALESCE($2, repoLink) WHERE id = $3 RETURNING *",
            [liveSiteLink, repoLink, id]
        )
        return res.sendStatus(204)
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
        }
        return res.sendStatus(500)
    }
})

projectRouter.delete("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const deleted = await deleteProject(id)

        if (deleted) {
            return res.sendStatus(204)
        }

        return res.status(404).send({ error: `project with id: ${id} not found` })
    } catch (error) {
        res.sendStatus(400)
    }
})

const getAllProjects = async (): Promise<Project[]> => {
    try {
        const { rows } = await pool.query("SELECT * FROM projects")
        return rows
    } catch (error) {
        throw new Error("Unexpected Error")
    }
}

const getProjectById = async (projectId: number): Promise<Project | null> => {
    try {
        const { rows } = await pool.query("SELECT * FROM projects WHERE id = $1", [projectId])
        if (rows.length > 0) {
            return rows[0]
        }

        return null
    } catch (error) {
        if (error instanceof PgDatabaseError) {
            throw new DbError("Internal server error", error)
        }
    }

    throw new Error(`Project with id: ${projectId} not found`)
}

const addProject = async (project: NewProject): Promise<Project[]> => {
    const { name, repoLink, liveSiteLink } = project

    try {
        const { rows } = await pool.query<Project>(
            "INSERT INTO projects (name, repoLink, liveSiteLink) VALUES ($1, $2, $3) returning *",
            [name, repoLink, liveSiteLink]
        )
        return rows
    } catch (error) {
        if (error instanceof PgDatabaseError && error.code === "23505") {
            throw new DbError(`Project with name: ${name} already exists`, error, 409)
        }
    }

    throw new Error("Unexpected error")
}

const deleteProject = async (projectId: number) => {
    const result = await pool.query("DELETE FROM projects WHERE id = $1", [projectId])

    if (result.rowCount === 0) {
        return false
    }

    return true
}

export default projectRouter
