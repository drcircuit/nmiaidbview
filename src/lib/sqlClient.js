const sql = require('mssql');

let poolPromise;

function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return String(value).toLowerCase() === 'true';
}

function requireSetting(name, fallback) {
  const value = process.env[name] ?? fallback;

  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing required app setting: ${name}`);
  }

  return value;
}

function quoteIdentifier(name) {
  if (!/^[A-Za-z0-9_]+$/.test(name)) {
    throw new Error(`Invalid SQL identifier: ${name}`);
  }

  return `[${name}]`;
}

function getPool() {
  if (!poolPromise) {
    const connectionString = process.env.DB_CONNECTION_STRING;

    if (connectionString) {
      poolPromise = sql.connect(connectionString);
    } else {
      poolPromise = sql.connect({
        server: requireSetting('DB_SERVER'),
        port: Number(requireSetting('DB_PORT', '1433')),
        database: requireSetting('DB_NAME'),
        user: requireSetting('DB_USER'),
        password: requireSetting('DB_PASSWORD'),
        options: {
          encrypt: parseBoolean(process.env.DB_ENCRYPT, true),
          trustServerCertificate: parseBoolean(process.env.DB_TRUST_SERVER_CERTIFICATE, false)
        },
        pool: {
          max: 5,
          min: 0,
          idleTimeoutMillis: 30000
        }
      });
    }
  }

  return poolPromise;
}

async function getTasks(limit = 100) {
  const normalizedLimit = Number.isInteger(limit) ? limit : 100;
  const safeLimit = Math.max(1, Math.min(normalizedLimit, 500));
  const schemaName = quoteIdentifier(requireSetting('DB_SCHEMA', 'dbo'));
  const tableName = quoteIdentifier(requireSetting('DB_TABLE', 'tasks'));
  const pool = await getPool();
  const query = `SELECT TOP (${safeLimit}) * FROM ${schemaName}.${tableName};`;
  const result = await pool.request().query(query);

  return result.recordset;
}

async function getTaskStats() {
  const schemaName = quoteIdentifier(requireSetting('DB_SCHEMA', 'dbo'));
  const tableName = quoteIdentifier(requireSetting('DB_TABLE', 'tasks'));
  const pool = await getPool();
  const query = `SELECT COUNT_BIG(1) AS totalRows FROM ${schemaName}.${tableName};`;
  const result = await pool.request().query(query);
  const totalRows = result.recordset?.[0]?.totalRows ?? 0;

  return {
    totalRows: Number(totalRows) || 0
  };
}

module.exports = {
  getTasks,
  getTaskStats
};
