import tutorModel from "../models/tutorModel.js"
import sessionModel from "../models/sessionModel.js"
import tutorLoginModel from "../models/tutorLoginModel.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import {v2 as cloudinary} from "cloudinary"

// Tutor Application API - Submit application form with image and document
const applyTutor = async (req, res) => {
    try {
        const { name, email, phone, age, educationStatus, experience, subject, about } = req.body
        const imageFile = req.files?.image?.[0]
        const documentFile = req.files?.document?.[0]

        // Check if all required fields are provided
        if (!name || !email || !phone || !age || !educationStatus || !experience || !subject || !about) {
            return res.json({ success: false, message: "All fields are required" })
        }

        if (!imageFile) {
            return res.json({ success: false, message: "Profile photo is required" })
        }

        if (!documentFile) {
            return res.json({ success: false, message: "Document/Certificate is required" })
        }

        // Check if email already exists in applications
        const existingApplication = await tutorLoginModel.findOne({ email })
        if (existingApplication) {
            return res.json({ success: false, message: "An application with this email already exists" })
        }

        // Check if email already exists as approved tutor
        const existingTutor = await tutorModel.findOne({ email })
        if (existingTutor) {
            return res.json({ success: false, message: "This email is already registered as a tutor. Please use tutor login." })
        }

        // Upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
        const imageUrl = imageUpload.secure_url

        // Upload document to cloudinary
        const documentUpload = await cloudinary.uploader.upload(documentFile.path, { resource_type: "image" })
        const documentUrl = documentUpload.secure_url

        // Create new application
        const applicationData = {
            name,
            email,
            phone,
            age: Number(age),
            educationStatus,
            experience,
            subject,
            about,
            image: imageUrl,
            document: documentUrl,
            status: "pending"
        }

        const newApplication = new tutorLoginModel(applicationData)
        await newApplication.save()

        res.json({ success: true, message: "Application submitted successfully! Admin will review your application." })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Change availability API
const changeAvailability = async (req, res) => {
    try {
        const { tutId } = req.body
        const tutData = await tutorModel.findById(tutId)
        await tutorModel.findByIdAndUpdate(tutId, { available: !tutData.available })
        res.json({ success: true, message: "Availability Changed" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const tutorsList = async (req, res) => {
    try {
        const tutors = await tutorModel.find()
        res.json({ success: true, tutors })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Tutor Login API
const loginTutor = async (req, res) => {
    try {
        const { email, password } = req.body
        const tutor = await tutorModel.findOne({ email })

        if (!tutor) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, tutor.password)

        if (isMatch) {
            const token = jwt.sign({ id: tutor._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Get tutor dashboard data
const tutorDashboard = async (req, res) => {
    try {
        const tutId = req.tutId

        const sessions = await sessionModel.find({ tutId })

        let earnings = 0
        sessions.forEach((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })

        let students = []
        sessions.forEach((item) => {
            if (!students.includes(item.userId)) {
                students.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            sessions: sessions.length,
            students: students.length,
            latestSessions: sessions.reverse().slice(0, 5)
        }

        res.json({ success: true, dashData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Get all sessions for tutor
const tutorSessions = async (req, res) => {
    try {
        const tutId = req.tutId
        const sessions = await sessionModel.find({ tutId })
        res.json({ success: true, sessions })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Mark session as completed
const sessionComplete = async (req, res) => {
    try {
        const { tutId, sessionId } = req.body

        const sessionData = await sessionModel.findById(sessionId)

        if (sessionData && sessionData.tutId === tutId) {
            await sessionModel.findByIdAndUpdate(sessionId, { isCompleted: true })
            return res.json({ success: true, message: "Session Completed" })
        } else {
            return res.json({ success: false, message: "Session not found or unauthorized" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Cancel session
const sessionCancel = async (req, res) => {
    try {
        const { tutId, sessionId } = req.body

        const sessionData = await sessionModel.findById(sessionId)

        if (sessionData && sessionData.tutId === tutId) {
            await sessionModel.findByIdAndUpdate(sessionId, { cancelled: true })
            return res.json({ success: true, message: "Session Cancelled" })
        } else {
            return res.json({ success: false, message: "Session not found or unauthorized" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Get tutor profile
const tutorProfile = async (req, res) => {
    try {
        const tutId = req.tutId
        const profileData = await tutorModel.findById(tutId).select("-password")
        res.json({ success: true, profileData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Update tutor profile
const updateTutorProfile = async (req, res) => {
    try {
        const { tutId, fees, available, location, about, experience } = req.body

        await tutorModel.findByIdAndUpdate(tutId, {
            fees,
            available,
            location,
            about,
            experience
        })

        res.json({ success: true, message: "Profile Updated" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    changeAvailability,
    tutorsList,
    loginTutor,
    applyTutor,
    tutorDashboard,
    tutorSessions,
    sessionComplete,
    sessionCancel,
    tutorProfile,
    updateTutorProfile
}
