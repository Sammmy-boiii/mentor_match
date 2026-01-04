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
    // Refs
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
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
            console.log('Connection state:', pc.connectionState);
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
            console.log('ICE connection state:', pc.iceConnectionState);
            if (pc.iceConnectionState === 'disconnected') {
                attemptReconnection();
            }
        };

        // Handle remote stream
        pc.ontrack = (event) => {
            console.log('Received remote track');
            if (remoteVideoRef.current && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        peerConnectionRef.current = pc;
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

    // Initialize socket and WebRTC
    useEffect(() => {
        // Define createOfferForPeer inside useEffect to access latest refs
        const createOfferForPeer = async (targetSocketId) => {
            try {
                const pc = createPeerConnection(targetSocketId);
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
                await initializeMedia();

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
                    socket.emit('join-room', {
                        roomId,
                        userId,
                        userType,
                        accessToken
                    });
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

                // Handle incoming offer
                socket.on('offer', async ({ offer, senderSocketId }) => {
                    console.log('Received offer from:', senderSocketId);
                    setPeerStatus('answering');
                    try {
                        // Close any existing peer connection before creating new one
                        if (peerConnectionRef.current) {
                            peerConnectionRef.current.close();
                        }
                        
                        const pc = createPeerConnection(senderSocketId);
                        await pc.setRemoteDescription(new RTCSessionDescription(offer));
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);
                        
                        socket.emit('answer', {
                            answer,
                            targetSocketId: senderSocketId
                        });
                        console.log('Sent answer to:', senderSocketId);
                    } catch (err) {
                        console.error('Error handling offer:', err);
                    }
                });

                // Handle incoming answer
                socket.on('answer', async ({ answer }) => {
                    console.log('Received answer');
                    try {
                        if (peerConnectionRef.current) {
                            await peerConnectionRef.current.setRemoteDescription(
                                new RTCSessionDescription(answer)
                            );
                        }
                    } catch (err) {
                        console.error('Error handling answer:', err);
                    }
                });

                // Handle ICE candidates
                socket.on('ice-candidate', async ({ candidate }) => {
                    try {
                        if (peerConnectionRef.current && candidate) {
                            await peerConnectionRef.current.addIceCandidate(
                                new RTCIceCandidate(candidate)
                            );
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

                // Handle own message sent confirmation
                socket.on('chat-message-sent', (msg) => {
                    setMessages(prev => [...prev, { ...msg, isSelf: true }]);
                });

                // Handle reconnection success
                socket.on('reconnect-success', () => {
                    console.log('Reconnection successful');
                    setConnectionState('connected');
                });

                // Handle peer reconnection
                socket.on('peer-reconnected', ({ socketId }) => {
                    console.log('Peer reconnected:', socketId);
                    setPeerStatus('reconnected');
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
            
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
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
                const sender = peerConnectionRef.current?.getSenders()
                    .find(s => s.track?.kind === 'video');
                
                if (sender) {
                    await sender.replaceTrack(videoTrack);
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
            const sender = peerConnectionRef.current?.getSenders()
                .find(s => s.track?.kind === 'video');
            
            if (sender && videoTrack) {
                await sender.replaceTrack(videoTrack);
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
        handleCallEndInternal(callDuration);
    };

    // Handle call end internal
    const handleCallEndInternal = (duration) => {
        setIsCallActive(false);
        
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }
        
        onCallEnd?.(duration);
    };

    // Send chat message
    const sendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && socketRef.current) {
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
                            <p className="text-lg">{peerData?.name || 'Student'}</p>
                            <p className="text-sm text-gray-400 mt-2">
                                {peerStatus === 'waiting' && 'Waiting for student to join...'}
                                {peerStatus === 'joined' && 'Connecting...'}
                                {peerStatus === 'disconnected' && 'Student disconnected'}
                                {peerStatus === 'left' && 'Student left the call'}
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
                                    className={`p-3 rounded-lg ${
                                        msg.senderId === userId
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
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                        isMuted 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? <FaMicrophoneSlash className="text-white text-xl" /> : <FaMicrophone className="text-white text-xl" />}
                </button>

                <button
                    onClick={toggleVideo}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                        isVideoOff 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                    title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                >
                    {isVideoOff ? <FaVideoSlash className="text-white text-xl" /> : <FaVideo className="text-white text-xl" />}
                </button>

                <button
                    onClick={toggleScreenShare}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                        isScreenSharing 
                            ? 'bg-blue-500 hover:bg-blue-600' 
                            : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                    title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                >
                    <FaDesktop className="text-white text-xl" />
                </button>

                <button
                    onClick={() => setShowChat(!showChat)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                        showChat 
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
                    title="End session"
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
