const router = require("express").Router();
const User = require("../models/User");
const Trans = require("../models/Transactions");
const LoanApplication = require("../models/LoanApplication");

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate the unique ID
function generateUniqueLoanApplicationID() {
    const prologue = "dnbBooking-";
    const randomNumber = getRandomNumber(10000, 99999); // You can adjust the range as needed
    const uniqueID = `${prologue}${randomNumber}`;
    return uniqueID;
}

router.get("/loanApplication", async (req, res) => {
    try {

        if (
            !req.headers.authorization ||
            !req.headers.authorization.startsWith("Bearer ") ||
            !req.headers.authorization.split(" ")[1]
        ) {
            return res.status(422).json({ message: "Please Provide Token!" });
        }

        const amount = parseInt(req.query.amount);
        //const masterUserEmail = req.query.masterUserEmail;
        const masterUser = await User.findOne({ email: req.query.masterUserEmail });
        if (!masterUser) {
            return res.status(404).json({ error: "Master user not found" });
        }

        const loanTenureInMonths = req.query.tenure;
        const interestRate = 0.05;
        const simpleInterest = (parseInt(amount) * interestRate * loanTenureInMonths) / 12;

        const debit = await User.find({ email: req.query.masterUserEmail });
        const debit_balance = parseInt(debit[0].balance);
        const debit_amt = debit_balance - amount;
        await User.findOneAndUpdate(
            { email: req.query.masterUserEmail },
            { $set: { balance: debit_amt } }
        );

        const transactions = new Trans({
            email: masterUser,
            narration: "DEBIT Wallet Transfer - " + amount,
            credit: 0.0,
            debit: amount,
            amount: amount,
        });

        //SendTransferNotification(req.query.transferfrom, req.query.transferTo, amount);
        transactions.save();

        const loanApplication = new LoanApplication({
            referenceNumber: generateUniqueLoanApplicationID(),
            applicantName: req.query.applicantName,
            transferTo: req.query.transferTo,
            loanAmount: req.query.amount,
            tenure: loanTenureInMonths,
            interestAmount: simpleInterest,
        });

        loanApplication.save();

        //credit User
        const credit = await User.find({ email: req.query.transferTo });
        const credit_balance = parseInt(credit[0].balance);
        const credit_amt = credit_balance + amount;

        await User.findOneAndUpdate(
            { email: req.query.transferTo },
            { $set: { balance: credit_amt } }
        );
        const trx = new Trans({
            email: req.query.transferTo,
            narration: "CREDIT Wallet Transfer - " + amount,
            credit: amount,
            debit: 0.0,
            amount: amount,
        });
        trx.save();
        return res.send({ error: false, message: "Loan Disbursement Complete" });

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

module.exports = router;