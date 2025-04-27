const express = require('express');
const OtpModel = require('../models/otp');
const usermodel = require('../models/user');
const path = require('path');
const router = express.Router();
const otpGenerator =require('otp-generator');
const twilio = require('twilio'); 
const multer = require('multer');


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const twilioClient= new twilio(accountSid,authToken);

const sendOtp = async ( req,res)=>{

    try{

        const { phoneNumber}= req.body;

        const otp = otpGenerator.generate(4,{upperCaseAlphabets:false,specialChars:false, lowerCaseAlphabets:false});

        const otpExpiration = new Date();
        otpExpiration.setMinutes(otpExpiration.getMinutes() + 5);

        const otpData = await OtpModel.findOneAndUpdate(
            { phoneNumber },
            {
                otp,
                otpExpiration,
                createdAt: new Date()
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );

        await twilioClient.messages.create({
            body: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
            to: phoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER
        });

        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            data: {
                phoneNumber,
                otpExpiration
            }
        });


    }
    catch(error){
        return res.status(400).json({
            success:false,
            msg : error.message
        });
    }
 };

 const verifyOtp = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        // Find the OTP record for this phone number
        const otpData = await OtpModel.findOne({ phoneNumber });

        if (!otpData) {
            return res.status(400).json({
                success: false,
                message: 'No OTP found for this phone number'
            });
        }

        // Check if OTP has expired
        if (new Date() > otpData.otpExpiration) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        // Verify OTP
        if (otpData.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // OTP is valid - you can proceed with user registration/login here
        return res.status(200).json({
            success: true,
            message: 'OTP verified successfully'
        }); 

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    sendOtp,
    verifyOtp,
    router
};

 
 
 const storage = multer.diskStorage({
   destination: (req, file, cb) => {
     cb(null, './uploads');
   },
   filename: (req, file, cb) => {
     cb(null, Date.now() + path.extname(file.originalname));
   }
 });
 
 // File filter for multer
 const fileFilter = (req, file, cb) => {
   // Accept images only
   if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
     return cb(new Error('Only image files are allowed!'), false);
   }
   cb(null, true);
 };
 
 // Initialize multer
 const upload = multer({ 
   storage: storage,
   fileFilter: fileFilter,
   limits: {
     fileSize: 5 * 1024 * 1024 // 5MB limit
   }
 });// POST route to create a profile
router.post("/myprofile", upload.single("profileImg"), async (req, res) => {
    try {
        const { firstName, lastName } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Profile image is required" });
        }

        // Create a new profile
        const profile = await usermodel.create({
            profileImg: req.file.filename, // Save the filename in the database
            firstName,
            lastName
        });

        res.status(201).json({
            message: 'Profile created successfully',
            data: {
                id: profile._id,
                firstName: profile.firstName,
                lastName: profile.lastName,
                profileImg: `/uploads/${req.file.filename}`, // Serve the file with the relative path
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
});
router.get("/allusers", async (req, res) => {
    try {
        const users = await usermodel.find({}, 'firstName lastName profileImg'); // only select these fields

        // Add full path to profile image if needed
        const formattedUsers = users.map(user => ({
            firstName: user.firstName,
            lastName: user.lastName,
            profileImg: `/uploads/${user.profileImg}`,
        }));

        res.status(200).json({
            message: 'All users fetched successfully',
            users: formattedUsers
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
});