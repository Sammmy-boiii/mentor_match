import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import VideoCall from '../Components/VideoCall';

const VideoRoom = () => {
    const { sessionId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { token, backendUrl, userData, loadUserProfileData } = useContext(AppContext);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [roomData, setRoomData] = useState(null);
    const [showPreCall, setShowPreCall] = useState(true);
    const [mediaPermissions, setMediaPermissions] = useState({ audio: false, video: false });

    // Get room ID from URL or generate new one
    const roomIdFromUrl = searchParams.get('roomId');
    
    // Ref to prevent double initialization from StrictMode
    const initializingRef = React.useRef(false);

    // Check media permissions
    const checkMediaPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            stream.getTracks().forEach(track => track.stop());
            setMediaPermissions({ audio: true, video: true });
            return true;
        } catch (err) {
            console.error('Media permission error:', err);
            if (err.name === 'NotAllowedError') {
                setError('Camera and microphone permissions are required for video calls.');
            } else if (err.name === 'NotFoundError') {
                setError('No camera or microphone found. Please connect a device.');
            } else {
                setError('Could not access camera/microphone: ' + err.message);
            }
            return false;
        }
    };

    // Generate or fetch room
    useEffect(() => {
        const initRoom = async () => {
            // Prevent double initialization from StrictMode
            if (initializingRef.current) {
                console.log('Already initializing room, skipping...');
                return;
            }
            initializingRef.current = true;
            
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                
                // Check media permissions first
                const hasPermissions = await checkMediaPermissions();
                if (!hasPermissions) {
                    setLoading(false);
                    return;
                }

                // Generate room ID
                const { data: roomResponse } = await axios.post(
                    `${backendUrl}/api/video-call/generate-room`,
                    { sessionId },
                    { headers: { token } }
                );

                if (!roomResponse.success) {
                    setError(roomResponse.message);
                    setLoading(false);
                    return;
                }

                // Join room
                const { data: joinResponse } = await axios.post(
                    `${backendUrl}/api/video-call/join`,
                    { roomId: roomResponse.roomId },
                    { headers: { token } }
                );

                if (!joinResponse.success) {
                    setError(joinResponse.message);
                    setLoading(false);
                    return;
                }

                setRoomData({
                    roomId: roomResponse.roomId,
                    sessionId: roomResponse.sessionId,
                    accessToken: joinResponse.accessToken,
                    userData: joinResponse.userData,
                    peerData: joinResponse.peerData,
                    userId: joinResponse.participantId  // Use the actual user ID from backend
                });

                setLoading(false);

            } catch (err) {
                console.error('Room initialization error:', err);
                setError(err.response?.data?.message || 'Failed to join video room');
                setLoading(false);
            }
        };

        initRoom();
    }, [sessionId, token, backendUrl, navigate, userData]);

    // Handle call end
    const handleCallEnd = async (duration) => {
        toast.success(`Call ended. Duration: ${Math.floor(duration / 60)} minutes ${duration % 60} seconds`);
        navigate('/my-sessions');
    };

    // Handle error
    const handleError = (errorMsg) => {
        toast.error(errorMsg);
    };

    // Start call
    const startCall = () => {
        setShowPreCall(false);
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-white text-lg">Preparing your video room...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center max-w-md mx-auto px-6">
                    <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-white text-2xl font-bold mb-4">Unable to Join</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/my-sessions')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Back to Sessions
                    </button>
                </div>
            </div>
        );
    }

    // Pre-call screen
    if (showPreCall && roomData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 px-6">
                <div className="max-w-lg w-full bg-gray-800 rounded-2xl p-8">
                    <h2 className="text-white text-2xl font-bold text-center mb-6">
                        Ready to Join?
                    </h2>
                    
                    <div className="bg-gray-700 rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-4 mb-4">
                            <img
                                src={roomData.peerData?.image || 'https://via.placeholder.com/60'}
                                alt={roomData.peerData?.name}
                                className="w-16 h-16 rounded-full object-cover"
                            />
                            <div>
                                <h3 className="text-white font-semibold text-lg">
                                    {roomData.peerData?.name}
                                </h3>
                                <p className="text-gray-400">
                                    {roomData.peerData?.subject || roomData.peerData?.qualification}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${mediaPermissions.audio ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-gray-300">Microphone {mediaPermissions.audio ? 'ready' : 'not available'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${mediaPermissions.video ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-gray-300">Camera {mediaPermissions.video ? 'ready' : 'not available'}</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/my-sessions')}
                            className="flex-1 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={startCall}
                            disabled={!mediaPermissions.audio || !mediaPermissions.video}
                            className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Join Call
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Video call
    if (roomData) {
        return (
            <VideoCall
                roomId={roomData.roomId}
                userId={roomData.userId}
                userType="user"
                accessToken={roomData.accessToken}
                userData={roomData.userData}
                peerData={roomData.peerData}
                backendUrl={backendUrl}
                onCallEnd={handleCallEnd}
                onError={handleError}
            />
        );
    }

    return null;
};

export default VideoRoom;
