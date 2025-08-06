const express = require('express');
const router = express.Router();
const geminiController = require('../controllers/gemini.controller');

// Route để gửi tin nhắn đến Gemini AI
router.post('/chat', geminiController.sendMessage);

module.exports = router;