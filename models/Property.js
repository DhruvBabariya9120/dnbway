import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
    generatedID: {
        type: String,
        required: true,
        max: 255,
    },
    propertyType: {
        type: String,
        required: true,
        max: 255,
    },
    landlordName: {
        type: String,
        required: true,
        max: 255,
    },
    landlordTelephone: {
        type: String,
        required: true,
        max: 255,
    },
    landlordEmail: {
        type: String,
        required: true,
        max: 255,
    },
    landlordAddress: {
        type: String,
        required: true,
        max: 255,
    },
    propertyreqType: {
        type: String,
        required: true,
        max: 255,
    },
    propertyDetails: {
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
        default: Date.now(),
    },
});

export default mongoose.model('Property', propertySchema);