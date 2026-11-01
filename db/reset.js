import { readdir, readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';

const name = process.env.DB_NAME || 'clb';
const conn = await mysql.createConnection({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || process.env.DB_PASS,
  multipleStatements: true,
});

await conn.query(`DROP DATABASE IF EXISTS \`${name}\``);
await conn.query(`CREATE DATABASE \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
await conn.query(`USE \`${name}\``);

const files = (await readdir('db')).filter((f) => f.endsWith('.sql')).sort();
for (const f of files) {
  const content = await readFile(`db/${f}`, 'utf8');
  await conn.query(content);
  console.log('OK', f);
}
await conn.end();

