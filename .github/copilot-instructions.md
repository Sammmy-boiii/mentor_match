# MentorMatch Copilot Instructions

## Architecture Overview
MentorMatch is a full-stack tutoring platform with three separate applications:
- **Frontend** (`frontend/`): User-facing React app for browsing tutors, booking sessions, and managing profiles
- **Admin** (`admin/`): Admin panel for managing tutors and viewing sessions
- **Backend** (`backend/`): Express.js API server handling all business logic

All apps use Vite for development, with the backend running on port 4000.

## Key Technologies & Patterns
- **Database**: MongoDB with Mongoose ODM (models in `backend/models/`)
- **Authentication**: JWT tokens stored in localStorage (`token` for users, `aToken` for admins)
- **API Communication**: Axios for HTTP requests, responses follow `{success: boolean, message: string, data?: any}` pattern
- **State Management**: React Context providers (`AppContext`, `AdminContext`, `TutorContext`) for global state
- **Styling**: Tailwind CSS with custom color variables (`text-primary`, `bg-light`)
- **File Uploads**: Multer middleware + Cloudinary for image storage
- **Payments**: Stripe integration for session payments

## Development Workflows
- **Backend**: `cd backend && npm start` (production) or `npm run server` (dev with nodemon)
- **Frontend/Admin**: `cd frontend|admin && npm run dev` (Vite dev server)
- **Environment**: Backend uses `.env` for secrets; frontend uses `VITE_BACKEND_URL` for API base URL
- **Build**: `npm run build` in each app directory for production bundles

## Code Patterns
- **API Controllers** (`backend/controllers/`): Async functions with try-catch, return JSON responses (e.g., `adminController.js`)
- **Models** (`backend/models/`): Mongoose schemas with required fields and defaults (e.g., `tutorModel.js`)
- **Routes** (`backend/routes/`): Express routers mounted at `/api/admin`, `/api/tutor`, `/api/user`
- **Components**: PascalCase JSX files, reusable in `Components/` (frontend) or `components/` (admin)
- **Contexts**: Provide API functions and state; use `useContext` to access (e.g., `AppContext.jsx`)
- **Error Handling**: Toast notifications via `react-toastify` for user feedback

## Key Files to Reference
- `backend/server.js`: Main server setup and route mounting
- `frontend/src/App.jsx`: Main app component with routing
- `backend/controllers/adminController.js`: Example of API endpoint implementation
- `frontend/src/context/AppContext.jsx`: State management and API calls
- `backend/models/tutorModel.js`: Data schema example

## Conventions
- Use ES modules (`import/export`) across all apps
- API endpoints return consistent response format for easy error handling
- Store user/admin tokens in localStorage for persistence
- Use `date: Date.now()` for timestamps in models
- Component props follow destructuring pattern (e.g., `{tutors, setTutors}`)

Focus on maintaining separation between user, admin, and backend concerns when adding features.