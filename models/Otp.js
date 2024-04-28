import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
// Define the schema for OTP
const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: process.env.OTP_EXPIRY_SECONDS
    }
});

export default mongoose.model('OTP', otpSchema);
