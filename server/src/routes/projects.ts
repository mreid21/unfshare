import express from 'express'
import invariant from 'tiny-invariant'
import { AnyZodObject, z, ZodError } from 'zod'
import {DatabaseError as PgDatabaseError } from 'pg'
import pool from '../db/pool'

const projectRouter = express.Router()


const Project = z.object({
  id: z.number(),
  name: z.string().min(3).max(25),
  repoLink: z.optional(z.string().url()),
  liveSiteLink: z.optional(z.string().url())
})

const NewProject = Project.omit({id: true})
const ProjectUpdate = Project.pick({repoLink: true, liveSiteLink: true})

type Project = z.infer<typeof Project>
type NewProject = z.infer<typeof NewProject>


projectRouter.get('/', async (req, res) => {
  const {rows} = await pool.query('SELECT * FROM projects')
  res.status(200).send(rows || [])
})


projectRouter.post('/', async (req, res) => {

  const result = await NewProject.safeParseAsync(req.body)

  if (!result.success) {
    return res.status(400).send(result.error)
  }

  invariant(result.success, "This shouldn't happen")

  try {
    const newProject = await addProject(result.data)
    res.status(201).send(newProject[0])
  }
  catch (error) {
    res.status(500).send({error})
  }


})

projectRouter.patch('/:id', async (req, res) => {

})

projectRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const deleted = await deleteProject(id)
    
    if (deleted) {
      return res.sendStatus(204)
    }

    return res.status(404).send({error: `project with id: ${id} not found`})
  }
  catch (error) {
     res.sendStatus(400)
  }
})


const addProject = async (project: NewProject): Promise<Project[]> => {
  const {name, repoLink, liveSiteLink} = project

  try {
    const {rows} = await pool.query<Project>('INSERT INTO projects (name, repoLink, liveSiteLink) VALUES ($1, $2, $3) returning *', [name, repoLink, liveSiteLink])
    return rows
  }
  catch (error) {
    if (error instanceof PgDatabaseError && error.code === '23505') {
      throw new Error(`Project with name: ${name} already exists`)
    }
  }

  throw new Error("Unexpected error")
}

const deleteProject = async (projectId: number) => {
  const result = await pool.query('DELETE FROM projects WHERE id = $1', [projectId])

  if (result.rowCount === 0) {
    return false
  }
  
  return true
}

export default projectRouter
