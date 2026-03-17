import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'bidded', 'accepted', 'closed'],
        default: 'open'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const questionModel = mongoose.models.question || mongoose.model('question', questionSchema);

export default questionModel;
