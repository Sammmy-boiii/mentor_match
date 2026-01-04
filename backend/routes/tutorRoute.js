import express from "express"
import {
    tutorsList,
    loginTutor,
    applyTutor,
    tutorDashboard,
    tutorSessions,
    sessionComplete,
    sessionCancel,
    tutorProfile,
    updateTutorProfile
} from "../controllers/tutorController.js"
import authTutor from "../middlewares/authTutor.js"
import upload from "../middlewares/multer.js"

const tutorRouter = express.Router()

// Public routes
tutorRouter.get('/list', tutorsList)
tutorRouter.post('/login', loginTutor)
tutorRouter.post('/apply', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'document', maxCount: 1 }
]), applyTutor)

// Protected routes (require tutor authentication)
tutorRouter.get('/dashboard', authTutor, tutorDashboard)
tutorRouter.get('/sessions', authTutor, tutorSessions)
tutorRouter.post('/complete-session', authTutor, sessionComplete)
tutorRouter.post('/cancel-session', authTutor, sessionCancel)
tutorRouter.get('/profile', authTutor, tutorProfile)
tutorRouter.post('/update-profile', authTutor, updateTutorProfile)

export default tutorRouter