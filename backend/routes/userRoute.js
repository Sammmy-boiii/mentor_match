import express from "express"
import {registerUser,loginUser, getProfile, updateProfile, bookSession, listSessions, cancelSession, paymentEsewa, verifyEsewa} from "../controllers/userController.js"
import authUser from "../middlewares/authUser.js"
import upload from "../middlewares/multer.js"

const userRouter=express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.get('/get-profile',authUser,getProfile)
userRouter.post('/update-profile', upload.single('image'),authUser,updateProfile)
userRouter.post('/book-session',authUser,bookSession) 
userRouter.get('/sessions',authUser,listSessions) 
userRouter.post('/cancel-session',authUser,cancelSession)
userRouter.post('/payment-esewa',authUser,paymentEsewa)
userRouter.post('/verify-esewa',verifyEsewa)




export default userRouter 