import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    max: 255,
  },
  password: {
    type: String,
    required: true,
    max: 2055,
  },
  phone: {
    type: String,
    required: false,
    max: 255,
  },
  balance: {
    type: mongoose.SchemaTypes.Number,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
    max: 250,
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model('User', userSchema);