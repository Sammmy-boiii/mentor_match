import mongoose from "mongoose"

const tutorLoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    educationStatus: {
        type: String,
        required: true,
        enum: ["High School", "Bachelor's Degree", "Master's Degree", "PhD", "Other"]
    },
    experience: {
        type: String,
        required: true,
        enum: ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"]
    },
    subject: {
        type: String,
        required: true
    },
    about: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    document: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "approved", "rejected"]
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
})

const tutorLoginModel = mongoose.models.tutorlogin || mongoose.model("tutorlogin", tutorLoginSchema)

export default tutorLoginModel
