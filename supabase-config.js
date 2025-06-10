// Supabase configuration
// The code will first try to use environment variables if available
// If not, it will fall back to the hardcoded values

// Check if running in Node.js environment
const isNode = typeof process !== 'undefined' && process.env;

// Get values from environment variables or use fallbacks
const SUPABASE_URL = isNode && process.env.SUPABASE_URL 
    ? process.env.SUPABASE_URL 
    : 'your-supabase-url';

const SUPABASE_ANON_KEY = isNode && process.env.SUPABASE_ANON_KEY 
    ? process.env.SUPABASE_ANON_KEY 
    : 'your-supabase-anon-key';

// These are the values you'll get after setting up your Supabase project
// Instructions to get these values:
// 1. Go to https://supabase.com and sign up/login
// 2. Create a new project
// 3. Go to Project Settings > API
// 4. Copy the URL and anon/public key to your .env file

// If you haven't set up Supabase yet, the app will work with localStorage only 