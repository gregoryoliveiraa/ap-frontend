# AP-Frontend

Frontend application for the Advogada Parceira platform, a legal document management and generation system.

## Overview

This React application provides an intuitive interface for legal professionals to manage, create, and generate legal documents. It connects to the AP-Backend API to handle data processing and document operations.

## Features

- **User Authentication**: Secure login and registration system
- **Dashboard**: Overview of recent activities and documents
- **Document Management**: Create, view, edit, and delete legal documents
- **Document Generation**: AI-assisted document generation based on templates
- **Templates Library**: Access to a collection of legal document templates
- **Chat Interface**: Communicate with AI assistant for legal questions

## Technology Stack

- **React**: Frontend library for building user interfaces
- **TypeScript**: For type-safe code
- **Material UI**: Component library for consistent design
- **Redux**: State management
- **Axios**: HTTP client for API requests
- **React Router**: Navigation and routing

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/gregoryoliveiraa/ap-frontend.git
   cd ap-frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and set appropriate environment variables.

4. Start the development server:
   ```
   npm start
   ```

## Project Structure

```
ap-frontend/
├── public/                 # Static files
├── src/                    # Source files
│   ├── assets/             # Images, fonts, etc.
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React contexts for state
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Dashboard
│   │   ├── documents/      # Document management
│   │   └── templates/      # Template management
│   ├── services/           # API services and utilities
│   ├── state/              # Redux store, reducers, actions
│   ├── styles/             # Global styles
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main App component
│   ├── index.tsx           # Entry point
│   └── routes.tsx          # App routes
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Runs the test suite
- `npm run build`: Builds the app for production
- `npm run lint`: Lints the codebase

## API Connection

The frontend connects to the AP-Backend API for all data operations. Make sure the backend server is running and the correct API URL is set in the environment variables.

## Development Notes

- Use the provided component structure to maintain consistency
- Follow the established styling patterns with Material UI
- Run tests before submitting PRs
- The application is designed to be responsive across all devices

## License

This project is proprietary software and is not licensed for public use without explicit permission.

## Contact

For questions or support, contact the development team at gregory.oliveira.it@gmail.com. 