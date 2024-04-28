import express from "express";
import User from "../models/User.js";
import Trans from "../models/Transactions.js";

const router = express.Router();
router.get("/wallet-transfer", async (req, res) => {
  try {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ") ||
      !req.headers.authorization.split(" ")[1]
    ) {
      return res.status(422).json({ message: "Please Provide Token!" });
    }

    const amount = parseInt(req.query.amount);

    //Debit user
    const debit = await User.find({ email: req.query.transferfrom });
    const debit_balance = parseInt(debit[0].balance);
    const debit_amt = debit_balance - amount;
    await User.findOneAndUpdate(
      { email: req.query.transferfrom },
      { $set: { balance: debit_amt } }
    );

    const transactions = new Trans({
      email: req.query.transferfrom,
      narration: "DEBIT Wallet Transfer - " + amount,
      credit: 0.0,
      debit: amount,
      amount: amount,
    });

    //SendTransferNotification(req.query.transferfrom, req.query.transferTo, amount);
    transactions.save();

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

    return res.send({ error: false, message: "Wallet Transfer Complete" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});


router.get("/update-wallet", async (req, res) => {
  try {

    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ") ||
      !req.headers.authorization.split(" ")[1]
    ) {
      return res.status(422).json({ message: "Please Provide Token!" });
    }

    const amount = parseInt(req.query.amount);
    const user = await User.find({ email: req.query.email });
    const balance = parseInt(user[0].balance);

    const total_amt = balance - amount;
    try {
      await User.findOneAndUpdate({ email: req.query.email }, { $set: { balance: total_amt } });
      const transactions = new Trans({
        email: req.query.email,
        narration: 'FX Transfer - ' + amount,
        credit: amount,
        debit: 0.00,
        amount: amount,
      });
      transactions.save();
    } catch (err) {
      console.log(err);
    }
    return res.send({ error: false, message: "Wallet Updated" });

  } catch (error) {
    res.status(404).json({ message: error.message });
  }
})

export default router