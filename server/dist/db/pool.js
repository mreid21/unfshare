"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    host: process.env.DB_HOST || 'localhost',
    user: 'postgres',
    database: process.env.DB_NAME || 'postgres',
    max: 10,
    password: process.env.DB_PASSWORD || 'postgres',
    port: 5432,
});
exports.default = pool;
