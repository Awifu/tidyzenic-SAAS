const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs/promises');

// Set the port for the server
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
// This is crucial for serving the Tailwind CSS file (output.css) and any other assets
app.use(express.static(path.join(__dirname, 'public')));

// Define a function to read and inject HTML partials
const getHomePage = async (req, res) => {
    try {
        // Read the main HTML file from the views directory
        let homePageHtml = await fs.readFile(path.join(__dirname, 'views', 'index.html'), 'utf8');

        // Read the header and footer files
        const headerHtml = await fs.readFile(path.join(__dirname, 'views', 'header.html'), 'utf8');
        const footerHtml = await fs.readFile(path.join(__dirname, 'views', 'footer.html'), 'utf8');

        // Dynamically inject the header and footer into the main HTML using the placeholders
        homePageHtml = homePageHtml.replace('{{ HEADER_PLACEHOLDER }}', headerHtml);
        homePageHtml = homePageHtml.replace('{{ FOOTER_PLACEHOLDER }}', footerHtml);

        // Send the final, combined HTML to the client
        res.send(homePageHtml);

    } catch (error) {
        console.error('Error serving homepage:', error);
        res.status(500).send('<h1>Server Error</h1><p>Could not load the page.</p>');
    }
};

// This is the route for the homepage (the root URL '/')
app.get('/', getHomePage);

// Other routes (e.g., for login, signup, etc.) will be added here in the future
// app.get('/login', ...);
// app.get('/signup', ...);

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
