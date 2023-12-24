const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/sign-up", async (req, res) => {
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).send({message: "Email Exists"});
  
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
  
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
      phone: req.body.phone,
      balance: "0.00",
      fullname: req.body.fullname,
    });
    try {
      const savedUser = await user.save();
      //SendsignUpNotification(req.body.email);
      res.send({ message: "Registration Successful", savedUser });
    } catch (err) {
      res.status(400).send({message : err});
    }
  });
  
  router.post("/sign-in", async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send({message : "User does not Exist"});
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send({message: "Wrong Password"});
  
    const token = jwt.sign({ email: req.body.email }, "DNBWay", {
      expiresIn: "1h",
    });
  
    //SendLoginNotification(req.body.email);
    res.send({ message: "Login Successful", user ,token: token });
  });
  
  router.get("/get-info/:email", async (req, res) => {
    try {
      if (
        !req.headers.authorization ||
        !req.headers.authorization.startsWith("Bearer ") ||
        !req.headers.authorization.split(" ")[1]
      ) {
        return res.status(422).json({ message: "Please Provide Token!" });
      }
      const user = await User.find({ email: req.params.email });
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  });
  
  
  router.post("/reset-password", async (req, res) => {
    try {
      if (
        !req.headers.authorization ||
        !req.headers.authorization.startsWith("Bearer ") ||
        !req.headers.authorization.split(" ")[1]
      ) {
        return res.status(422).json({ message: "Please Provide Token!" });
      }
  
      const email = req.body.email;
      const password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await User.findOneAndUpdate({email : email}, {$set: {password : hashedPassword}});
  
      return res.send({ error: false, message: "Password Changed" });
  
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  });
  
  router.post("/forgot-password", async (req, res) => {
    try {
      
      const email = req.body.email;
      const password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await User.findOneAndUpdate({email : email}, {$set: {password : hashedPassword}});
  
      return res.send({ error: false, message: "Password Changed" });
  
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  });
  
  module.exports = router;