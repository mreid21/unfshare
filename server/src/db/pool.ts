import {Pool} from 'pg'


const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: 'postgres',
  database: process.env.DB_NAME || 'postgres',
  max: 10,
  password: process.env.DB_PASSWORD || 'postgres',
  port: 5432,
})


export default pool