// Supabase configuration
// The code will first try to use environment variables if available
// If not, it will fall back to placeholders that should be replaced

// Check if running in Node.js environment with dotenv
const isNode = typeof process !== 'undefined' && process.env;

// Get values from environment variables or use placeholders
// Important: Even when using placeholders, we need to provide valid URL formats
// to prevent 'Failed to construct URL' errors
const SUPABASE_URL = isNode && process.env.SUPABASE_URL 
    ? process.env.SUPABASE_URL 
    : 'https://example.supabase.co'; // This is a dummy URL but in valid format

const SUPABASE_ANON_KEY = isNode && process.env.SUPABASE_ANON_KEY 
    ? process.env.SUPABASE_ANON_KEY 
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjQxMjM0NX0.dummy_token_for_development';

// These are the values you'll get after setting up your Supabase project
// Instructions to get these values:
// 1. Go to https://supabase.com and sign up/login
// 2. Create a new project
// 3. Go to Project Settings > API
// 4. Copy the URL and anon/public key to your .env file

// IMPORTANT: For security, never commit your actual Supabase URL and key to version control!
// Always use environment variables (.env file) which should be in your .gitignore

// If you haven't set up Supabase yet, the app will work with localStorage only 