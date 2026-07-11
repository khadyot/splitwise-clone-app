import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function migrate() {
    try {
        const migrationPath = path.join(process.cwd(), 'supabase/migrations/0001_init.sql');
        const sqlContent = fs.readFileSync(migrationPath, 'utf8');
        
        console.log("Applying schema...");
        const res = await sql.query(sqlContent);
        console.log("Migration successful!", res);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

migrate();
