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
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
        }
    },
    is_approved: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true,
        index: { location: "2dsphere" }
    });

export default mongoose.model('PropertyAddress', propertyAddressSchema);