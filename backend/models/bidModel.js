import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'question',
        required: true
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tutor',
        required: true
    },
    proposedPrice: {
        type: Number,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const bidModel = mongoose.models.bid || mongoose.model('bid', bidSchema);

export default bidModel;
