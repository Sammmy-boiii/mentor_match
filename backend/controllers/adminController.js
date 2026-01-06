import validator from "validator"
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary"
import tutorModel from "../models/tutorModel.js"
import sessionModel from "../models/sessionModel.js"
import tutorLoginModel from "../models/tutorLoginModel.js"
import jwt from "jsonwebtoken"
import { sendTutorApprovalEmail, sendTutorRejectionEmail } from "../config/nodemailer.js"

//API for adding a tutor for admin panel
const addTutor = async (req, res) => {
    try {
        const { name, email, password, qualification, subject, experience, about, fees, location } = req.body

        const imageFile = req.file
        //console.log({name,email,password,qualification,subject,experience,about,fees,location},imageFile)

        if (!name || !email || !password || !qualification || !subject || !experience || !about
            || !fees || !location) {
            return res.json({ success: false, message: "Missing Details" })

        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please Enter a Valid Email Address" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter strong password" })
        }
        //Hashing the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        //Handling Image
        let imageUrl = "";
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            imageUrl = imageUpload.secure_url

        } else {
            //provide default image url if no file is uploaded
            imageUrl = "https://placeholder.co/400"
        }
        const tutorData = {
            name, email, password: hashedPassword, image: imageUrl, qualification, subject, experience, about, fees,
            location: JSON.parse(location), available: true, date: Date.now()
        }
        const newTutor = new tutorModel(tutorData)
        await newTutor.save()
        res.json({ success: true, message: "Tutor added Successfully" })
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}
//API For Admin Login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            res.json({ success: true, token })

        } else {
            res.json({ success: false, message: "Invalid Credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//API FOR GET TALL TUTORS LOST FOR THE ADMIN PANEL
const allTutors = async (req, res) => {
    try {
        const tutors = await tutorModel.find({}).select("-password")
        res.json({ success: true, tutors })
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all sessions for admin
const allSessions = async (req, res) => {
    try {
        const sessions = await sessionModel.find({})
        res.json({ success: true, sessions })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to cancel session (admin)
const cancelSession = async (req, res) => {
    try {
        const { sessionId } = req.body
        await sessionModel.findByIdAndUpdate(sessionId, { cancelled: true })
        res.json({ success: true, message: "Session Cancelled" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get admin dashboard data
const adminDashboard = async (req, res) => {
    try {
        const tutors = await tutorModel.find({})
        const sessions = await sessionModel.find({})
        const applications = await tutorLoginModel.find({ status: "pending" })

        const dashData = {
            tutors: tutors.length,
            sessions: sessions.length,
            pendingApplications: applications.length,
            latestSessions: sessions.reverse().slice(0, 5),
            latestApplications: applications.reverse().slice(0, 5)
        }

        res.json({ success: true, dashData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all tutor applications
const getTutorApplications = async (req, res) => {
    try {
        const applications = await tutorLoginModel.find({}).sort({ appliedAt: -1 })
        res.json({ success: true, applications })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to approve tutor application
const approveTutorApplication = async (req, res) => {
    try {
        const { applicationId, password, fees, address } = req.body

        // Get application details
        const application = await tutorLoginModel.findById(applicationId)
        if (!application) {
            return res.json({ success: false, message: "Application not found" })
        }

        if (application.status !== "pending") {
            return res.json({ success: false, message: "Application already processed" })
        }

        // Validate password
        if (!password || password.length < 8) {
            return res.json({ success: false, message: "Please provide a strong password (min 8 characters)" })
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create tutor from application data
        const tutorData = {
            name: application.name,
            email: application.email,
            password: hashedPassword,
            image: application.image,
            qualification: application.educationStatus,
            subject: application.subject,
            experience: application.experience,
            about: application.about,
            fees: fees || 500,
            address: address ? JSON.parse(address) : { line1: "", line2: "" },
            available: true,
            date: Date.now()
        }

        const newTutor = new tutorModel(tutorData)
        await newTutor.save()

        // Update application status
        await tutorLoginModel.findByIdAndUpdate(applicationId, { status: "approved" })

        // Send approval email with credentials
        const emailResult = await sendTutorApprovalEmail(application.email, application.name, password)

        if (emailResult.success) {
            res.json({ success: true, message: "Tutor approved successfully! Login credentials sent to their email." })
        } else {
            res.json({ success: true, message: "Tutor approved successfully! But email could not be sent. Please share credentials manually." })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to reject tutor application
const rejectTutorApplication = async (req, res) => {
    try {
        const { applicationId } = req.body

        const application = await tutorLoginModel.findById(applicationId)
        if (!application) {
            return res.json({ success: false, message: "Application not found" })
        }

        if (application.status !== "pending") {
            return res.json({ success: false, message: "Application already processed" })
        }

        await tutorLoginModel.findByIdAndUpdate(applicationId, { status: "rejected" })

        // Send rejection email
        await sendTutorRejectionEmail(application.email, application.name)

        res.json({ success: true, message: "Application rejected" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to update tutor details
const updateTutor = async (req, res) => {
    try {
        const { tutorId, name, fees, experience, qualification, subject, about, mobile } = req.body
        const imageFile = req.file

        const updateData = {
            name,
            fees,
            experience,
            qualification,
            subject,
            about,
            phone: mobile
        }

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            updateData.image = imageUpload.secure_url
        }

        await tutorModel.findByIdAndUpdate(tutorId, updateData)

        res.json({ success: true, message: "Tutor details updated successfully" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to delete tutor
const deleteTutor = async (req, res) => {
    try {
        const { tutorId } = req.body
        await tutorModel.findByIdAndDelete(tutorId)
        res.json({ success: true, message: "Tutor deleted successfully" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { addTutor, loginAdmin, allTutors, allSessions, cancelSession, adminDashboard, getTutorApplications, approveTutorApplication, rejectTutorApplication, updateTutor, deleteTutor }