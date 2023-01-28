import express from 'express'
import { z, ZodError } from 'zod'
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

  if (result.success) {
    const db_res = await addProject(result.data)
    return res.status(201).send(db_res)
  }
  res.status(400).send(result.error.flatten())

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


const addProject = async (project: NewProject) => {
  const {name, repoLink, liveSiteLink} = project
  const {rows} = await pool.query('INSERT INTO projects (name, repoLink, liveSiteLink) VALUES ($1, $2, $3)', [name, repoLink, liveSiteLink])

  return rows
}

const deleteProject = async (projectId: number) => {
  const result = await pool.query('DELETE FROM projects WHERE id = $1', [projectId])

  if (result.rowCount === 0) {
    return false
  }
  
  return true
}

export default projectRouter