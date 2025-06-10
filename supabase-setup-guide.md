# Supabase Setup Guide for Sleep Debt Calculator

This guide will help you set up Supabase to store sleep data for your Sleep Debt Calculator application.

## Step 1: Create a Supabase Account and Project

1. Go to [Supabase.com](https://supabase.com) and sign up for a free account
2. After signing in, click "New project"
3. Enter a project name (e.g., "Sleep Debt Calculator")
4. Set a secure database password (save it somewhere safe)
5. Choose a region closest to your users
6. Click "Create new project" and wait for it to be created (may take a few minutes)

## Step 2: Set Up Authentication

1. In your Supabase dashboard, go to "Authentication" in the sidebar
2. Under "Providers", make sure "Email" is enabled
3. Optionally, you can configure other providers like Google, GitHub, etc.

## Step 3: Set Up Database Tables and Policies
https://github.com/nuel232/sleepDeptCalculator.git

1. Go to "SQL Editor" in the sidebar
2. Click "New query"
3. Copy and paste the entire contents of the `supabase-setup.sql` file into the SQL editor
4. Click "Run" to execute the SQL commands
5. Verify that the `profiles` and `sleep_records` tables were created in the "Table Editor"

## Step 4: Get Your API Keys

1. Go to "Project Settings" (gear icon) in the sidebar
2. Click "API" in the settings menu
3. Under "Project API keys", you'll find:
   - URL: Your Supabase project URL
   - anon/public: Your public API key

## Step 5: Update Your Configuration

1. Open the `supabase-config.js` file in your project
2. Replace `YOUR_SUPABASE_URL` with your project URL
3. Replace `YOUR_SUPABASE_ANON_KEY` with your anon/public key

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

## Step 6: Test Your Integration

1. Open your application in a web browser
2. Click "Sign Up" to create a new user
3. Enter sleep data for a few days
4. Click "Calculate Sleep Debt"
5. Click "Sync Data" to save your data to Supabase
6. Check your Supabase dashboard's "Table Editor" to see if the data was saved

## Troubleshooting

If you encounter any issues:

1. Check the browser console for errors
2. Verify that your API keys are correct
3. Make sure the tables and policies were created correctly
4. Check that your user has authenticated successfully

## Advanced Configuration

- **Email verification**: By default, Supabase doesn't require email verification. To enable it, go to Authentication > Settings > Email Auth and toggle "Enable email confirmations"
- **Password requirements**: You can set password strength requirements in Authentication > Settings > Auth Providers
- **Storage**: If you want to add profile pictures or other files, you can use Supabase Storage 