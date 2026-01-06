import express from 'express';
import upload from '../middlewares/multer.js';
import authAdmin from '../middlewares/authAdmin.js';
import { addTutor, allTutors, loginAdmin, allSessions, cancelSession, adminDashboard, getTutorApplications, approveTutorApplication, rejectTutorApplication, updateTutor, deleteTutor } from '../controllers/adminController.js';
import { changeAvailability } from '../controllers/tutorController.js';

const adminRouter = express.Router();

adminRouter.post('/add-tutor', authAdmin, upload.single('image'), addTutor);

adminRouter.post('/login', loginAdmin);

adminRouter.post('/all-tutors', authAdmin, allTutors);

adminRouter.post('/change-availability', authAdmin, changeAvailability);

adminRouter.get('/all-sessions', authAdmin, allSessions);

adminRouter.post('/cancel-session', authAdmin, cancelSession);

adminRouter.get('/dashboard', authAdmin, adminDashboard);

// Tutor Applications routes
adminRouter.get('/tutor-applications', authAdmin, getTutorApplications);
adminRouter.post('/approve-application', authAdmin, approveTutorApplication);
adminRouter.post('/reject-application', authAdmin, rejectTutorApplication);

// Edit/Delete Tutor routes
adminRouter.post('/update-tutor', authAdmin, upload.single('image'), updateTutor);
adminRouter.post('/delete-tutor', authAdmin, deleteTutor);

export default adminRouter;
