import mongoose from "mongoose";
import PropertyAddress from "./PropertyAddress.js";

const propertySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: {
        type: PropertyAddress.schema,
        required: true,
    },
    propertyTimeTOSell: {
        type: String,
        max: 255,
    },
    reason: {
        type: String,
        required: true,
    },
    propertyDetails: {
        type: String,
        required: true,
    },
    propertyType: {
        type: String,
        required: true,
        max: 255,
    },
    finishedSqft: {
        type: Number,
        required: true,
    },
    lotSize: {
        type: Number,
        required: true,
    },
    builtYear: {
        type: Number,
        required: true,
    },
    bedrooms: {
        type: Number,
        required: true,
    },
    fullBaths: {
        type: Number,
        required: true,
    },
    securityDeposit: {
        type: Number,
        required: true,
    },
    monthlyRent: {
        type: Number,
        required: true,
    },
    contact: {
        type: String,
    },
    amentities: {
        type: String,
    },
}, {
    timestamps: true,
});

propertySchema.index({ "address.location": "2dsphere" });

export default mongoose.model('Property', propertySchema);