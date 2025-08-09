const mysql = require('mysql2/promise');

// Load environment variables from a .env file (if running locally)
// require('dotenv').config();

// Function to test the database connection and log details
async function logDatabaseDetails() {
    console.log('--- Database Connection Details ---');
    console.log(`DB_HOST: ${process.env.DB_HOST}`);
    console.log(`DB_USER: ${process.env.DB_USER}`);
    console.log(`DB_NAME: ${process.env.DB_NAME}`);
    console.log('-----------------------------------');

    try {
        // Attempt to connect to the database using the environment variables
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 1, // Use a small limit for a one-time check
            queueLimit: 0
        });

        // Get a connection from the pool and release it immediately
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        console.log('✅ Database connection successful! Test query result:', rows);
        
        await pool.end(); // Close the pool after the check

    } catch (error) {
        // Log the full error to help with debugging
        console.error('❌ Critical Database Connection Error:');
        console.error('----------------------------------------');
        console.error(error.message);
        console.error('Full stack trace:');
        console.error(error);
        console.error('----------------------------------------');
    }
}

// Call the function when this file is run
logDatabaseDetails();
