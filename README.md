Issue Tracker Frontend

A web application for managing and tracking issues. Users can create issues, assign them to team members, and track their progress.

Getting Started

Prerequisites

You need to have Node.js (version 16 or higher) installed on your computer before starting.

Installation Steps

1. Clone the project
git clone https://github.com/your-username/Issue_Tracker_Frontend.git
cd Issue_Tracker_Frontend

2. Install dependencies
npm install

This downloads all the required packages needed to run the application.

3. Environment Setup
Create a .env file in the root directory with this content:

VITE_API_BASE_URL=https://issuetrackerbackend-production-b3c3.up.railway.app/api

This tells the application where to find the backend server. The backend URL is already set to the production server.

4. Start the application
npm start

Open your browser and go to http://localhost:3000. The page automatically refreshes when you make changes.

What You Can Do

- Log in with admin credentials 
•	email - admin@itracker.com 
•	password – admin@123
- Create new issues and assign them to team members
- View all issues in a list format
- Update and delete issues
- Admin users can manage other users in the system

How It Works

When you log in, your authentication token is stored securely. Each request to the backend includes this token. Different users see different features based on their role (admin or regular user).

Running Commands

npm start - Starts the development server for testing
npm run build - Creates a production-ready version
npm test - Runs the application tests

Backend Connection

The application connects to the backend API at https://issuetrackerbackend-production-b3c3.up.railway.app/api. Make sure this server is running or you will see connection errors.

If you want to use a local backend server, change the URL in the .env file to http://localhost:5000/api.

Troubleshooting

If the app won't start:
- Delete node_modules folder
- Delete package-lock.json
- Run npm install again
- Run npm start

If you see API errors:
- Check that the backend server is running
- Verify the VITE_API_BASE_URL in .env file is correct
- Check your internet connection

If you see a blank page:
- Open browser developer tools (F12)
- Check the Console tab for error messages
- Refresh the page

Building for Production

To create a production build:
npm run build

This creates an optimized version in the build folder that you can deploy to hosting services like Vercel or Netlify.

Browser Support

Works on Chrome, Firefox, Safari, and Edge (latest versions).




