const express = require('express');
const router = express.Router();
const Message = require('../models/message');

// Get messages between two users
router.get('/messages/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: user1, targetId: user2 },
        { senderId: user2, targetId: user1 }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

module.exports = router;
