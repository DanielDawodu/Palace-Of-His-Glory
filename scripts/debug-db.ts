import pg from 'pg';

const { Pool } = pg;

// Using the credentials provided by the user
const connectionString = "postgresql://postgres.gnjahejmaclmhkqfzwoq:Danieldawodu%40123@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
    connectionString,
});

async function testConnection() {
    try {
        console.log("Emptying pool...");
        console.log("Testing connection...");
        const client = await pool.connect();
        console.log("✅ Connection successful!");

        const res = await client.query('SELECT NOW() as now');
        console.log("✅ Query successful:", res.rows[0]);

        // Check if tables exist
        const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log("📊 Tables found:", tables.rows.map(r => r.table_name));

        client.release();
    } catch (err) {
        console.error("❌ Connection failed:", err);
    } finally {
        await pool.end();
    }
}

testConnection();
