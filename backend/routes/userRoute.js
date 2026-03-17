import express from "express"
import { registerUser, loginUser, getProfile, updateProfile, bookSession, listSessions, cancelSession, initiateEsewa, verifyEsewa, initiateKhalti, verifyKhalti } from "../controllers/userController.js"
import authUser from "../middlewares/authUser.js"
import upload from "../middlewares/multer.js"

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/get-profile', authUser, getProfile)
userRouter.post('/update-profile', upload.single('image'), authUser, updateProfile)
userRouter.post('/book-session', authUser, bookSession)
userRouter.get('/sessions', authUser, listSessions)
userRouter.post('/cancel-session', authUser, cancelSession)
userRouter.post('/payment-khalti', authUser, initiateKhalti)
userRouter.post('/payment-esewa', authUser, initiateEsewa)
userRouter.post('/verify-esewa', authUser, verifyEsewa)
userRouter.post('/verify-khalti', authUser, verifyKhalti)
// payment failure handler removed




export default userRouter