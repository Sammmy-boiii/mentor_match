import { Server } from 'socket.io'
import { activeRooms } from '../controllers/videoCallController.js'
import sessionModel from '../models/sessionModel.js'

const setupSocketIO = (server) => {
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173", "http://localhost:5174", process.env.FRONTEND_URL, process.env.ADMIN_URL],
            methods: ["GET", "POST"],
            credentials: true
        }
    })

    // Store socket connections by room
    const roomSockets = new Map()

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id)

        // ================= JOIN VIDEO ROOM =================
        socket.on('join-room', async ({ roomId, userId, userType, accessToken }) => {
            try {
                // Validate access
                const room = activeRooms.get(roomId)
                if (!room) {
                    socket.emit('error', { message: 'Room not found or expired' })
                    return
                }

                const participant = room.participants.get(userId)
                if (!participant || participant.token !== accessToken) {
                    socket.emit('error', { message: 'Invalid access credentials' })
                    return
                }

                // Join socket room
                socket.join(roomId)
                socket.roomId = roomId
                socket.odId = userId
                socket.userType = userType

                // Store socket reference
                if (!roomSockets.has(roomId)) {
                    roomSockets.set(roomId, new Map())
                }
                roomSockets.get(roomId).set(userId, socket.id)

                // Update participant socket id
                participant.socketId = socket.id

                // Get existing users in room
                const existingUsers = []
                for (const [uid, participant] of room.participants.entries()) {
                    if (uid !== userId && participant.socketId) {
                        existingUsers.push({
                            odId: uid,
                            userType: participant.userType,
                            socketId: participant.socketId
                        })
                    }
                }

                // Notify existing users about new participant
                socket.to(roomId).emit('user-joined', {
                    odId: userId,
                    userType,
                    socketId: socket.id
                })

                // Send list of existing participants to new user
                socket.emit('room-users', { users: existingUsers })

                // Check if both participants are present
                const participantCount = room.participants.size
                if (participantCount >= 2) {
                    // Update session status to in-progress
                    const session = await sessionModel.findOne({ roomId })
                    if (session && session.callStatus !== 'in-progress') {
                        session.callStatus = 'in-progress'
                        session.callStartedAt = new Date()
                        await session.save()
                        
                        io.to(roomId).emit('call-started', {
                            callStartedAt: session.callStartedAt
                        })
                    }
                }

                console.log(`User ${userId} (${userType}) joined room ${roomId}`)

            } catch (error) {
                console.error('Error joining room:', error)
                socket.emit('error', { message: 'Failed to join room' })
            }
        })

        // ================= WEBRTC SIGNALING =================
        
        // Send offer to specific peer
        socket.on('offer', ({ offer, targetSocketId }) => {
            io.to(targetSocketId).emit('offer', {
                offer,
                senderSocketId: socket.id,
                senderType: socket.userType
            })
        })

        // Send answer to specific peer
        socket.on('answer', ({ answer, targetSocketId }) => {
            io.to(targetSocketId).emit('answer', {
                answer,
                senderSocketId: socket.id
            })
        })

        // Send ICE candidate to specific peer
        socket.on('ice-candidate', ({ candidate, targetSocketId }) => {
            io.to(targetSocketId).emit('ice-candidate', {
                candidate,
                senderSocketId: socket.id
            })
        })

        // ================= CALL CONTROLS =================
        
        // Mute/unmute audio
        socket.on('toggle-audio', ({ roomId, isMuted }) => {
            socket.to(roomId).emit('peer-audio-toggle', {
                odId: socket.odId,
                isMuted
            })
        })

        // Enable/disable video
        socket.on('toggle-video', ({ roomId, isVideoOff }) => {
            socket.to(roomId).emit('peer-video-toggle', {
                odId: socket.odId,
                isVideoOff
            })
        })

        // Screen share started/stopped
        socket.on('screen-share', ({ roomId, isSharing }) => {
            socket.to(roomId).emit('peer-screen-share', {
                odId: socket.odId,
                isSharing
            })
        })

        // Chat message
        socket.on('chat-message', ({ roomId, message }) => {
            io.to(roomId).emit('chat-message', {
                senderId: socket.odId,
                senderType: socket.userType,
                message,
                timestamp: Date.now()
            })
        })

        // ================= END CALL =================
        socket.on('end-call', async ({ roomId }) => {
            try {
                const session = await sessionModel.findOne({ roomId })
                if (session) {
                    // Calculate duration
                    let duration = 0
                    if (session.callStartedAt) {
                        duration = Math.floor((Date.now() - session.callStartedAt.getTime()) / 1000)
                    }

                    session.callStatus = 'ended'
                    session.callEndedAt = new Date()
                    session.callDuration = duration
                    session.isCompleted = true
                    await session.save()

                    // Notify all participants
                    io.to(roomId).emit('call-ended', {
                        callDuration: duration,
                        endedBy: socket.odId
                    })

                    // Clean up room
                    activeRooms.delete(roomId)
                    roomSockets.delete(roomId)
                }
            } catch (error) {
                console.error('Error ending call:', error)
            }
        })

        // ================= LEAVE ROOM =================
        socket.on('leave-room', ({ roomId }) => {
            handleUserLeave(socket, roomId)
        })

        // ================= DISCONNECT =================
        socket.on('disconnect', () => {
            if (socket.roomId) {
                handleUserLeave(socket, socket.roomId)
            }
            console.log('User disconnected:', socket.id)
        })

        // ================= CONNECTION STATE =================
        socket.on('connection-state', ({ roomId, state }) => {
            socket.to(roomId).emit('peer-connection-state', {
                odId: socket.odId,
                state
            })
        })

        // Handle reconnection attempt
        socket.on('reconnect-attempt', async ({ roomId, userId, accessToken }) => {
            const room = activeRooms.get(roomId)
            if (room && room.participants.has(userId)) {
                const participant = room.participants.get(userId)
                if (participant.token === accessToken) {
                    // Update socket reference
                    participant.socketId = socket.id
                    socket.join(roomId)
                    socket.roomId = roomId
                    socket.odId = userId
                    socket.userType = participant.userType

                    if (roomSockets.has(roomId)) {
                        roomSockets.get(roomId).set(userId, socket.id)
                    }

                    // Notify others of reconnection
                    socket.to(roomId).emit('peer-reconnected', {
                        odId: userId,
                        socketId: socket.id
                    })

                    socket.emit('reconnect-success', { roomId })
                }
            }
        })
    })

    // Helper function to handle user leaving
    const handleUserLeave = async (socket, roomId) => {
        try {
            socket.leave(roomId)
            
            // Remove from room sockets
            if (roomSockets.has(roomId)) {
                const sockets = roomSockets.get(roomId)
                for (const [odId, socketId] of sockets.entries()) {
                    if (socketId === socket.id) {
                        sockets.delete(odId)
                        break
                    }
                }
            }

            // Remove from active rooms
            const room = activeRooms.get(roomId)
            if (room && socket.odId) {
                room.participants.delete(socket.odId)
                
                // Notify others
                socket.to(roomId).emit('user-left', {
                    odId: socket.odId,
                    userType: socket.userType
                })

                // If room is empty, clean up
                if (room.participants.size === 0) {
                    activeRooms.delete(roomId)
                    roomSockets.delete(roomId)
                }
            }
        } catch (error) {
            console.error('Error handling user leave:', error)
        }
    }

    // Periodic cleanup for stale connections
    setInterval(() => {
        for (const [roomId, sockets] of roomSockets.entries()) {
            for (const [odId, socketId] of sockets.entries()) {
                const socket = io.sockets.sockets.get(socketId)
                if (!socket || !socket.connected) {
                    sockets.delete(odId)
                    
                    const room = activeRooms.get(roomId)
                    if (room) {
                        room.participants.delete(odId)
                    }
                }
            }
            
            if (sockets.size === 0) {
                roomSockets.delete(roomId)
            }
        }
    }, 30000) // Every 30 seconds

    return io
}

export default setupSocketIO
