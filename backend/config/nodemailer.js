import nodemailer from 'nodemailer'

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS  // Use App Password for Gmail
    }
})

// Send tutor approval email with credentials
const sendTutorApprovalEmail = async (tutorEmail, tutorName, password) => {
    try {
        const mailOptions = {
            from: {
                name: 'MentorMatch',
                address: process.env.EMAIL_USER
            },
            to: tutorEmail,
            subject: '🎉 Congratulations! Your Tutor Application has been Approved - MentorMatch',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, #4f47e6 0%, #7c3aed 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: #f9fafb;
                            padding: 30px;
                            border: 1px solid #e5e7eb;
                        }
                        .credentials-box {
                            background: white;
                            border: 2px solid #4f47e6;
                            border-radius: 10px;
                            padding: 20px;
                            margin: 20px 0;
                        }
                        .credential-item {
                            margin: 10px 0;
                            padding: 10px;
                            background: #f3f4f6;
                            border-radius: 5px;
                        }
                        .credential-label {
                            font-weight: bold;
                            color: #4f47e6;
                        }
                        .footer {
                            background: #1f2937;
                            color: #9ca3af;
                            padding: 20px;
                            text-align: center;
                            border-radius: 0 0 10px 10px;
                            font-size: 12px;
                        }
                        .btn {
                            display: inline-block;
                            background: #4f47e6;
                            color: white;
                            padding: 12px 30px;
                            text-decoration: none;
                            border-radius: 5px;
                            margin-top: 20px;
                        }
                        .warning {
                            background: #fef3c7;
                            border: 1px solid #f59e0b;
                            padding: 15px;
                            border-radius: 5px;
                            margin-top: 20px;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎓 Welcome to MentorMatch!</h1>
                            <p>Your Tutor Application has been Approved</p>
                        </div>
                        
                        <div class="content">
                            <h2>Dear ${tutorName},</h2>
                            
                            <p>We are thrilled to inform you that your application to become a tutor on <strong>MentorMatch</strong> has been <strong style="color: #10b981;">approved!</strong></p>
                            
                            <p>You can now access your Tutor Dashboard and start connecting with students.</p>
                            
                            <div class="credentials-box">
                                <h3 style="margin-top: 0; color: #4f47e6;">🔐 Your Login Credentials</h3>
                                
                                <div class="credential-item">
                                    <span class="credential-label">Email:</span><br>
                                    <code style="font-size: 16px;">${tutorEmail}</code>
                                </div>
                                
                                <div class="credential-item">
                                    <span class="credential-label">Password:</span><br>
                                    <code style="font-size: 16px;">${password}</code>
                                </div>
                            </div>
                            
                            <div class="warning">
                                ⚠️ <strong>Important:</strong> Please change your password after your first login for security purposes. Keep your credentials safe and do not share them with anyone.
                            </div>
                            
                            <center>
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="btn">Login to Dashboard</a>
                            </center>
                            
                            <p style="margin-top: 30px;">If you have any questions or need assistance, feel free to contact our support team.</p>
                            
                            <p>Best regards,<br><strong>The MentorMatch Team</strong></p>
                        </div>
                        
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} MentorMatch. All rights reserved.</p>
                            <p>This is an automated email. Please do not reply directly to this message.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        }

        const info = await transporter.sendMail(mailOptions)
        console.log('Email sent successfully:', info.messageId)
        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error('Error sending email:', error)
        return { success: false, error: error.message }
    }
}

// Send rejection email
const sendTutorRejectionEmail = async (tutorEmail, tutorName) => {
    try {
        const mailOptions = {
            from: {
                name: 'MentorMatch',
                address: process.env.EMAIL_USER
            },
            to: tutorEmail,
            subject: 'Update on Your Tutor Application - MentorMatch',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: #6b7280;
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: #f9fafb;
                            padding: 30px;
                            border: 1px solid #e5e7eb;
                        }
                        .footer {
                            background: #1f2937;
                            color: #9ca3af;
                            padding: 20px;
                            text-align: center;
                            border-radius: 0 0 10px 10px;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>MentorMatch</h1>
                            <p>Application Status Update</p>
                        </div>
                        
                        <div class="content">
                            <h2>Dear ${tutorName},</h2>
                            
                            <p>Thank you for your interest in becoming a tutor on MentorMatch.</p>
                            
                            <p>After careful review of your application, we regret to inform you that we are unable to approve your application at this time.</p>
                            
                            <p>This decision could be due to various factors, and we encourage you to:</p>
                            <ul>
                                <li>Review and update your qualifications</li>
                                <li>Gain more experience in your field</li>
                                <li>Reapply in the future with updated credentials</li>
                            </ul>
                            
                            <p>We appreciate your understanding and wish you the best in your future endeavors.</p>
                            
                            <p>Best regards,<br><strong>The MentorMatch Team</strong></p>
                        </div>
                        
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} MentorMatch. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        }

        const info = await transporter.sendMail(mailOptions)
        console.log('Rejection email sent:', info.messageId)
        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error('Error sending rejection email:', error)
        return { success: false, error: error.message }
    }
}

export { sendTutorApprovalEmail, sendTutorRejectionEmail }
