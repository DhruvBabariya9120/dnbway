import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({

    messageId: {
        type: String,
        required: true,
        max: 255,
    },
    email: {
        type: String,
        required: true,
        max: 255,
    },
    messageBody: {
        type: String,
        required: true,
        max: 10000,
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
});


export default mongoose.model('Messages', messageSchema);