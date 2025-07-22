// server.js
const express = require("express");
const cors = require("cors");
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Route imports
const chatRoutes = require("./routes/chatRoutes");
const ollamaRoutes = require("./routes/ollama");

// Use routes
app.use("/api/chats", chatRoutes);
app.use("/api/ollama", ollamaRoutes);

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Chat API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});