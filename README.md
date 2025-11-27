# AI Chat Portal

A full-stack web application for intelligent chat management with AI integration, conversation storage, and context-aware analysis of chat histories.

## 🚀 Features

- **Multi-AI Provider Support**: Integrate with OpenAI, Claude, Gemini, or LM Studio
- **Conversation Management**: Store, organize, and search through chat histories
- **Intelligent Analysis**: Generate summaries and insights from conversations
- **Natural Language Queries**: Ask questions about your past conversations
- **Modern UI**: Beautiful, responsive interface with dark mode support
- **Real-time Chat**: Seamless messaging experience with AI assistants
- **Analytics Dashboard**: Visualize conversation statistics and trends

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: OpenAI, Anthropic Claude, Google Gemini, LM Studio

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Date Formatting**: date-fns

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **MongoDB** (v6 or higher) - Running locally or MongoDB Atlas
- **npm** or **yarn**

## 🔧 Installation

### 1. Clone the repository

```bash
cd chat-summarizer
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai-chat-portal
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# Add at least one AI provider API key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GOOGLE_API_KEY=your-google-api-key

# For LM Studio (if using local LLM)
LM_STUDIO_URL=http://localhost:1234/v1

FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Start MongoDB

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or if using MongoDB as a service
sudo systemctl start mongod
```

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📖 Usage

### 1. Register an Account
- Navigate to `http://localhost:5173`
- Click "Sign Up" and create an account
- You'll be automatically logged in

### 2. Start Chatting
- Click "New Chat" to start a conversation
- Select your preferred AI provider from the dropdown
- Type your message and press Send
- Your conversations are automatically saved

### 3. Manage Conversations
- View all conversations in the left sidebar
- Click on any conversation to continue it
- Search conversations using the search bar
- Delete conversations by clicking the trash icon

### 4. Analyze Conversations
- Navigate to "Analytics" from the top menu
- View conversation statistics and insights
- Use the query interface to ask questions about your chat history
- Example: "What did we discuss about machine learning?"

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/preferences` - Update user preferences

### Chat
- `POST /api/chat` - Send message and get AI response
- `GET /api/chat/conversations` - Get all conversations
- `GET /api/chat/conversations/:id` - Get specific conversation
- `PUT /api/chat/conversations/:id` - Update conversation
- `DELETE /api/chat/conversations/:id` - Delete conversation

### Analysis
- `POST /api/analysis/summarize/:conversationId` - Generate summary
- `POST /api/analysis/analyze/:conversationId` - Analyze conversation
- `POST /api/analysis/query` - Query chat history
- `GET /api/analysis/insights` - Get overall insights

## 🎨 Features in Detail

### AI Provider Support

The application supports multiple AI providers:

1. **OpenAI** (GPT-3.5, GPT-4)
2. **Anthropic Claude** (Claude 3.5 Sonnet)
3. **Google Gemini** (Gemini 1.5 Flash/Pro)
4. **LM Studio** (Local LLMs)

### Conversation Analysis

- **Automatic Summarization**: Generate concise summaries of conversations
- **Topic Extraction**: Identify main topics discussed
- **Auto-tagging**: Automatically tag conversations based on content
- **Sentiment Analysis**: Understand the tone of conversations

### Analytics Dashboard

- Total conversation and message counts
- Average messages per conversation
- Top tags and categories
- AI provider usage statistics
- Recent activity timeline

## 🔒 Security

- Passwords are hashed using bcrypt
- JWT tokens for secure authentication
- Protected API routes
- Environment variables for sensitive data
- CORS configuration for frontend-backend communication

## 🎨 UI/UX Features

- **Glassmorphism Design**: Modern, premium aesthetic
- **Dark Mode**: Full dark mode support with system preference detection
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Micro-interactions for better UX
- **Loading States**: Clear feedback during async operations
- **Error Handling**: User-friendly error messages

## 📝 Environment Variables

### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (default: 5000) |
| MONGODB_URI | MongoDB connection string | Yes |
| JWT_SECRET | Secret for JWT signing | Yes |
| OPENAI_API_KEY | OpenAI API key | Optional* |
| ANTHROPIC_API_KEY | Anthropic API key | Optional* |
| GOOGLE_API_KEY | Google API key | Optional* |
| LM_STUDIO_URL | LM Studio endpoint | Optional* |

*At least one AI provider key is required

### Frontend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| VITE_API_URL | Backend API URL | Yes |

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network connectivity

### AI Provider Errors
- Verify API keys are correct
- Check API rate limits
- Ensure sufficient credits/quota

### Frontend Build Issues
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify all dependencies are installed

## 📄 License

ISC

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- OpenAI for GPT models
- Anthropic for Claude
- Google for Gemini
- The open-source community

---

Built with ❤️ using React, Express, and MongoDB
