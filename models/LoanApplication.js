const mongoose = require("mongoose");

const loanApplicationSchema = new mongoose.Schema({
  referenceNumber: {
    type: String,
    required: true,
  },
  applicantName: {
    type: String,
    required: true,
  },
  transferTo: {
    type: String,
    required: true,
  },
  loanAmount: {
    type: mongoose.SchemaTypes.Number,
    required: true,
  },
  requestedDate: {
    type: Date,
    default: Date.now(),
  },
  tenure: {
    type: Number,
    required: true,
  },
  interestAmount: {
    type: mongoose.SchemaTypes.Number,
    required: true,
  },
});

module.exports = mongoose.model("LoanApplication", loanApplicationSchema);
