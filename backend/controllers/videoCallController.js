import sessionModel from "../models/sessionModel.js"
import crypto from "crypto"

// Active rooms storage (in production, use Redis)
const activeRooms = new Map()

// ================= GENERATE ROOM ID =================
const generateRoomId = async (req, res) => {
    try {
        const { sessionId } = req.body
        // Support both user and tutor - userId from authUser, tutId from authTutor
        const participantId = req.userId || req.tutId

        console.log('generateRoomId - sessionId:', sessionId, 'participantId:', participantId)

        const session = await sessionModel.findById(sessionId)

        if (!session) {
            console.log('Session not found')
            return res.json({ success: false, message: "Session not found" })
        }

        console.log('Session found - userId:', session.userId, 'tutId:', session.tutId)

        // Check if user is authorized (either the student or the tutor)
        // Convert to strings for comparison since MongoDB stores ObjectIds
        if (session.userId.toString() !== participantId && session.tutId.toString() !== participantId) {
            console.log('Unauthorized - session.userId:', session.userId.toString(), 'session.tutId:', session.tutId.toString(), 'participantId:', participantId)
            return res.json({ success: false, message: "Unauthorized access" })
        }

        // Check if payment is completed
        if (!session.payment) {
            return res.json({ success: false, message: "Payment not completed. Please complete payment first." })
        }

        // Check if session is cancelled or completed
        if (session.cancelled) {
            return res.json({ success: false, message: "Session has been cancelled" })
        }

        if (session.isCompleted) {
            return res.json({ success: false, message: "Session has already been completed" })
        }

        // Generate room ID if not exists - using findOneAndUpdate for atomicity
        if (!session.roomId) {
            const newRoomId = `room_${session._id}_${crypto.randomBytes(8).toString('hex')}`;
            const updatedSession = await sessionModel.findOneAndUpdate(
                { _id: sessionId, $or: [{ roomId: { $exists: false } }, { roomId: "" }, { roomId: null }] },
                { $set: { roomId: newRoomId, roomCreatedAt: new Date() } },
                { new: true }
            );

            // If another process updated it first, use the one from DB
            if (updatedSession) {
                session.roomId = updatedSession.roomId;
                console.log('Generated new roomId:', session.roomId);
            } else {
                const refreshedSession = await sessionModel.findById(sessionId);
                session.roomId = refreshedSession.roomId;
                console.log('Using existing roomId (from race winner):', session.roomId);
            }
        }

        res.json({
            success: true,
            roomId: session.roomId,
            sessionId: session._id
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ================= JOIN ROOM =================
const joinRoom = async (req, res) => {
    try {
        const { roomId } = req.body
        const userId = req.userId
        const userType = req.userType || 'user' // 'user' or 'tutor'

        const session = await sessionModel.findOne({ roomId })

        if (!session) {
            return res.json({ success: false, message: "Room not found" })
        }

        // Verify user is authorized to join (convert to strings for comparison)
        const isAuthorized = (userType === 'user' && session.userId.toString() === userId) ||
            (userType === 'tutor' && session.tutId.toString() === userId)

        if (!isAuthorized) {
            return res.json({ success: false, message: "You are not authorized to join this room" })
        }

        // Check payment status
        if (!session.payment) {
            return res.json({ success: false, message: "Payment not completed" })
        }

        // Check session status
        if (session.cancelled) {
            return res.json({ success: false, message: "Session has been cancelled" })
        }

        if (session.isCompleted) {
            return res.json({ success: false, message: "Session has already ended" })
        }

        // Update call status
        if (session.callStatus === 'not-started') {
            session.callStatus = 'waiting'
            await session.save()
        }

        // Generate a secure token for this user
        const accessToken = crypto.randomBytes(32).toString('hex')

        // Store in active rooms (with expiry)
        if (!activeRooms.has(roomId)) {
            activeRooms.set(roomId, {
                participants: new Map(),
                createdAt: Date.now()
            })
        }

        const room = activeRooms.get(roomId)
        room.participants.set(userId, {
            token: accessToken,
            userType,
            joinedAt: Date.now()
        })

        res.json({
            success: true,
            accessToken,
            roomId,
            sessionId: session._id,
            participantId: userId,  // The actual user/tutor ID from JWT
            userData: userType === 'user' ? session.userData : session.tutData,
            peerData: userType === 'user' ? session.tutData : session.userData,
            callStatus: session.callStatus
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ================= TUTOR JOIN ROOM =================
const tutorJoinRoom = async (req, res) => {
    try {
        const { roomId } = req.body
        const tutId = req.tutId  // Get from authTutor middleware

        const session = await sessionModel.findOne({ roomId })

        if (!session) {
            return res.json({ success: false, message: "Room not found" })
        }

        // Verify tutor is authorized (convert to string for comparison)
        if (session.tutId.toString() !== tutId) {
            return res.json({ success: false, message: "You are not authorized to join this room" })
        }

        // Check payment and session status
        if (!session.payment) {
            return res.json({ success: false, message: "Payment not completed" })
        }

        if (session.cancelled) {
            return res.json({ success: false, message: "Session has been cancelled" })
        }

        if (session.isCompleted) {
            return res.json({ success: false, message: "Session has already ended" })
        }

        // Update call status
        if (session.callStatus === 'not-started') {
            session.callStatus = 'waiting'
            await session.save()
        }

        // Generate access token
        const accessToken = crypto.randomBytes(32).toString('hex')

        // Store in active rooms
        if (!activeRooms.has(roomId)) {
            activeRooms.set(roomId, {
                participants: new Map(),
                createdAt: Date.now()
            })
        }

        const room = activeRooms.get(roomId)
        room.participants.set(tutId, {
            token: accessToken,
            userType: 'tutor',
            joinedAt: Date.now()
        })

        res.json({
            success: true,
            accessToken,
            roomId,
            sessionId: session._id,
            participantId: tutId,  // The actual tutor ID from JWT
            userData: session.tutData,
            peerData: session.userData,
            callStatus: session.callStatus
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ================= START CALL =================
const startCall = async (req, res) => {
    try {
        const { roomId } = req.body

        const session = await sessionModel.findOne({ roomId })

        if (!session) {
            return res.json({ success: false, message: "Room not found" })
        }

        session.callStatus = 'in-progress'
        session.callStartedAt = new Date()
        await session.save()

        res.json({
            success: true,
            message: "Call started",
            callStartedAt: session.callStartedAt
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ================= END CALL =================
const endCall = async (req, res) => {
    try {
        const { roomId, sessionId } = req.body

        const session = await sessionModel.findOne({
            $or: [{ roomId }, { _id: sessionId }]
        })

        if (!session) {
            return res.json({ success: false, message: "Session not found" })
        }

        // Calculate call duration
        let duration = 0
        if (session.callStartedAt) {
            duration = Math.floor((Date.now() - session.callStartedAt.getTime()) / 1000)
        }

        session.callStatus = 'ended'
        session.callEndedAt = new Date()
        session.callDuration = duration
        session.isCompleted = true
        await session.save()

        // Clean up active room
        if (session.roomId && activeRooms.has(session.roomId)) {
            activeRooms.delete(session.roomId)
        }

        res.json({
            success: true,
            message: "Call ended successfully",
            callDuration: duration
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ================= GET ROOM STATUS =================
const getRoomStatus = async (req, res) => {
    try {
        const { roomId } = req.params

        const session = await sessionModel.findOne({ roomId })

        if (!session) {
            return res.json({ success: false, message: "Room not found" })
        }

        const room = activeRooms.get(roomId)
        const participantCount = room ? room.participants.size : 0

        res.json({
            success: true,
            roomId,
            callStatus: session.callStatus,
            participantCount,
            callStartedAt: session.callStartedAt,
            callDuration: session.callDuration
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ================= LEAVE ROOM =================
const leaveRoom = async (req, res) => {
    try {
        const { roomId } = req.body
        const userId = req.userId || req.body.tutId

        const room = activeRooms.get(roomId)
        if (room && room.participants.has(userId)) {
            room.participants.delete(userId)

            // If no participants left, clean up room
            if (room.participants.size === 0) {
                activeRooms.delete(roomId)
            }
        }

        res.json({ success: true, message: "Left room successfully" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ================= VALIDATE ROOM ACCESS =================
const validateRoomAccess = async (req, res) => {
    try {
        const { roomId, accessToken } = req.body
        const userId = req.userId || req.body.tutId

        const session = await sessionModel.findOne({ roomId })

        if (!session) {
            return res.json({ success: false, message: "Room not found" })
        }

        // Check if session is valid
        if (session.cancelled || session.isCompleted) {
            return res.json({ success: false, message: "Session is no longer active" })
        }

        // Validate user belongs to session
        if (session.userId !== userId && session.tutId !== userId) {
            return res.json({ success: false, message: "Unauthorized access" })
        }

        // Validate access token
        const room = activeRooms.get(roomId)
        if (!room || !room.participants.has(userId)) {
            return res.json({ success: false, message: "Please join the room first" })
        }

        const participant = room.participants.get(userId)
        if (participant.token !== accessToken) {
            return res.json({ success: false, message: "Invalid access token" })
        }

        res.json({
            success: true,
            message: "Access validated",
            userType: participant.userType
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Cleanup expired rooms (call periodically)
const cleanupExpiredRooms = () => {
    const now = Date.now()
    const maxAge = 3 * 60 * 60 * 1000 // 3 hours

    for (const [roomId, room] of activeRooms.entries()) {
        if (now - room.createdAt > maxAge) {
            activeRooms.delete(roomId)
        }
    }
}

// Run cleanup every hour
setInterval(cleanupExpiredRooms, 60 * 60 * 1000)

export {
    generateRoomId,
    joinRoom,
    tutorJoinRoom,
    startCall,
    endCall,
    getRoomStatus,
    leaveRoom,
    validateRoomAccess,
    activeRooms
}
