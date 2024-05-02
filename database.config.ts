import { Pool } from 'pg';

const pool:Pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'web_app_inventory',
  password: 'Josue@y@Jhazmin',
  port: 5432,
});

export default pool;