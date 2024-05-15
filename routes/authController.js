import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import randomstring from 'randomstring';
import isAuth from "../middlewares/is-auth.js";
import sendOTPMail from "../utility/sendMail.js";
import OTP from "../models/Otp.js";
import mongoose from 'mongoose';
import AWS from 'aws-sdk';
const router = express.Router();

AWS.config.update({
  accessKeyId: process.env.YOUR_ACCESS_KEY_ID,
  secretAccessKey: process.env.YOUR_SECRET_ACCESS_KEY,
  region: process.env.YOUR_REGION
});

const s3 = new AWS.S3();


/**
 * @swagger
 * /api/auth/sign-up:
 *   post:
 *    summary: register the user
 *    description: return saved user
 *    requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *    responses:
 *       200:
 *         description: A list of users
 *       500:
 *         description: Internal server error
 */
router.post("/sign-up", async (req, res) => {
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send({ message: "Email Already Exists" });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    email: req.body.email,
    password: hashedPassword,
    balance: "0.00",
    fullname: req.body.fullname,
  });
  const session = await mongoose.startSession(); // Start a new session
  session.startTransaction();
  try {
    const savedUser = await user.save();

    const otp = randomstring.generate({
      length: 4,
      charset: 'numeric'
    });
    const sentOTP = "" + otp;
    const newOTP = new OTP({
      email: req.body.email,
      otp: sentOTP
    });
    await newOTP.save();

    await sendOTPMail(req.body.email, otp);
    const token = jwt.sign({ id: savedUser._id, email: savedUser.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE_IN_HOURS,
    });

    await session.commitTransaction();
    res.status(200).send({ message: "Registration Successful", savedUser, token });
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.status(500).send({ message: "Error occurred during registration" });
  } finally {
    session.endSession(); // End the session
  }
});

/**
 * @swagger
 * /api/auth/sign-in:
 *   post:
 *     summary: login the user
 *     description: return user token
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: A list of users
 */
router.post("/sign-in", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send({ message: "User does not Exist" });
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send({ message: "Wrong Password" });
    if (!user.isEmailVerified) return res.status(400).send({ message: "Email is not Verified" });
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE_IN_HOURS,
    });
    res.status(200).send({ message: "Login Successful", user, token: token });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }

});

/**
 * @swagger
 * /api/auth/get-info/{email}:
 *   get:
 *     summary: get the user
 *     description: get thr user information from email
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The user email
 *
 *     responses:
 *       200:
 *         description: A users details
 */
router.get("/get-info/:email", isAuth, async (req, res) => {
  try {
    const user = await User.find({ email: req.params.email });
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});


/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Forgot Password
 *     description: Update user password using email address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: The new password
 *                 example: newPassword123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Password Changed
 *       404:
 *         description: User not found or error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error message
 */
router.post("/forgot-password", async (req, res) => {
  try {

    const email = req.body.email;
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await User.findOneAndUpdate({ email: email }, { $set: { password: hashedPassword } });

    return res.send({ message: "Password Changed" });

  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     description: Verify the OTP sent to a user's email address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 description: The OTP to be verified
 *                 example: 123456
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid OTP
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.post('/verify-otp', isAuth, async (req, res) => {
  const { otp } = req.body;
  try {
    const email = req.user.email;
    // Find the OTP document for the provided email and OTP value
    const otpDoc = await OTP.findOne({ email, otp });
    if (!otpDoc) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    user.isEmailVerified = true;
    await user.save();
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP via Email
 *     description: Generate and send OTP via email to the provided email address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address where OTP will be sent
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP sent successfully
 *       500:
 *         description: Failed to send OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to send OTP
 */
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  // Generate a random OTP
  let otp = randomstring.generate({
    length: 4,
    charset: 'numeric'
  });
  const sentOtp = "" + otp;
  try {
    const newOTP = new OTP({
      email,
      otp: sentOtp,
    });
    await newOTP.save();
    await sendOTPMail(req.body.email, otp);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

/**
 * @swagger
 * /api/auth/profile-presigned-Url:
 *   post:
 *     summary: Generate presigned URL for profile image upload
 *     description: Generates a presigned URL for uploading a profile image to AWS S3.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileType:
 *                 type: string
 *                 description: The file type (e.g., jpg, png)
 *                 example: jpg
 *     responses:
 *       200:
 *         description: Presigned URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 presignedUrl:
 *                   type: string
 *                   description: The presigned URL for uploading the profile image
 *       400:
 *         description: Invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid file type
 *       500:
 *         description: Failed to generate presigned URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to generate presigned URL
 */
router.post("/profile-presigned-Url", isAuth, async (req, res) => {
  try {
    const { _id, email } = req.user;
    const { fileType } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const key = `profile/${_id}_${Date.now()}.${fileType}`;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: `image/${fileType}` // Adjust content type based on your file type
    };
    const url = await s3.getSignedUrlPromise('putObject', params);
    user.profileImage = key;
    await user.save();
    res.status(200).json({ presignedUrl: url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

