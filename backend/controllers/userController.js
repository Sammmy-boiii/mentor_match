import validator from "validator"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import userModel from "../models/userModel.js"
import tutorModel from "../models/tutorModel.js"
import sessionModel from "../models/sessionModel.js"
import { v2 as cloudinary } from "cloudinary"


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

        const sessionData = {
            userId,
            tutId,
            tutData: tutorData,
            userData,
            slotDate,
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
const listSessions=async(req,res)=>{
    try {
        const userId=req.userId
        const sessions=await sessionModel.find({userId})
        res.json({success:true,sessions})
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//api for cancel session
const cancelSession=async(req,res)=>{
    try {
        const userId=req.userId
        const {sessionId}=req.body
        const sessionData=await sessionModel.findById(sessionId)

        //verify session User
        if(sessionData.userId !== userId){
            return res.json({success:false,message:"Unauthorized access"})
        }
        await sessionModel.findByIdAndUpdate(sessionId,{cancelled:true}) 
        //Release tutor slot
        const {tutId,slotDate,slotTime}=sessionData
        const tutorData=await tutorModel.findById(tutId)

        let slots_booked=tutorData.slots_booked
        if (slots_booked[slotDate]) {
            slots_booked[slotDate]=slots_booked[slotDate].filter(e=>e!==slotTime)
        }

        await tutorModel.findByIdAndUpdate(tutId,{slots_booked})
        res.json({success:true,message:"Session cancelled successfully"})
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// ================= ESEWA PAYMENT =================
// Generate HMAC SHA256 signature for eSewa
const generateEsewaSignature = (message, secret) => {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(message)
    return hmac.digest('base64')
}

// Initiate eSewa Payment
const paymentEsewa = async (req, res) => {
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

        const amount = sessionData.amount
        const taxAmount = 0
        const totalAmount = amount + taxAmount
        const transactionUuid = `${sessionId}-${Date.now()}`
        
        // eSewa Sandbox/Test credentials
        const productCode = process.env.ESEWA_MERCHANT_CODE || "EPAYTEST"
        const secretKey = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q"

        // Create signature message - exact format required by eSewa
        const signatureMessage = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`
        const signature = generateEsewaSignature(signatureMessage, secretKey)

        // Store transaction UUID in session for verification
        await sessionModel.findByIdAndUpdate(sessionId, {
            transactionId: transactionUuid
        })

        // eSewa sandbox URL
        const esewaPaymentUrl = process.env.ESEWA_PAYMENT_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form"

        // Note: eSewa appends ?data=base64encodedresponse to success_url
        // So we use path-based parameters to avoid query string conflicts
        const esewaData = {
            amount: amount.toString(),
            tax_amount: taxAmount.toString(),
            total_amount: totalAmount.toString(),
            transaction_uuid: transactionUuid,
            product_code: productCode,
            product_service_charge: "0",
            product_delivery_charge: "0",
            success_url: `${process.env.FRONTEND_URL}/verify/${sessionId}/success`,
            failure_url: `${process.env.FRONTEND_URL}/verify/${sessionId}/failure`,
            signed_field_names: "total_amount,transaction_uuid,product_code",
            signature: signature,
            payment_url: esewaPaymentUrl
        }

        res.json({ success: true, esewaData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Verify eSewa Payment
const verifyEsewa = async (req, res) => {
    try {
        const { sessionId, data } = req.body

        console.log("=== eSewa Verification Request ===")
        console.log("Session ID:", sessionId)
        console.log("Raw data:", data)

        if (!data) {
            return res.json({ success: false, message: "No payment data received" })
        }

        if (!sessionId) {
            return res.json({ success: false, message: "No session ID received" })
        }

        // Decode base64 response from eSewa
        let decodedData
        try {
            decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'))
            console.log("Decoded eSewa data:", decodedData)
        } catch (decodeError) {
            console.log("Failed to decode eSewa data:", decodeError)
            return res.json({ success: false, message: "Invalid payment data format" })
        }
        
        const sessionData = await sessionModel.findById(sessionId)
        if (!sessionData) {
            console.log("Session not found for ID:", sessionId)
            return res.json({ success: false, message: "Session not found" })
        }

        console.log("Session transaction ID:", sessionData.transactionId)
        console.log("eSewa transaction UUID:", decodedData.transaction_uuid)
        console.log("eSewa status:", decodedData.status)

        // Verify the transaction - eSewa returns status as "COMPLETE" on success
        if (decodedData.status === "COMPLETE") {
            // Optionally verify transaction_uuid matches (may have timestamp variations)
            const sessionIdFromUuid = decodedData.transaction_uuid?.split('-')[0]
            
            if (sessionIdFromUuid === sessionId || decodedData.transaction_uuid === sessionData.transactionId) {
                // Generate room ID for video call
                sessionData.generateRoomId()
                sessionData.payment = true
                sessionData.paymentMethod = "esewa"
                sessionData.paymentId = decodedData.transaction_code || decodedData.transaction_uuid
                sessionData.transactionId = decodedData.transaction_uuid
                await sessionData.save()
                
                console.log("Payment verified successfully!")
                return res.json({ success: true, message: "Payment verified successfully" })
            } else {
                console.log("Transaction UUID mismatch")
            }
        }

        console.log("Payment verification failed - status not COMPLETE or UUID mismatch")
        res.json({ success: false, message: "Payment verification failed - transaction mismatch" })

    } catch (error) {
        console.log("eSewa verification error:", error)
        res.json({ success: false, message: error.message })
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
    paymentEsewa,
    verifyEsewa
}
