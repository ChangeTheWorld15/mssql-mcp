import express from "express";
import sql from "mssql";

const app = express();
app.use(express.json());

const pool = await sql.connect({
  server: process.env.MSSQL_HOST,
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  database: process.env.MSSQL_DATABASE,
  options: { trustServerCertificate: true }
});

app.get("/health", (_, res) => res.send("ok"));

app.post("/query", async (req, res) => {
  const { sql: query } = req.body;
  const result = await pool.request().query(query);
  res.json(result.recordset);
});

app.listen(3001);
