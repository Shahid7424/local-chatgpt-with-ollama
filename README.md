
Local ChatGPT Clone using Ollama + PostgreSQL

# Tech Stack
Frontend: Next.js, React, Tailwind CSS

Backend: Node.js, Express

Database: PostgreSQL

LLM: Ollama (gemma3:1b)

# Setup Instructions
bash
Copy
Edit
# 1. Clone repo
git clone https://github.com/your-username/chat-app.git && cd chat-app

# 2. Start PostgreSQL & run schema
psql -U postgres -d chatapp -f database/schema.sql

# 3. Run Ollama (already installed)
ollama run gemma3:1b

# 4. Backend
cd backend
npm install
npm run dev

# 5. Frontend
cd frontend
npm install
npm run dev
# Assumptions
Only 1 user/session at a time

No authentication implemented

Ollama must be running locally on port 11434
# Features
Chat interface with streaming responses

New chat button

Message persistence to PostgreSQL

Powered by local LLM (gemma3:1b)

#-- database/schema.sql
CREATE TABLE chats (
  id SERIAL PRIMARY KEY,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
