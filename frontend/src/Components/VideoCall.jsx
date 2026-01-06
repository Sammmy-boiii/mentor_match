import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, FaDesktop, FaComments, FaTimes, FaExpand, FaCompress } from 'react-icons/fa';

// Global map to track active initializations (prevents duplicate connections from StrictMode)
const activeConnections = new Map();

const VideoCall = ({
    roomId,
    userId,
    userType,
    accessToken,
    userData,
    peerData,
    backendUrl,
    onCallEnd,
    onError
}) => {
    // Ensure accessToken is set from localStorage if not provided
    const effectiveAccessToken = accessToken || localStorage.getItem('token') || localStorage.getItem('tToken') || localStorage.getItem('aToken') || "";

    // Refs
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionsRef = useRef(new Map()); // Map<socketId, RTCPeerConnection>
    const candidateQueueRef = useRef(new Map()); // Map<socketId, RTCIceCandidate[]>
    const socketRef = useRef(null);
    const localStreamRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const initializingRef = useRef(false);  // Prevent double initialization

    // State
    const [isConnected, setIsConnected] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [connectionState, setConnectionState] = useState('connecting');
    const [callDuration, setCallDuration] = useState(0);
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [peerStatus, setPeerStatus] = useState('waiting');
    const [error, setError] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    // WebRTC Configuration with STUN/TURN servers
    const rtcConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
        ],
        iceCandidatePoolSize: 10
    };

    // Timer effect
    useEffect(() => {
        let timer;
        if (isCallActive) {
            timer = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isCallActive]);

    // Format duration
    const formatDuration = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Initialize media stream
    const initializeMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (err) {
            console.error('Error accessing media devices:', err);
            setError('Could not access camera/microphone. Please check permissions.');
            onError?.('Media access denied');
            throw err;
        }
    }, [onError]);

    // Create peer connection
    const createPeerConnection = useCallback((targetSocketId) => {
        const pc = new RTCPeerConnection(rtcConfig);

        // Add local tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('ice-candidate', {
                    candidate: event.candidate,
                    targetSocketId
                });
            }
        };

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
            console.log('Connection state for', targetSocketId, ':', pc.connectionState);
            setConnectionState(pc.connectionState);

            if (pc.connectionState === 'connected') {
                setIsCallActive(true);
                setPeerStatus('connected');
            } else if (pc.connectionState === 'disconnected') {
                setPeerStatus('disconnected');
                attemptReconnection();
            } else if (pc.connectionState === 'failed') {
                setPeerStatus('failed');
                setError('Connection failed. Please try rejoining.');
            }
        };

        // Handle ICE connection state
        pc.oniceconnectionstatechange = () => {
            console.log('ICE connection state for', targetSocketId, ':', pc.iceConnectionState);
            if (pc.iceConnectionState === 'disconnected') {
                attemptReconnection();
            }
        };

        // Handle remote stream
        pc.ontrack = (event) => {
            console.log('Received remote track from', targetSocketId, ':', event.track.kind);
            let stream = event.streams[0];
            if (!stream) {
                // Fallback for browsers that don't provide streams in event
                stream = new MediaStream([event.track]);
            }

            setRemoteStream(stream);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }
        };

        // Store in map
        peerConnectionsRef.current.set(targetSocketId, pc);
        // Ensure there's an array for queued candidates
        if (!candidateQueueRef.current.has(targetSocketId)) {
            candidateQueueRef.current.set(targetSocketId, []);
        }

        return pc;
    }, []);

    // Attempt reconnection
    const attemptReconnection = useCallback(() => {
        if (reconnectTimeoutRef.current) return;

        reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            if (socketRef.current && roomId) {
                socketRef.current.emit('reconnect-attempt', {
                    roomId,
                    userId,
                    accessToken
                });
            }
            reconnectTimeoutRef.current = null;
        }, 3000);
    }, [roomId, userId, accessToken]);

    // Create offer for peer - defined as ref to avoid closure issues
    const createOfferForPeerRef = useRef(null);

    // Effect to ensure remote video element has the right source and is playing
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            if (remoteVideoRef.current.srcObject !== remoteStream) {
                console.log('Attaching remote stream to video element');
                remoteVideoRef.current.srcObject = remoteStream;
            }
            // Explicitly call play to handle potential autoplay blockers
            remoteVideoRef.current.play().catch(err => {
                console.warn('Auto-play failed for remote video, may need user interaction:', err);
            });
        }
    }, [remoteStream]);

    // Initialize socket and WebRTC
    useEffect(() => {
        // Define createOfferForPeer inside useEffect to access latest refs
        const createOfferForPeer = async (targetSocketId) => {
            try {
                let pc = peerConnectionsRef.current.get(targetSocketId);
                if (!pc) pc = createPeerConnection(targetSocketId);

                // Double check tracks are added
                if (localStreamRef.current) {
                    const senders = pc.getSenders();
                    localStreamRef.current.getTracks().forEach(track => {
                        if (!senders.find(s => s.track === track)) {
                            pc.addTrack(track, localStreamRef.current);
                        }
                    });
                }

                const offer = await pc.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true
                });
                await pc.setLocalDescription(offer);

                socketRef.current?.emit('offer', {
                    offer,
                    targetSocketId
                });
            } catch (err) {
                console.error('Error creating offer:', err);
            }
        };

        // Store in ref for external access
        createOfferForPeerRef.current = createOfferForPeer;

        const init = async () => {
            // Prevent double initialization from StrictMode using global map
            const connectionKey = `${roomId}-${userId}`;
            if (activeConnections.has(connectionKey)) {
                console.log('Already initializing with key:', connectionKey, ', skipping duplicate...');
                return;
            }
            activeConnections.set(connectionKey, true);
            initializingRef.current = true;

            try {
                // Initialize media first
                const stream = await initializeMedia();
                if (!initializingRef.current) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }

                // Connect to socket
                const socket = io(backendUrl, {
                    transports: ['websocket', 'polling'],
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000
                });

                socketRef.current = socket;

                socket.on('connect', () => {
                    console.log('Socket connected:', socket.id);
                    setIsConnected(true);

                    // Join room
                    if (initializingRef.current) {
                        socket.emit('join-room', {
                            roomId,
                            userId,
                            userType,
                            accessToken: effectiveAccessToken
                        });
                    } else {
                        socket.disconnect();
                    }
                });

                socket.on('disconnect', () => {
                    console.log('Socket disconnected');
                    setIsConnected(false);
                    setConnectionState('disconnected');
                });

                socket.on('error', ({ message }) => {
                    console.error('Socket error:', message);
                    setError(message);
                    onError?.(message);
                });

                // Handle existing users in room - DON'T create offer here
                // Wait for existing users to send us an offer instead
                socket.on('room-users', ({ users }) => {
                    console.log('Existing users in room:', users);
                    if (users.length > 0) {
                        setPeerStatus('waiting-for-offer');
                        // Don't create offer - existing users will send us offers
                    }
                });

                // Handle new user joining - ONLY existing users create offers
                socket.on('user-joined', async ({ socketId, userType: joinedUserType }) => {
                    console.log('New user joined, I will create offer for:', socketId, joinedUserType);
                    setPeerStatus('creating-offer');
                    // I was here first, so I create the offer
                    createOfferForPeer(socketId);
                });

                // ================= PERFECT NEGOTIATION PATTERN =================
                let isSettingRemoteAnswerPending = false;

                socket.on('offer', async ({ offer, senderSocketId }) => {
                    try {
                        let pc = peerConnectionsRef.current.get(senderSocketId);
                        if (!pc) pc = createPeerConnection(senderSocketId);

                        const isPolite = socket.id.localeCompare(senderSocketId) < 0;
                        const offerCollision = pc.signalingState !== "stable" || isSettingRemoteAnswerPending;

                        if (offerCollision) {
                            if (!isPolite) return; // Impolite peer ignores offer collision
                            await pc.setLocalDescription({ type: 'rollback' });
                        }

                        await pc.setRemoteDescription(new RTCSessionDescription(offer));
                        await pc.setLocalDescription();

                        socket.emit('answer', {
                            answer: pc.localDescription,
                            targetSocketId: senderSocketId
                        });

                        // Drain queued ICE candidates
                        const queued = candidateQueueRef.current.get(senderSocketId) || [];
                        for (const qc of queued) {
                            try {
                                await pc.addIceCandidate(new RTCIceCandidate(qc));
                            } catch (e) { }
                        }
                        candidateQueueRef.current.set(senderSocketId, []);

                    } catch (err) {
                        console.error('Error handling offer:', err);
                    }
                });

                // Handle incoming answer
                socket.on('answer', async ({ answer, senderSocketId }) => {
                    try {
                        const pc = peerConnectionsRef.current.get(senderSocketId);
                        if (!pc) return;

                        isSettingRemoteAnswerPending = true;
                        await pc.setRemoteDescription(new RTCSessionDescription(answer));
                        isSettingRemoteAnswerPending = false;

                        const queued = candidateQueueRef.current.get(senderSocketId) || [];
                        for (const qc of queued) {
                            try {
                                await pc.addIceCandidate(new RTCIceCandidate(qc));
                            } catch (e) { }
                        }
                        candidateQueueRef.current.set(senderSocketId, []);
                    } catch (err) {
                        console.error('Error handling answer:', err);
                    } finally {
                        isSettingRemoteAnswerPending = false;
                    }
                });

                // Handle ICE candidates
                socket.on('ice-candidate', async ({ candidate, senderSocketId }) => {
                    try {
                        if (!candidate) return;
                        const pc = peerConnectionsRef.current.get(senderSocketId);
                        // If we have a pc and its remoteDescription is set, add immediately
                        if (pc && pc.remoteDescription && pc.remoteDescription.type) {
                            await pc.addIceCandidate(new RTCIceCandidate(candidate));
                        } else {
                            // Queue candidate until remote description is applied
                            const q = candidateQueueRef.current.get(senderSocketId) || [];
                            q.push(candidate);
                            candidateQueueRef.current.set(senderSocketId, q);
                        }
                    } catch (err) {
                        console.error('Error adding ICE candidate:', err);
                    }
                });

                // Handle call started
                socket.on('call-started', ({ callStartedAt }) => {
                    console.log('Call started at:', callStartedAt);
                    setIsCallActive(true);
                });

                // Handle call ended
                socket.on('call-ended', ({ callDuration, endedBy }) => {
                    console.log('Call ended by:', endedBy, 'Duration:', callDuration);
                    handleCallEnd(callDuration);
                });

                // Handle user left
                socket.on('user-left', ({ odId, userType: leftUserType }) => {
                    console.log('User left:', odId, leftUserType);
                    setPeerStatus('left');
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = null;
                    }
                });

                // Handle peer audio toggle
                socket.on('peer-audio-toggle', ({ isMuted: peerMuted }) => {
                    console.log('Peer audio:', peerMuted ? 'muted' : 'unmuted');
                });

                // Handle peer video toggle
                socket.on('peer-video-toggle', ({ isVideoOff: peerVideoOff }) => {
                    console.log('Peer video:', peerVideoOff ? 'off' : 'on');
                });

                // Handle chat messages from others
                socket.on('chat-message', (msg) => {
                    setMessages(prev => [...prev, msg]);
                });

                // Handle own message sent confirmation - REMOVED (Optimistic UI used instead)
                // socket.on('chat-message-sent', (msg) => {
                //     setMessages(prev => [...prev, { ...msg, isSelf: true }]);
                // });

                // Handle reconnection success
                socket.on('reconnect-success', () => {
                    console.log('Reconnection successful');
                    setConnectionState('connected');
                });

                // Handle peer reconnection
                socket.on('peer-reconnected', ({ socketId }) => {
                    console.log('Peer reconnected:', socketId);
                    setPeerStatus('reconnected');
                    // Recreate offer for reconnected peer
                    createOfferForPeer(socketId);
                });

            } catch (err) {
                console.error('Initialization error:', err);
            }
        };

        init();

        // Cleanup
        return () => {
            console.log('Cleanup running...');
            const connectionKey = `${roomId}-${userId}`;
            activeConnections.delete(connectionKey);
            initializingRef.current = false;

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
                localStreamRef.current = null;
            }

            // Close all peer connections
            if (peerConnectionsRef.current && peerConnectionsRef.current.size > 0) {
                for (const [id, pc] of peerConnectionsRef.current.entries()) {
                    try { pc.close(); } catch (e) { /* ignore */ }
                }
                peerConnectionsRef.current.clear();
            }

            if (socketRef.current) {
                socketRef.current.emit('leave-room', { roomId });
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [roomId, userId, userType, accessToken, backendUrl, initializeMedia, createPeerConnection, onError]);

    // Toggle mute
    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
                socketRef.current?.emit('toggle-audio', { roomId, isMuted: !audioTrack.enabled });
            }
        }
    };

    // Toggle video
    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
                socketRef.current?.emit('toggle-video', { roomId, isVideoOff: !videoTrack.enabled });
            }
        }
    };

    // Toggle screen share
    const toggleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true
                });

                const videoTrack = screenStream.getVideoTracks()[0];
                // Replace video sender on all peer connections
                for (const pc of peerConnectionsRef.current.values()) {
                    const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                    if (sender) {
                        try { await sender.replaceTrack(videoTrack); } catch (e) { console.warn('replaceTrack failed for screen share', e); }
                    }
                }

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = screenStream;
                }

                videoTrack.onended = () => {
                    stopScreenShare();
                };

                setIsScreenSharing(true);
                socketRef.current?.emit('screen-share', { roomId, isSharing: true });
            } else {
                stopScreenShare();
            }
        } catch (err) {
            console.error('Error sharing screen:', err);
        }
    };

    // Stop screen share
    const stopScreenShare = async () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            // Replace back video sender on all peer connections
            for (const pc of peerConnectionsRef.current.values()) {
                const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                if (sender && videoTrack) {
                    try { await sender.replaceTrack(videoTrack); } catch (e) { console.warn('replaceTrack failed restoring camera', e); }
                }
            }

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStreamRef.current;
            }
        }
        setIsScreenSharing(false);
        socketRef.current?.emit('screen-share', { roomId, isSharing: false });
    };

    // End call
    const handleEndCall = () => {
        socketRef.current?.emit('end-call', { roomId });
        handleCallEnd(callDuration);
    };

    // Handle call end
    const handleCallEnd = (duration) => {
        setIsCallActive(false);

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }

        // Close all peer connections
        if (peerConnectionsRef.current && peerConnectionsRef.current.size > 0) {
            for (const pc of peerConnectionsRef.current.values()) {
                try { pc.close(); } catch (e) { /* ignore */ }
            }
            peerConnectionsRef.current.clear();
        }

        onCallEnd?.(duration);
    };

    // Send chat message
    const sendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && socketRef.current) {
            const msgData = {
                roomId,
                message: newMessage.trim(),
                senderId: userId,
                timestamp: Date.now(),
                isSelf: true
            };

            // Optimistic UI update
            setMessages(prev => [...prev, msgData]);

            socketRef.current.emit('chat-message', {
                roomId,
                message: newMessage.trim()
            });
            setNewMessage('');
        }
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Get connection status color
    const getStatusColor = () => {
        switch (connectionState) {
            case 'connected': return 'bg-green-500';
            case 'connecting': return 'bg-yellow-500';
            case 'disconnected': return 'bg-red-500';
            case 'failed': return 'bg-red-600';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-800">
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
                    <span className="text-white font-medium">
                        {peerData?.name || 'Connecting...'}
                    </span>
                    <span className="text-gray-400 text-sm">
                        {connectionState === 'connected' ? 'Connected' : connectionState}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-white font-mono text-lg">
                        {formatDuration(callDuration)}
                    </span>
                    <button
                        onClick={toggleFullscreen}
                        className="text-gray-300 hover:text-white transition"
                    >
                        {isFullscreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
                    </button>
                </div>
            </div>

            {/* Video Container */}
            <div className="flex-1 relative overflow-hidden">
                {/* Remote Video (Main) */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />

                {/* Peer Status Overlay */}
                {peerStatus !== 'connected' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                        <div className="text-center text-white">
                            <div className="w-24 h-24 rounded-full bg-gray-700 mx-auto mb-4 flex items-center justify-center">
                                <span className="text-3xl">
                                    {peerData?.name?.charAt(0).toUpperCase() || '?'}
                                </span>
                            </div>
                            <p className="text-lg">{peerData?.name || 'Participant'}</p>
                            <p className="text-sm text-gray-400 mt-2">
                                {peerStatus === 'waiting' && 'Waiting for participant to join...'}
                                {peerStatus === 'joined' && 'Connecting...'}
                                {peerStatus === 'disconnected' && 'Participant disconnected'}
                                {peerStatus === 'left' && 'Participant left the call'}
                                {peerStatus === 'failed' && 'Connection failed'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Local Video (Picture-in-Picture) */}
                <div className="absolute bottom-24 right-6 w-48 h-36 rounded-xl overflow-hidden shadow-lg border-2 border-gray-700">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                    {isVideoOff && (
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                            <FaVideoSlash className="text-gray-500 text-2xl" />
                        </div>
                    )}
                </div>

                {/* Chat Panel */}
                {showChat && (
                    <div className="absolute right-6 top-6 bottom-24 w-80 bg-gray-800 rounded-xl shadow-lg flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <h3 className="text-white font-medium">Chat</h3>
                            <button
                                onClick={() => setShowChat(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`p-3 rounded-lg ${msg.senderId === userId
                                        ? 'bg-blue-600 ml-auto'
                                        : 'bg-gray-700'
                                        } max-w-[80%]`}
                                >
                                    <p className="text-white text-sm">{msg.message}</p>
                                    <span className="text-xs text-gray-300 mt-1 block">
                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 py-6 bg-gray-800">
                <button
                    onClick={toggleMute}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition ${isMuted
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? <FaMicrophoneSlash className="text-white text-xl" /> : <FaMicrophone className="text-white text-xl" />}
                </button>

                <button
                    onClick={toggleVideo}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition ${isVideoOff
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                    title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                >
                    {isVideoOff ? <FaVideoSlash className="text-white text-xl" /> : <FaVideo className="text-white text-xl" />}
                </button>

                <button
                    onClick={toggleScreenShare}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition ${isScreenSharing
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                    title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                >
                    <FaDesktop className="text-white text-xl" />
                </button>

                <button
                    onClick={() => setShowChat(!showChat)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition ${showChat
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                    title="Chat"
                >
                    <FaComments className="text-white text-xl" />
                </button>

                <button
                    onClick={handleEndCall}
                    className="w-16 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition"
                    title="End call"
                >
                    <FaPhoneSlash className="text-white text-xl" />
                </button>
            </div>

            {/* Error Toast */}
            {error && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
                    {error}
                    <button
                        onClick={() => setError(null)}
                        className="ml-4 text-white hover:text-gray-200"
                    >
                        <FaTimes />
                    </button>
                </div>
            )}
        </div>
    );
};

export default VideoCall;
