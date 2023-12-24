const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({

    bookingId: {
        type: String,
        required: true,
        max: 255,
    },
    propertyType: {
        type: String,
        required: true,
        max: 255,
    },
    bookingRequestorName: {
        type: String,
        required: true,
        max: 255,
    },
    bookingRequestorEmail: {
        type: String,
        required: true,
        max: 255,
    },
    bookingRequestorFromDate: {
        type: Date,
        default: Date.now()
    },
    bookingRequestorToDate: {
        type: Date,
        default: Date.now()
    },
    bookingPrice: {
        type: mongoose.SchemaTypes.Number,
        required: true
    },
    bookingRequestorPaymentType: {
        type: String,
        required: true,
        max: 255,
    },
    bookingPaymentMethod: {
        type: String,
        required: true,
        max: 255,
    },
    isLoanPayment: {
        type: Boolean,
    },
    bookingStatus: {
        type: Boolean,
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
});


module.exports = mongoose.model('Booking', bookingSchema);