import jwt from "jsonwebtoken"

// Tutor authentication middleware
const authTutor = async (req, res, next) => {
    try {
        const { ttoken } = req.headers
        if (!ttoken) {
            return res.json({ success: false, message: "Not Authorized! Please Login Again" })
        }
        const token_decode = jwt.verify(ttoken, process.env.JWT_SECRET)
        req.tutId = token_decode.id
        // Also set on body for POST requests that need it
        if (!req.body) req.body = {}
        req.body.tutId = token_decode.id
        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default authTutor
