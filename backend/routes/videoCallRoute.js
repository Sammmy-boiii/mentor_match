import express from "express"
import {
    generateRoomId,
    joinRoom,
    tutorJoinRoom,
    startCall,
    endCall,
    getRoomStatus,
    leaveRoom,
    validateRoomAccess
} from "../controllers/videoCallController.js"
import authUser from "../middlewares/authUser.js"
import authTutor from "../middlewares/authTutor.js"

const videoCallRouter = express.Router()

// User routes (requires user authentication)
videoCallRouter.post('/generate-room', authUser, generateRoomId)
videoCallRouter.post('/join', authUser, joinRoom)
videoCallRouter.post('/leave', authUser, leaveRoom)
videoCallRouter.post('/validate', authUser, validateRoomAccess)

// Tutor routes (requires tutor authentication)
videoCallRouter.post('/tutor/generate-room', authTutor, generateRoomId)
videoCallRouter.post('/tutor/join', authTutor, tutorJoinRoom)
videoCallRouter.post('/tutor/leave', authTutor, leaveRoom)
videoCallRouter.post('/tutor/validate', authTutor, validateRoomAccess)

// Shared routes (can be called by either user or tutor)
videoCallRouter.post('/start', startCall)
videoCallRouter.post('/end', endCall)
videoCallRouter.get('/status/:roomId', getRoomStatus)

export default videoCallRouter
