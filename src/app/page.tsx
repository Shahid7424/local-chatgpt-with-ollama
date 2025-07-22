"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Plus, 
  MessageCircle, 
  StopCircle, 
  Trash2, 
  Edit3,
  Bot,
  User,
  Loader2,
  Menu,
  X
} from 'lucide-react';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

const ChatGPTClone = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChats = async () => {
    const mockChats: Chat[] = [
      { id: '1', title: 'React Development Tips', created_at: new Date().toISOString() },
      { id: '2', title: 'Python Data Analysis', created_at: new Date().toISOString() },
      { id: '3', title: 'Machine Learning Basics', created_at: new Date().toISOString() },
    ];
    setChats(mockChats);
  };

  const fetchMessages = async (chatId: string) => {
    const mockMessages: Message[] = [];
    setMessages(mockMessages);
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (currentChatId) {
      fetchMessages(currentChatId);
    }
  }, [currentChatId]);

  const createNewChat = async () => {
    const newChatId = Math.random().toString(36).substr(2, 9);
    const newChat: Chat = {
      id: newChatId,
      title: 'New Chat',
      created_at: new Date().toISOString()
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setMessages([]);
    setSidebarOpen(false);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsStreaming(true);

    const assistantMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, assistantMessage]);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gemma3:1b', prompt: inputMessage, stream: true }),
        signal: abortControllerRef.current.signal
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader!.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: true });

        const lines = chunk.split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            const token = data.response;
            setMessages(prev =>
              prev.map(msg =>
                msg.id === assistantMessage.id
                  ? { ...msg, content: msg.content + token }
                  : msg
              )
            );
          } catch (err) {
            console.error('JSON parse error:', err);
          }
        }
      }
    } catch (err) {
      if ((err as any).name !== 'AbortError') {
        console.error('Fetch error:', err);
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const stopGeneration = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
    setIsLoading(false);
  };

  const deleteChat = async (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
      setMessages([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 
        border-r border-gray-200 dark:border-gray-700 transform transition-transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                Local ChatGPT 
              </h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={createNewChat}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 
                         bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              Recent Chats
            </h2>
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`
                    group flex items-center justify-between p-3 rounded-lg cursor-pointer
                    transition-colors hover:bg-gray-100 dark:hover:bg-gray-700
                    ${currentChatId === chat.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''}
                  `}
                  onClick={() => {
                    setCurrentChatId(chat.id);
                    setSidebarOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                        {chat.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(chat.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Edit functionality
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {currentChatId ? chats.find(c => c.id === currentChatId)?.title || 'Chat' : 'Select a chat to start'}
            </h2>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentChatId ? (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`
                    max-w-2xl px-4 py-3 rounded-2xl
                    ${message.role === 'user' 
                      ? 'bg-blue-600 text-white ml-12' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white mr-12'
                    }
                  `}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-2 opacity-70 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="max-w-2xl px-4 py-3 rounded-2xl bg-gray-200 dark:bg-gray-700 mr-12">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-gray-600 dark:text-gray-300">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  Welcome to ChatGPT Clone
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Select a chat from the sidebar or create a new one to get started
                </p>
                <button
                  onClick={createNewChat}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 
                           text-white rounded-lg transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        {currentChatId && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-4 items-end">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message here..."
                    className="w-full p-4 pr-12 border border-gray-300 dark:border-gray-600 
                             rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                    rows={Math.min(inputMessage.split('\n').length, 4)}
                    disabled={isLoading}
                  />
                </div>
                
                {isStreaming ? (
                  <button
                    onClick={stopGeneration}
                    className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl 
                             transition-colors flex items-center gap-2 font-medium"
                  >
                    <StopCircle className="w-5 h-5" />
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
                             text-white rounded-xl transition-colors flex items-center gap-2 font-medium
                             disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    Send
                  </button>
                )}
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Press Enter to send, Shift + Enter for new line
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatGPTClone;