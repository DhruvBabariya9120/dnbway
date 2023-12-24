const mongoose = require("mongoose");

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


module.exports = mongoose.model('Messages', messageSchema);