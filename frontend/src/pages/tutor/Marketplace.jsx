import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { TutorContext } from '../../context/TutorContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const Marketplace = () => {
    const { backendUrl, currency } = useContext(AppContext);
    const { tToken, profileData, getProfileData } = useContext(TutorContext);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [bidPrice, setBidPrice] = useState('');
    const [bidMessage, setBidMessage] = useState('');
    const [socket, setSocket] = useState(null);

    // Initial setup
    useEffect(() => {
        if (tToken && !profileData) {
            getProfileData();
        }
    }, [tToken, profileData]);

    // Socket Setup
    useEffect(() => {
        if (!tToken || !profileData || !profileData.subject) return;

        const newSocket = io(backendUrl);
        setSocket(newSocket);

        const subjectRoom = profileData.subject.toLowerCase().replace(/\s+/g, '-');
        newSocket.emit('join-subject-room', profileData.subject);

        newSocket.on('notify-new-question', (data) => {
            toast.info(`🔔 ${data.message}`, {
                onClick: () => fetchQuestions(),
                autoClose: 10000
            });
            fetchQuestions();
        });

        return () => newSocket.close();
    }, [tToken, profileData, backendUrl]);

    const fetchQuestions = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/marketplace/open-questions');
            if (data.success) {
                setQuestions(data.questions);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const submitBid = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(backendUrl + '/api/marketplace/submit-bid',
                {
                    questionId: selectedQuestion._id,
                    proposedPrice: Number(bidPrice),
                    message: bidMessage
                },
                { headers: { tToken } }
            );

            if (data.success) {
                toast.success(data.message);
                setSelectedQuestion(null);
                setBidPrice('');
                setBidMessage('');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="p-8 bg-[#f8fafc] min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mentor Marketplace</h2>
                        <p className="text-slate-500 mt-1">Real-time matching for your expertise: <span className="text-blue-600 font-semibold">{profileData?.subject}</span></p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-medium text-slate-600">Live Updates Active</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-500 font-medium tracking-wide">Scanning Marketplace...</p>
                    </div>
                ) : questions.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100 italic text-slate-400">
                        No open questions match your expertise right now. We'll notify you when new ones arrive!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {questions.map((q) => (
                            <div key={q._id} className="group bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden">
                                {q.subject === profileData?.subject && (
                                    <div className="absolute -right-12 -top-12 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50"></div>
                                )}
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">{q.subject}</span>
                                        <span className="text-slate-400 text-[10px] font-medium">{new Date(q.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">{q.description.substring(0, 60)}...</h3>
                                    <p className="text-slate-500 mt-4 text-sm leading-relaxed line-clamp-3">{q.description}</p>
                                    <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Student Budget</p>
                                        <p className="text-2xl font-black text-slate-900">{currency} {q.budget}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedQuestion(q)}
                                    className="mt-8 bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 hover:shadow-blue-200"
                                >
                                    Submit Proposal
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bid Modal (Glassmorphism) */}
            {selectedQuestion && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-[100] animate-fadeIn">
                    <div className="bg-white p-10 rounded-[2.5rem] max-w-lg w-full relative shadow-2xl border border-white/20">
                        <button onClick={() => setSelectedQuestion(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <div className="mb-8">
                            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">Submit Proposal</span>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">Help with {selectedQuestion.subject}</h3>
                        </div>

                        <form onSubmit={submitBid} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Your Proposed Price ({currency})</label>
                                <input
                                    type="number"
                                    required
                                    value={bidPrice}
                                    onChange={(e) => setBidPrice(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    placeholder="e.g. 1200"
                                />
                                <p className="text-[10px] text-slate-400 ml-1 italic">Student's Budget: {currency} {selectedQuestion.budget}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Expertise Pitch</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={bidMessage}
                                    onChange={(e) => setBidMessage(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none text-sm leading-relaxed"
                                    placeholder="Tell the student why you are the best fit for this problem..."
                                ></textarea>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]">
                                Send Proposal Now
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marketplace;
