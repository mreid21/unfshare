"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const healthcheck_1 = __importDefault(require("./routes/healthcheck"));
const projects_1 = __importDefault(require("./routes/projects"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/healthcheck', healthcheck_1.default);
app.use('/projects', projects_1.default);
app.listen(8080, () => {
    console.log('listening on port 8080');
});
