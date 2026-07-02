import questionModel from "../models/questionModel.js";
import bidModel from "../models/bidModel.js";
import tutorModel from "../models/tutorModel.js";
import userModel from "../models/userModel.js";
import sessionModel from "../models/sessionModel.js";

// Helper for TF-IDF based Cosine Similarity
const getTokens = (text) => text.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(t => t.length > 2);

const calculateCosineSimilarity = (text1, text2) => {
    const tokens1 = getTokens(text1);
    const tokens2 = getTokens(text2);
    const allTokens = Array.from(new Set([...tokens1, ...tokens2]));

    const vec1 = allTokens.map(t => tokens1.filter(v => v === t).length);
    const vec2 = allTokens.map(t => tokens2.filter(v => v === t).length);

    const dotProduct = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
    const mag1 = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
    const mag2 = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));

    if (mag1 === 0 || mag2 === 0) return 0;
    return dotProduct / (mag1 * mag2);
};

// 1. Post Question
const postQuestion = async (req, res) => {
    try {
        const userId = req.userId;
        const { subject, description, budget } = req.body;
        const newQuestion = new questionModel({ userId, subject, description, budget });
        await newQuestion.save();

        // Notification logic
        const io = req.app.get('socketio');
        if (io) {
            const student = await userModel.findById(userId);
            const roomName = `subject:${subject.toLowerCase().replace(/\s+/g, '-')}`;
            io.to(roomName).emit('notify-new-question', {
                subject,
                questionId: newQuestion._id,
                studentName: student?.name || "A Student",
                message: `New question in ${subject} from ${student?.name || "A Student"}`
            });
        }

        res.json({ success: true, message: "Question posted successfully", question: newQuestion });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 2. Submit Bid
const submitBid = async (req, res) => {
    try {
        const mentorId = req.tutId;
        const { questionId, proposedPrice, message } = req.body;

        // Check if question exists and is open
        const question = await questionModel.findById(questionId);
        if (!question || question.status === 'closed') {
            return res.json({ success: false, message: "Question is not available for bidding" });
        }

        const newBid = new bidModel({ questionId, mentorId, proposedPrice, message });
        await newBid.save();

        // Update question status to bidded if it was open
        if (question.status === 'open') {
            question.status = 'bidded';
            await question.save();
        }

        // Notification logic
        const io = req.app.get('socketio');
        if (io) {
            const mentor = await tutorModel.findById(mentorId);
            io.emit('notify-new-bid', {
                studentId: question.userId,
                questionId: question._id,
                mentorName: mentor?.name || "A Mentor",
                price: proposedPrice,
                message: `${mentor?.name || "A Mentor"} has bidded ${proposedPrice} on your question.`
            });
        }

        res.json({ success: true, message: "Bid submitted successfully", bid: newBid });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 3. Get Ranked Bids for a Question
const getRankedBids = async (req, res) => {
    try {
        const { questionId } = req.params;
        const question = await questionModel.findById(questionId);
        const bids = await bidModel.find({ questionId }).populate('mentorId');

        const globalAvgResult = await tutorModel.aggregate([
            { $match: { ratingCount: { $gt: 0 } } },
            { $group: { _id: null, avgRating: { $avg: "$avgRating" } } }
        ]);
        const globalAvg = globalAvgResult[0]?.avgRating || 0;

        const calculateWeightedRating = (tutorAvg, tutorCount, globalAvg, minVotes = 5) => {
            const v = Number(tutorCount || 0);
            const R = Number(tutorAvg || 0);
            const m = Number(minVotes);
            const C = Number(globalAvg || 0);

            if (v === 0) return C;
            return ((v / (v + m)) * R) + ((m / (v + m)) * C);
        };

        const rankedBids = bids.map(bid => {
            const mentor = bid.mentorId;
            const rating = Number(mentor.avgRating || 0);
            const experience = parseInt(mentor.experience) || 1;

            // Response Time (Mocked for now)
            const responseTime = 0.8;

            // Price Match Algorithm
            const priceMatch = question.budget > 0 ? 1 - (Math.abs(bid.proposedPrice - question.budget) / question.budget) : 1;

            const weightedRating = calculateWeightedRating(rating, mentor.ratingCount, globalAvg, 5);
            const score = (0.4 * (weightedRating / 5)) + (0.2 * (experience / 10)) + (0.2 * responseTime) + (0.2 * priceMatch);

            return { ...bid._doc, rankScore: score, weightedRating };
        });

        rankedBids.sort((a, b) => b.rankScore - a.rankScore);

        res.json({ success: true, rankedBids, questionStatus: question.status });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 4. Subject Matching API
const getMatchingMentors = async (req, res) => {
    try {
        const { description } = req.body;
        const mentors = await tutorModel.find({ available: true });

        const matches = mentors.map(mentor => {
            const similarity = calculateCosineSimilarity(description, mentor.about + " " + mentor.subject);
            return { mentor, similarity };
        });

        matches.sort((a, b) => b.similarity - a.similarity);

        res.json({ success: true, matches: matches.slice(0, 5) });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 5. Dynamic Pricing Suggestion
const getPriceSuggestion = async (req, res) => {
    try {
        const { subject } = req.body;
        const questions = await questionModel.find({ subject, status: 'open' });
        const tutors = await tutorModel.find({ subject, available: true });

        const avgPrice = 500;
        const demandFactor = (questions.length + 1) / (tutors.length + 1);
        const urgencyFactor = 1.1;

        const suggestedPrice = avgPrice * demandFactor * urgencyFactor;

        res.json({ success: true, suggestedPrice: Math.round(suggestedPrice) });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 6. Get My Questions (for students)
const getMyQuestions = async (req, res) => {
    try {
        const userId = req.userId;
        const questions = await questionModel.find({ userId }).sort({ createdAt: -1 });
        res.json({ success: true, questions });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 7. Get Marketplace Questions (for mentors)
const getMarketplaceQuestions = async (req, res) => {
    try {
        const questions = await questionModel.find({ status: { $in: ['open', 'bidded'] } }).sort({ createdAt: -1 });
        res.json({ success: true, questions });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 8. Get Top Rated Tutors
const getTopRatedTutors = async (req, res) => {
    try {
        const globalAvgResult = await tutorModel.aggregate([
            { $match: { ratingCount: { $gt: 0 } } },
            { $group: { _id: null, avgRating: { $avg: "$avgRating" } } }
        ]);
        const globalAvg = globalAvgResult[0]?.avgRating || 0;

        const tutors = await tutorModel.find({ available: true }).lean();
        const calculateWeightedRating = (tutorAvg, tutorCount, globalAvg, minVotes = 5) => {
            const v = Number(tutorCount || 0);
            const R = Number(tutorAvg || 0);
            const m = Number(minVotes);
            const C = Number(globalAvg || 0);
            if (v === 0) return C;
            return ((v / (v + m)) * R) + ((m / (v + m)) * C);
        };

        const tutorsWithWeight = tutors.map(tutor => ({
            ...tutor,
            weightedRating: calculateWeightedRating(tutor.avgRating, tutor.ratingCount, globalAvg, 5)
        }));

        tutorsWithWeight.sort((a, b) => b.weightedRating - a.weightedRating);

        res.json({ success: true, tutors: tutorsWithWeight });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 9. Accept Bid
const acceptBid = async (req, res) => {
    try {
        const userId = req.userId;
        const { bidId } = req.body;
        const bid = await bidModel.findById(bidId).populate('questionId').populate('mentorId');

        if (!bid) {
            return res.json({ success: false, message: "Bid not found" });
        }

        // Verify that the user accepting the bid is the one who posted the question
        if (bid.questionId.userId.toString() !== userId) {
            return res.json({ success: false, message: "Unauthorized: You did not post this question" });
        }

        // 1. Update Bid Status
        bid.status = 'accepted';
        await bid.save();

        // 2. Update Question Status
        const question = await questionModel.findById(bid.questionId._id);
        question.status = 'accepted';
        await question.save();

        // 3. Create a Session
        const student = await userModel.findById(question.userId).select("-password").lean();
        const mentor = await tutorModel.findById(bid.mentorId._id).select("-password").lean();

        const now = new Date();
        const slotDate = new Date();
        slotDate.setHours(slotDate.getHours() + 1);

        const newSession = new sessionModel({
            userId: question.userId,
            tutId: mentor._id,
            slotDate: slotDate,
            slotTime: slotDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            userData: student,
            tutData: mentor,
            amount: bid.proposedPrice,
            date: now,
            payment: false,
            isCompleted: false
        });
        await newSession.save();

        res.json({ success: true, message: "Bid accepted and session created!", session: newSession });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export {
    postQuestion,
    submitBid,
    getRankedBids,
    getMatchingMentors,
    getPriceSuggestion,
    getMyQuestions,
    getMarketplaceQuestions,
    getTopRatedTutors,
    acceptBid
};
