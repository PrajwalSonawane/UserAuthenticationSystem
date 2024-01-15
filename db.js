const { Pool } = require('pg');

const pool = new Pool({
    connectionString: "postgres://default:BDi2oIs5prUW@ep-green-frog-90826241-pooler.ap-southeast-1.postgres.vercel-storage.com:5432/verceldb" + "?sslmode=require",
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};