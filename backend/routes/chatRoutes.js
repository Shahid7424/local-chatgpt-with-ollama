// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all chats
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM chats ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get chats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// GET specific chat with messages
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get chat info
    const chatResult = await pool.query('SELECT * FROM chats WHERE id = $1', [id]);
    if (chatResult.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Get messages for this chat
    const messagesResult = await pool.query(
      'SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
      [id]
    );

    res.json({
      chat: chatResult.rows[0],
      messages: messagesResult.rows
    });
  } catch (err) {
    console.error('Get chat error:', err.message);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// POST create new chat
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await pool.query(
      'INSERT INTO chats (title) VALUES ($1) RETURNING *',
      [title]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create chat error:', err.message);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// POST add message to chat
router.post('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, content } = req.body;

    if (!role || !content) {
      return res.status(400).json({ error: 'Role and content are required' });
    }

    const result = await pool.query(
      'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3) RETURNING *',
      [id, role, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Add message error:', err.message);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

module.exports = router;