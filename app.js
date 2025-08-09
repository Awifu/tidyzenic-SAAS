const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs/promises');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithCustomToken, signInAnonymously } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');

// Set the port for the server
const PORT = process.env.PORT || 3000;

// Global variables provided by the Canvas environment
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

let db;
let auth;

// Function to initialize Firebase and authenticate
const initializeFirebase = async () => {
    try {
        const firebaseApp = initializeApp(firebaseConfig);
        db = getFirestore(firebaseApp);
        auth = getAuth(firebaseApp);

        // Sign in with the provided custom token or anonymously if not available
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
            console.log('✅ Signed in with custom token.');
        } else {
            await signInAnonymously(auth);
            console.log('✅ Signed in anonymously.');
        }
    } catch (error) {
        console.error('❌ Error initializing Firebase:', error);
        // You might want to handle this error more gracefully in a real application
    }
};

// Serve static files from the public directory
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

// Initialize Firebase and start the server
initializeFirebase().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Server running at http://localhost:${PORT}`);
    });
});
