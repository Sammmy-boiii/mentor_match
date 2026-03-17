import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    purchase_order_id: {
        type: String,
        required: true,
        unique: true
    },
    sessionId: {
        type: String,
        required: true
    },
    pidx: {
        type: String,
        default: null,
        sparse: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Completed', 'Pending', 'User canceled', 'Expired', 'Refunded', 'Failed'],
        default: 'Pending'
    },
    transaction_id: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const paymentModel = mongoose.models.payment || mongoose.model('payment', paymentSchema);

export default paymentModel;
