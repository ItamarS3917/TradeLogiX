# Trading Journal App - Frontend

## Overview
This is the frontend application for the Trading Journal App, built with React, Vite, and Material-UI. It provides a user interface for day traders to track, analyze, and improve their trading performance.

## Project Structure
The project follows a structured organization:

```
frontend-new/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── hooks/          # Custom hooks
│   ├── contexts/       # React contexts
│   ├── utils/          # Utility functions
│   └── assets/         # Images, fonts, etc.
```

## Implemented Features
- **Authentication System**: Login page with form validation
- **Protected Routes**: Navigation guards for authenticated routes
- **Layout**: Responsive layout with sidebar navigation
- **Dashboard**: Basic dashboard with performance metrics display
- **State Management**: Context-based state management for authentication, loading states, and notifications
- **API Services**: Services for communication with the backend API

## Dependencies
- React 18
- React Router DOM 6
- Material-UI
- Axios
- React Hook Form
- Recharts (for data visualization)

## Getting Started

### Installation
```bash
# Navigate to the frontend directory
cd frontend-new

# Install dependencies
npm install
```

### Development
```bash
# Start the development server
npm start
```

### Building for Production
```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## Next Development Steps
1. **Trade Journal Implementation**
   - Create trade entry and edit forms
   - Implement trade listing and filtering
   - Connect to backend API

2. **Daily Planning Implementation**
   - Create daily planning page
   - Implement planning history
   - Connect to backend API

3. **Statistics Page Implementation**
   - Create core statistics components
   - Add interactive filtering
   - Connect to backend API

## Architecture Decisions
- **Vite**: Used as the build tool for faster development and better performance
- **React Context**: Used for state management instead of Redux for simplicity
- **Material-UI**: Chosen for UI components to ensure consistent design
- **Axios**: Used for API calls with interceptors for authentication and error handling

## API Integration
The frontend communicates with the backend API running on `http://localhost:8000/api`. API services are organized by feature (auth, trade, journal, planning) with a common base client that handles authentication and error management.

## Contribution Guidelines
- Use feature branches for new development
- Follow the established directory structure
- Use functional components with hooks
- Implement proper error handling for all API calls
- Add loading states for asynchronous operations
- Write meaningful commit messages

---

Last Updated: May 11, 2025
