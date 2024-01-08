const mongoose = require("mongoose");

const fruitSchema = new mongoose.Schema({

    fruitName: {
        type: String,
        required: true,
        max: 255,
    },
    price: {
        type: mongoose.SchemaTypes.Number,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
});

module.exports = mongoose.model('Fruits', fruitSchema);