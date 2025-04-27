const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
  
    lastName: {
        type: String,
        required: true,
        trim: true
    },
  
    profileImg: {
        type: String,
        default: 'default-avatar.png'
    },
   
});



const User = mongoose.model('User', userSchema);

module.exports = User; 