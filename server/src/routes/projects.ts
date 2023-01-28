import express from 'express'
import { z, ZodError } from 'zod'

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


projectRouter.get('/', (req, res) => {
  res.sendStatus(200)
})


projectRouter.post('/', async (req, res) => {

  const result = await NewProject.safeParseAsync(req.body)

  if (result.success) {
    return res.status(201).send((req.body))
  }

  res.status(400).send(result.error.flatten())

})

projectRouter.patch('/:id', async (req, res) => {
  const result = await ProjectUpdate.safeParseAsync(req.body)

  if (result.success) {
    return res.sendStatus(204)
  }

  res.status(400).send(result.error.flatten())
})


projectRouter.delete('/:id', async (req, res) => {
  res.sendStatus(203)
})


export default projectRouter