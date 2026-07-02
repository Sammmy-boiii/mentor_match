import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const MyQuestionBids = () => {
    const { backendUrl, token, userData, currency, navigate } = useContext(AppContext);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [questionStatus, setQuestionStatus] = useState("open");

    // Socket Setup
    useEffect(() => {
        if (!token || !userData?._id) return;

        const newSocket = io(backendUrl);
        setSocket(newSocket);

        newSocket.on('notify-new-bid', (data) => {
            if (data.studentId === userData._id) {
                toast.success(`🎉 ${data.message}`);
                fetchBids();
            }
        });

        return () => newSocket.close();
    }, [token, userData?._id, backendUrl]);

    const fetchBids = async () => {
        // Since we don't have a specific "get my questions" API yet in the simplified version,
        // we might need to adjust or implement one. For now, let's assume we fetch all bids for the user's latest question.
        // In a real app, you'd select the question first.
        try {
            const { data: questionsData } = await axios.get(backendUrl + '/api/marketplace/my-questions', { headers: { token } });
            if (questionsData.success && questionsData.questions.length > 0) {
                const qId = questionsData.questions[0]._id;
                const { data } = await axios.get(`${backendUrl}/api/marketplace/ranked-bids/${qId}`);
                if (data.success) {
                    setBids(data.rankedBids);
                    setQuestionStatus(data.questionStatus || 'open');
                }
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (token) fetchBids();
    }, [token]);

    const acceptBid = async (bidId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/marketplace/accept-bid', { bidId }, { headers: { token } });
            if (data.success) {
                toast.success("Proposal accepted! A tutoring session has been scheduled.");
                fetchBids();
                navigate('/my-sessions');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                <div className="mb-10 flex justify-between items-end">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Active Proposals</h2>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                ) : bids.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-16 text-center shadow-sm border border-slate-100">
                        <div className="text-5xl mb-4">⌛</div>
                        <p className="text-slate-400 font-bold tracking-wide uppercase text-xs">Waiting for Mentors</p>
                        <p className="text-slate-500 mt-2">No proposals have been submitted for your question yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bids.map((bid, index) => (
                            <div key={bid._id} className="group bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl border border-slate-100 flex flex-col md:flex-row justify-between items-center transition-all duration-500 relative overflow-hidden">
                                {index === 0 && (
                                    <div className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 uppercase tracking-widest rounded-br-2xl shadow-xl z-10">
                                        Best Match
                                    </div>
                                )}
                                <div className="flex items-center gap-8 z-10">
                                    <div className="relative">
                                        <img src={bid.mentorId.image} alt={bid.mentorId.name} className="w-24 h-24 rounded-3xl object-cover shadow-lg border-2 border-white ring-4 ring-slate-50" />
                                        <div className="absolute -bottom-2 -right-2 bg-white px-2 py-1 rounded-lg shadow-md border border-slate-100">
                                            <span className="text-[10px] font-black text-slate-800">
                                                ⭐ {bid.mentorId?.ratingCount > 0 ? bid.mentorId.avgRating.toFixed(1) : "No ratings yet"}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-2xl text-slate-900">{bid.mentorId.name}</h3>
                                        <p className="text-slate-500 text-sm mt-1 max-w-sm leading-relaxed italic">"{bid.message}"</p>
                                        <div className="flex items-center gap-3 mt-4">
                                            <div className="px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Experience: </span>
                                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{bid.mentorId.experience}</span>
                                            </div>
                                            <div className="px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
                                                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-tighter">Match Accuracy: </span>
                                                <span className="text-[10px] font-black text-blue-700 uppercase tracking-tighter">{Math.round(bid.rankScore * 100)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 md:mt-0 text-center md:text-right z-10">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">PROPOSED RATE</p>
                                    <p className="text-4xl font-black text-slate-900">{currency} {bid.proposedPrice}</p>
                                    
                                    {questionStatus !== 'accepted' ? (
                                        <button
                                            onClick={() => acceptBid(bid._id)}
                                            className="mt-6 bg-slate-900 text-white font-black px-10 py-4 rounded-2xl hover:bg-blue-600 hover:scale-105 transition-all shadow-xl shadow-slate-100 hover:shadow-blue-200 active:scale-100"
                                        >
                                            Accept Proposal
                                        </button>
                                    ) : (
                                        <div className="mt-6 text-emerald-600 font-bold px-10 py-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                            {bid.status === 'accepted' ? "Proposal Accepted ✓" : "Another proposal was accepted"}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-slate-50 rounded-full opacity-50 transition-all group-hover:scale-150"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyQuestionBids;
