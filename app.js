const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs/promises');

// Load environment variables from a .env file (if running locally)
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware for static files
app.use(express.static(path.join(__dirname, 'public')));

// Database connection pool
console.log('Attempting to connect to database...');
console.log(`DB_HOST: ${process.env.DB_HOST}`);
console.log(`DB_USER: ${process.env.DB_USER}`);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// A simple function to get data from the database
app.get('/api/data', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users');
        console.log('Successfully queried database for users.');
        res.json(rows);
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Main route to serve the homepage with header and footer
app.get('/', async (req, res) => {
    try {
        const headerPath = path.join(__dirname, 'views', 'header.html');
        const footerPath = path.join(__dirname, 'views', 'footer.html');

        const headerContent = await fs.readFile(headerPath, 'utf8');
        const footerContent = await fs.readFile(footerPath, 'utf8');

        // Simple placeholder content for the main body of the page
        const mainContent = `
            <main class="container mx-auto px-6 py-12">
                <div class="text-center">
                    <h1 class="text-5xl font-bold text-gray-900 mb-4">Welcome to Tidyzenic</h1>
                    <p class="text-xl text-gray-600">The all-in-one platform for your service business.</p>
                </div>
            </main>
        `;

        res.send(headerContent + mainContent + footerContent);
        console.log('Homepage successfully served.');

    } catch (error) {
        console.error('Error serving homepage:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
