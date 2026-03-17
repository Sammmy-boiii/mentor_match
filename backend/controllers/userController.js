import validator from "validator"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"

import userModel from "../models/userModel.js"
import tutorModel from "../models/tutorModel.js"
import sessionModel from "../models/sessionModel.js"
import { v2 as cloudinary } from "cloudinary"
import axios from "axios"
import paymentModel from "../models/paymentModel.js"


// ================= REGISTER USER =================
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.json({ success: false, message: "Missing Credentials" })
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Email is not valid" })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await userModel.create({
            name,
            email,
            password: hashedPassword
        })

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ================= LOGIN USER =================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Credentials" })
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ================= GET PROFILE =================
const getProfile = async (req, res) => {
    try {
        const userId = req.userId

        const userData = await userModel.findById(userId).select("-password")
        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ================= UPDATE PROFILE =================
const updateProfile = async (req, res) => {
    try {
        const userId = req.userId
        const { name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Missing Credentials" })
        }

        await userModel.findByIdAndUpdate(userId, {
            name,
            phone,
            address: typeof address === "string" ? JSON.parse(address) : address,
            dob,
            gender
        })

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(
                imageFile.path,
                { resource_type: "image" }
            )

            await userModel.findByIdAndUpdate(userId, {
                image: imageUpload.secure_url
            })
        }

        res.json({ success: true, message: "Profile Updated Successfully" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


// ================= BOOK SESSION =================
const bookSession = async (req, res) => {
    try {
        const userId = req.userId
        const { tutId, slotDate, slotTime } = req.body

        const tutorData = await tutorModel.findById(tutId)
        if (!tutorData || !tutorData.available) {
            return res.json({ success: false, message: "Tutor not available" })
        }

        let slots_booked = tutorData.slots_booked || {}

        if (slots_booked[slotDate]?.includes(slotTime)) {
            return res.json({ success: false, message: "Slot already booked" })
        }

        slots_booked[slotDate] = slots_booked[slotDate] || []
        slots_booked[slotDate].push(slotTime)

        const userData = await userModel.findById(userId).select("-password")

        // Parse slotDate string (format: day/month/year)
        const [day, month, year] = slotDate.split('/').map(Number)
        const parsedDate = new Date(year, month - 1, day)

        const sessionData = {
            userId,
            tutId,
            tutData: tutorData,
            userData,
            slotDate: parsedDate,
            slotTime,
            amount: tutorData.fees,
            date: Date.now()
        }

        await sessionModel.create(sessionData)
        await tutorModel.findByIdAndUpdate(tutId, { slots_booked })

        res.json({ success: true, message: "Session booked successfully" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
//api to get user sessions for frontend 
const listSessions = async (req, res) => {
    try {
        const userId = req.userId
        const sessions = await sessionModel.find({ userId })
        res.json({ success: true, sessions })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//api for cancel session
const cancelSession = async (req, res) => {
    try {
        const userId = req.userId
        const { sessionId } = req.body
        const sessionData = await sessionModel.findById(sessionId)

        //verify session User
        if (sessionData.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized access" })
        }
        await sessionModel.findByIdAndUpdate(sessionId, { cancelled: true })
        //Release tutor slot
        const { tutId, slotDate, slotTime } = sessionData
        const tutorData = await tutorModel.findById(tutId)

        let slots_booked = tutorData.slots_booked
        if (slots_booked[slotDate]) {
            slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)
        }

        await tutorModel.findByIdAndUpdate(tutId, { slots_booked })
        res.json({ success: true, message: "Session cancelled successfully" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ================= ESEWA PAYMENT =================

// Initiate eSewa Payment
const initiateEsewa = async (req, res) => {
    try {
        const userId = req.userId
        const { sessionId } = req.body

        const sessionData = await sessionModel.findById(sessionId)
        if (!sessionData || sessionData.cancelled) {
            return res.json({ success: false, message: "Session not found or cancelled" })
        }

        if (sessionData.userId.toString() !== userId.toString()) {
            return res.json({ success: false, message: "Unauthorized access" })
        }

        if (sessionData.payment) {
            return res.json({ success: false, message: "Payment already completed" })
        }

        const amount = sessionData.amount
        const transactionUuid = `${sessionId}-${Date.now()}`
        const productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST"
        const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q"

        // eSewa v2 HMAC-SHA256 signature
        // signed fields: total_amount,transaction_uuid,product_code
        const signedFieldNames = "total_amount,transaction_uuid,product_code"
        const message = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${productCode}`
        const signature = crypto
            .createHmac("sha256", secretKey)
            .update(message)
            .digest("base64")

        res.json({
            success: true,
            esewaData: {
                amount: amount,
                tax_amount: 0,
                total_amount: amount,
                transaction_uuid: transactionUuid,
                product_code: productCode,
                product_service_charge: 0,
                product_delivery_charge: 0,
                success_url: `${process.env.FRONTEND_URL}/my-sessions`,
                failure_url: `${process.env.FRONTEND_URL}/my-sessions`,
                signed_field_names: signedFieldNames,
                signature: signature,
            },
            gatewayUrl: process.env.ESEWA_GATEWAY_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
        })

    } catch (error) {
        console.log("eSewa Initiate Error:", error.message)
        res.json({ success: false, message: error.message })
    }
}
// Verify eSewa Payment (called after redirect back from eSewa)
const verifyEsewa = async (req, res) => {
    try {
        const { data } = req.body  // base64-encoded JSON sent from frontend after eSewa redirect

        if (!data) {
            return res.json({ success: false, message: "No payment data received" })
        }

        // Decode eSewa response
        const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'))
        const { transaction_code, status, transaction_uuid, signed_field_names, signature } = decoded

        if (status !== 'COMPLETE') {
            return res.json({ success: false, message: `Payment not completed. Status: ${status}` })
        }

        // Verify HMAC-SHA256 signature from eSewa
        const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q"
        const fieldsToSign = signed_field_names.split(',').map(f => `${f}=${decoded[f]}`).join(',')
        const expectedSignature = crypto
            .createHmac('sha256', secretKey)
            .update(fieldsToSign)
            .digest('base64')

        if (expectedSignature !== signature) {
            return res.json({ success: false, message: "Signature verification failed" })
        }

        // Extract sessionId — transaction_uuid format is `${sessionId}-${Date.now()}`
        // MongoDB ObjectId is 24 hex chars, so take first 24 characters
        const extractedSessionId = transaction_uuid.substring(0, 24)

        const sessionData = await sessionModel.findById(extractedSessionId)
        if (!sessionData) {
            return res.json({ success: false, message: "Session not found" })
        }

        if (sessionData.payment) {
            return res.json({ success: true, message: "Payment already recorded" })
        }

        // Mark session as paid
        await sessionModel.findByIdAndUpdate(extractedSessionId, {
            payment: true,
            paymentMethod: 'esewa',
            paymentId: transaction_code,
        })

        res.json({ success: true, message: "Payment verified successfully" })

    } catch (error) {
        console.log("eSewa Verify Error:", error.message)
        res.json({ success: false, message: error.message })
    }
}

// ================= KHALTI PAYMENT =================

// Initiate Khalti Payment
const initiateKhalti = async (req, res) => {
    try {
        const userId = req.userId
        const { sessionId } = req.body

        const sessionData = await sessionModel.findById(sessionId)
        if (!sessionData || sessionData.cancelled) {
            return res.json({ success: false, message: "Session not found or cancelled" })
        }

        if (sessionData.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized access" })
        }

        if (sessionData.payment) {
            return res.json({ success: false, message: "Payment already completed" })
        }

        if (!sessionData.isCompleted) {
            return res.json({ success: false, message: "Session must be completed before payment" })
        }

        // For V1 Pop-up, we don't need a server-side initiation request.
        // We just return the necessary data for the frontend to open the pop-up.
        const amountInPaisa = Math.round(sessionData.amount * 100)

        // We can still create a pending payment record if we want to track it
        const purchaseOrderId = `${sessionId}-${Date.now()}`

        await paymentModel.create({
            userId,
            sessionId,
            purchase_order_id: purchaseOrderId,
            amount: sessionData.amount,
            status: 'Pending'
        })

        res.json({
            success: true,
            amount: amountInPaisa,
            purchase_order_id: purchaseOrderId,
            purchase_order_name: `Session Booking - ${sessionData.slotDate}`,
            product_identity: sessionId,
            product_name: `MentorMatch Session`,
            product_url: `${process.env.FRONTEND_URL}/session/${sessionId}`
        })

    } catch (error) {
        console.log("Khalti Initiate Error:", error.message)
        res.json({ success: false, message: error.message })
    }
}

// Verify Khalti Payment (Lookup API)
const verifyKhalti = async (req, res) => {
    try {
        const { token, amount, sessionId } = req.body

        if (!token || !amount || !sessionId) {
            return res.json({ success: false, message: "Missing token, amount, or sessionId" })
        }

        const trimmedKey = process.env.KHALTI_SECRET_KEY ? process.env.KHALTI_SECRET_KEY.trim() : "";
        const config = {
            headers: {
                'Authorization': `Key ${trimmedKey}`,
                'Content-Type': 'application/json'
            }
        }

        const khaltiBaseUrl = process.env.KHALTI_BASE_URL.endsWith('/')
            ? process.env.KHALTI_BASE_URL
            : `${process.env.KHALTI_BASE_URL}/`;

        console.log("Khalti V1 Verification - URL:", `${khaltiBaseUrl}payment/verify/`)

        const payload = {
            token: token,
            amount: amount
        }

        const response = await axios.post(`${khaltiBaseUrl}payment/verify/`, payload, config)

        if (response.data && response.data.idx) {
            const sessionData = await sessionModel.findById(sessionId)
            if (!sessionData) {
                return res.json({ success: false, message: "Session not found" })
            }

            // Update payment record
            const paymentData = await paymentModel.findOne({ sessionId, status: 'Pending' }).sort({ createdAt: -1 })
            if (paymentData) {
                paymentData.status = 'Completed'
                paymentData.transaction_id = response.data.idx
                paymentData.pidx = response.data.idx
                await paymentData.save()
            }

            // Update session
            sessionData.generateRoomId()
            sessionData.payment = true
            sessionData.paymentMethod = "khalti"
            sessionData.paymentId = response.data.idx
            sessionData.transactionId = response.data.idx
            await sessionData.save()

            return res.json({ success: true, message: "Payment verified successfully", data: response.data })
        } else {
            return res.json({ success: false, message: "Payment verification failed" })
        }

    } catch (error) {
        console.log("Khalti Verify Error:", error.response?.data || error.message)
        const errorMessage = error.response?.data ? JSON.stringify(error.response.data) : error.message
        res.json({ success: false, message: errorMessage })
    }
}

export {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    bookSession,
    listSessions,
    cancelSession,
    initiateEsewa,
    verifyEsewa,
    initiateKhalti,
    verifyKhalti
}
