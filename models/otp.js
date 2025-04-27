const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: String,
        required: true
    },
    otpExpiration: {
        type: Date,
       default: Date.now,
       get:(otpExpiration)=> otpExpiration.getTime(),
       set:(otpExpiration)=> new Date(otpExpiration)
    }
});

// Index for faster queries
  
module.exports = mongoose.model('Otp',otpSchema); 