import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  tutorId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
})

reviewSchema.index({ sessionId: 1 }, { unique: true })

const reviewModel = mongoose.models.review || mongoose.model('review', reviewSchema)

export default reviewModel
