import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();
export default async function sendOTPMail(email, otp) {

    const mailOptions = {
        from: process.env.FROM_MAIL, // Sender's email address
        to: email, // Receiver's email address
        subject: 'OTP for Verification',
        text: `Your OTP is: ${otp}`
    };

    const transporter = nodemailer.createTransport({
        host: 'dnbway.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.FROM_MAIL, // Your email address
            pass: process.env.MAIL_PASS // Your email password
        }
    });
    await transporter.sendMail(mailOptions);
}