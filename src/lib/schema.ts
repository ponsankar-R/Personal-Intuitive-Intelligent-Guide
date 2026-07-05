import { query } from './db';

export async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        profile_name VARCHAR(255) DEFAULT 'Subject Identity Analysis',
        identity_sentences TEXT[] DEFAULT '{}'
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS user_problems (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        problem_text TEXT NOT NULL,
        recommendation TEXT DEFAULT NULL,
        frequency INT DEFAULT 1,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
