# Sleep Debt Calculator

A web application that helps you track, analyze, and improve your sleep patterns.

## Overview

The "Sleep Debt Calculator" is a web-based tool designed to help users monitor and assess their sleep patterns throughout the week. This interactive application allows individuals to input the number of hours they have slept each day of the week, and it calculates whether they are accumulating a sleep deficit or oversleeping.

## Features

- Track sleep hours for each day of the week
- Calculate sleep debt based on ideal sleep hours
- Visualize sleep patterns with an interactive chart
- Rate your sleep quality with a 5-star system
- Get personalized sleep recommendations
- View and track your sleep history
- User authentication with Supabase
- Dark/light theme toggle
- Local and cloud data storage

## User Experience

- **Intuitive Interface**: The application features a calming background color and a clean layout to enhance the user experience.
- **Input Fields**: Enter the number of hours you slept for each day of the week (Monday through Sunday), with inputs limited to values between 0 and 24 hours.
- **Result Display**: After calculation, a results section displays the outcome with a customized message based on your sleep habits for the week, informing you if you have no sleep debt, need more sleep, or have slept more than required.
- **Visual Appeal**: The application is aesthetically pleasing, with a responsive design that adapts to different screen sizes and devices.

## Setup Instructions

### 1. Install Dependencies

If you want to use environment variables for Supabase credentials:

```bash
npm install
```

This will install the dotenv package for environment variables.

### 2. Environment Variables

For better security, you can use environment variables to store your Supabase credentials:

1. Create a `.env` file in the root directory
2. Add the following variables:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Supabase Setup

1. Go to [Supabase.com](https://supabase.com) and sign up for a free account
2. Create a new project
3. In your project, go to "SQL Editor" and run the SQL commands from `supabase-setup.sql`
4. Go to "Authentication" > "Providers" and make sure "Email" is enabled
5. Go to "Authentication" > "URL Configuration" and add the following authorized redirect URLs:
   - `http://localhost:3000/auth.html` (for local development)
   - Your production URL if you have one
6. Get your API keys from "Project Settings" > "API" and add them to your `.env` file

### 4. Running Locally

#### Option 1: Using npm (recommended)

```bash
npm start
```

#### Option 2: Using the included batch file

```bash
start-server.bat
```

#### Option 3: Using a web server of your choice

Configure your web server to serve the project files, making sure to handle redirects properly for the authentication flow.

## Troubleshooting

### Email Confirmation Issues

If you're having trouble with email confirmation links:

1. Make sure the redirect URLs in Supabase match exactly how you're accessing the application
2. Check that you're using the same protocol (http/https) and domain
3. If a confirmation link has expired, use the "Resend confirmation email" link on the login page
4. Check your spam folder for confirmation emails

### Authentication Errors

If you see a 400 error when trying to authenticate:

1. Check that your Supabase API keys are correct in your `.env` file or `supabase-config.js`
2. Ensure the email confirmation process is completed before trying to log in
3. Try clearing your browser cache and cookies

## Data Privacy

All sleep data is stored:
- Locally in your browser's localStorage (for guest mode)
- In your Supabase database (for authenticated users)

No data is shared with third parties.

## Repository

The project is hosted on GitHub: [https://github.com/nuel232/sleepDeptCalculator](https://github.com/nuel232/sleepDeptCalculator)

## License

MIT License 