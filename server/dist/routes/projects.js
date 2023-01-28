"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const projectRouter = express_1.default.Router();
const Project = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string().min(3).max(25),
    repoLink: zod_1.z.optional(zod_1.z.string().url()),
    liveSiteLink: zod_1.z.optional(zod_1.z.string().url())
});
const NewProject = Project.omit({ id: true });
const ProjectUpdate = Project.pick({ repoLink: true, liveSiteLink: true });
projectRouter.get('/', (req, res) => {
    res.sendStatus(200);
});
projectRouter.post('/', async (req, res) => {
    const result = await NewProject.safeParseAsync(req.body);
    if (result.success) {
        return res.status(201).send((req.body));
    }
    res.status(400).send(result.error.flatten());
});
projectRouter.patch('/:id', async (req, res) => {
    const result = await ProjectUpdate.safeParseAsync(req.body);
    if (result.success) {
        return res.sendStatus(204);
    }
    res.status(400).send(result.error.flatten());
});
projectRouter.delete('/:id', async (req, res) => {
    res.sendStatus(203);
});
exports.default = projectRouter;
