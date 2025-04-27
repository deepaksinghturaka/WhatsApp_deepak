require('dotenv').config();
const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, router: userRouter } = require('../controllers/userController');

router.use(express.json());

// Use the user router which contains the profile route
router.use('/', userRouter);

// OTP routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

module.exports = router;
