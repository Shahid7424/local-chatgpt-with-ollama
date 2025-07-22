const express = require('express'); // ✅ UNCOMMENT THIS
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const chatRoutes = require('./routes/chatRoutes'); // Your route handler

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests
app.use(bodyParser.urlencoded({ extended: true })); // Parses URL-encoded payloads

// Routes
app.use('/api/chats', chatRoutes); // ✅ Handles routes under /api/chats

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
