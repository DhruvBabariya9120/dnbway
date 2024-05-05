import mongoose from "mongoose";

const propertyAddressSchema = new mongoose.Schema({

    propertyAddress: {
        type: String,
        max: 255,
    },
    unitNumber: {
        type: String,
        max: 255,
    },
    city: {
        type: String,
        max: 255,
    },
    state: {
        type: String,
        max: 255,
    },
    zipcode: {
        type: Number,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
},
    {
        timestamps: true
    });

export default mongoose.model('PropertyAddress', propertyAddressSchema);