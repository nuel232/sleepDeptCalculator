// Simple HTTP server for testing the Sleep Debt Calculator locally
// This helps with redirect URLs and authentication flows

// Try to load environment variables from .env file
try {
    const fs = require('fs');
    const dotenv = require('dotenv');
    // Check if .env file exists
    if (fs.existsSync('.env')) {
        console.log('Loading environment variables from .env file');
        dotenv.config();
    } else {
        console.log('No .env file found. Using default values from supabase-config.js');
    }
} catch (err) {
    console.log('dotenv module not found. Using default values from supabase-config.js');
    // This allows the app to work even without dotenv installed
}

const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 3000;

// MIME types for different file extensions
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

// Create HTTP server
const server = http.createServer((req, res) => {
    console.log(`Request: ${req.method} ${req.url}`);
    
    // Parse URL to get the pathname
    let filePath = req.url;
    
    // Handle root URL
    if (filePath === '/') {
        filePath = '/index.html';
    }
    
    // Check for query parameters and remove them for file path
    if (filePath.includes('?')) {
        filePath = filePath.split('?')[0];
    }
    
    // Get the full path to the file
    const fullPath = path.join(__dirname, filePath);
    
    // Get file extension
    const extname = path.extname(fullPath).toLowerCase();
    
    // Get content type based on file extension
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // Read the file
    fs.readFile(fullPath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                console.error(`File not found: ${fullPath}`);
                
                // Try to serve index.html for SPA-like behavior
                fs.readFile(path.join(__dirname, '/index.html'), (err, content) => {
                    if (err) {
                        res.writeHead(404);
                        res.end('404 Not Found');
                        return;
                    }
                    
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                // Server error
                console.error(`Server error: ${err.code}`);
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Open this URL in your browser to test the application`);
    console.log(`Make sure to update your Supabase redirect URL to: http://localhost:${PORT}/auth.html`);
}); 