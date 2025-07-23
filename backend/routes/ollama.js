const express = require('express');
const axios = require('axios');
const router = express.Router();

// POST /api/ollama
router.post('/', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }

  try {
    const response = await axios.post(
      'http://localhost:11434/api/chat',
      {
        model: 'gemma3:1b',
        messages: messages,
        stream: false,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000, // 30 second timeout
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Ollama API Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({ error: 'Ollama server is not running. Please start Ollama first.' });
    } else {
      res.status(500).json({ error: 'Ollama request failed: ' + error.message });
    }
  }
});

module.exports = router;