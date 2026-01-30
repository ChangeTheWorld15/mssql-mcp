import express from "express";
import sql from "mssql";

const app = express();
app.use(express.json());

// ---- SQL CONNECTION ----
const pool = await sql.connect({
  server: process.env.MSSQL_HOST,
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,

  // HARD PIN DATABASE
  database: "fuseqa",

  options: {
    encrypt: true,
    trustServerCertificate: true
  }
});

// Force DB context (extra safety)
await pool.request().query("USE fuseqa");

// Log connected DB (debug)
const dbCheck = await pool.request().query("SELECT DB_NAME() AS db");
console.log("Connected DB:", dbCheck.recordset[0].db);

// ---- HEALTH CHECK ----
app.get("/health", (_, res) => {
  res.send("ok");
});

// ---- DEBUG: CURRENT DATABASE ----
app.get("/db", async (_, res) => {
  try {
    const result = await pool.request().query(
      "SELECT DB_NAME() AS db"
    );
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- LIST TABLES (SAFE MCP CAPABILITY) ----
app.get("/tables", async (_, res) => {
  try {
    const result = await pool.request().query(`
      SELECT TABLE_SCHEMA, TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      ORDER BY TABLE_SCHEMA, TABLE_NAME
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---- START SERVER ----
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`MSSQL MCP server running on port ${PORT}`);
});
