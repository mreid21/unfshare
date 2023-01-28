"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const pool_1 = __importDefault(require("../db/pool"));
const projectRouter = express_1.default.Router();
const Project = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string().min(3).max(25),
    repoLink: zod_1.z.optional(zod_1.z.string().url()),
    liveSiteLink: zod_1.z.optional(zod_1.z.string().url())
});
const NewProject = Project.omit({ id: true });
const ProjectUpdate = Project.pick({ repoLink: true, liveSiteLink: true });
projectRouter.get('/', async (req, res) => {
    const { rows } = await pool_1.default.query('SELECT * FROM projects');
    res.status(200).send(rows || []);
});
projectRouter.post('/', async (req, res) => {
    const result = await NewProject.safeParseAsync(req.body);
    if (result.success) {
        const db_res = await addProject(result.data);
        return res.status(201).send(db_res);
    }
    res.status(400).send(result.error.flatten());
});
projectRouter.patch('/:id', async (req, res) => {
});
projectRouter.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const deleted = await deleteProject(id);
        if (deleted) {
            return res.sendStatus(204);
        }
        return res.status(404).send({ error: `project with id: ${id} not found` });
    }
    catch (error) {
        res.sendStatus(400);
    }
});
const addProject = async (project) => {
    const { name, repoLink, liveSiteLink } = project;
    const { rows } = await pool_1.default.query('INSERT INTO projects (name, repoLink, liveSiteLink) VALUES ($1, $2, $3)', [name, repoLink, liveSiteLink]);
    return rows;
};
const deleteProject = async (projectId) => {
    const result = await pool_1.default.query('DELETE FROM projects WHERE id = $1', [projectId]);
    if (result.rowCount === 0) {
        return false;
    }
    return true;
};
exports.default = projectRouter;
