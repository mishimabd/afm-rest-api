const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Load environment variables
require('dotenv').config();

// Create a pool instance
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:admin@localhost:5432/afm_db',
    ssl: !!process.env.DATABASE_URL
});
async function executeSqlFile(filePath) {
    try {
        const fullPath = path.join(__dirname, filePath);
        const sql = fs.readFileSync(fullPath, 'utf8');
        await pool.query(sql);
        console.log(`${filePath} executed successfully`);
    } catch (error) {
        console.error(`Error executing ${filePath}:`, error.message);
        if (error.detail) {
            console.error('Detail:', error.detail); // Print additional detail if available
        }
        throw error;
    }
}

async function setup() {
    try {
        // Execute scripts in the required order
        await executeSqlFile('db/create_db.sql');
        await executeSqlFile('db/create_extension.sql');
        await executeSqlFile('db/create_tables.sql');

        console.log('Database setup completed successfully!');
        process.exit(0); // Exit script after successful setup
    } catch (error) {
        console.error('Setup failed:', error.message);
        process.exit(1); // Exit with error code
    }
}

setup();
