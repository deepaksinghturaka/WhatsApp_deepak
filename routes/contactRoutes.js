const express = require('express');
const router = express.Router();

// Get all contacts
 
router.post('/create', async (req, res) => {
    try {
        const contact = new Contact({
            name: req.body.name,
            phone: req.body.phone,
           
        });
        const newContact = await contact.save();
        res.status(201).json(newContact);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


router.get('/allcontects', async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//
module.exports = router; 