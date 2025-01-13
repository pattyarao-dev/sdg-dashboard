import { Pool } from "pg";

// const pool = new Pool({
//     host: "localhost",
//     port: 5432,
//     user: "postgres",
//     password: "DLSU1234!",
//     database: "TestDB"
// });

const pool = new Pool({
    user:  'postgres',
    host:  'localhost',
    database:  'TestDB',
    password:  'DLSU1234!',
    port:  5432, // Default PostgreSQL port
  });

  pool.connect()
  .then(() => console.log('PostgreSQL connected successfully.'))
  .catch((err) => console.error('Error connecting to PostgreSQL:', err.stack));
  
export default pool;