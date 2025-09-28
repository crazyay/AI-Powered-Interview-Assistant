# AI-Powered Interview Assistant

A full-stack web application that provides intelligent interview sessions with AI-generated questions, automated scoring, and comprehensive candidate management.

## 🚀 Features

### Interviewee Experience (Chat UI)
- **Resume Upload**: Support for PDF and DOCX files with automatic parsing
- **Smart Information Extraction**: Automatically extracts Name, Email, and Phone from resume
- **AI-Generated Questions**: 6 tailored coding interview questions for Full Stack development
- **Timed Interviews**: Progressive difficulty with time limits:
  - 2 Easy questions (20 seconds each)
  - 2 Medium questions (60 seconds each) 
  - 2 Hard questions (120 seconds each)
- **Real-time Timer**: Visual countdown with alerts
- **Auto-Submit**: Automatic progression when time expires
- **AI Scoring**: Intelligent assessment with detailed feedback

### Interviewer Dashboard
- **Candidate Management**: View all candidates ordered by score
- **Detailed Analytics**: Individual candidate performance breakdown
- **Search & Filter**: Find candidates by name, email, or score
- **Question History**: Review all answers and AI assessments
- **Export Ready**: Data formatted for easy reporting

### Persistence & Resume
- **Redux Persist**: All interview progress saved locally
- **Resume Interrupted Sessions**: "Welcome Back" modal for unfinished interviews
- **Cross-Session Continuity**: Survive browser refresh and restart

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and development experience
- **TailwindCSS** - Utility-first styling
- **Redux Toolkit** - State management with persistence
- **Lucide React** - Modern icon library
- **React Dropzone** - File upload interface

### Backend  
- **Express.js** - Node.js web framework
- **OpenAI API** - Question generation and answer scoring
- **Multer** - File upload handling
- **Mammoth** - DOCX file parsing
- **UUID** - Unique identifier generation

### Features
- **AI Integration** - OpenAI GPT for questions and scoring
- **File Processing** - PDF and DOCX resume parsing
- **Real-time Updates** - Live timer and progress tracking
- **Responsive Design** - Mobile and desktop optimized

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Gemini API key:
   ```env
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Backend runs on http://localhost:5000

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Environment Configuration**
   ```bash
   echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend runs on http://localhost:3000

## 🎯 Usage Guide

### For Candidates (Interviewees)

1. **Upload Resume**
   - Visit http://localhost:3000
   - Drag & drop or select your PDF/DOCX resume
   - System automatically extracts your information

2. **Verify Information**
   - Review and correct any missing details
   - Ensure Name, Email, and Phone are accurate

3. **Take Interview**
   - Answer 6 progressive difficulty questions
   - Watch the timer - questions auto-submit when time expires
   - Provide thoughtful, technical answers

4. **View Results**
   - Get your final score and AI assessment
   - Review individual question performance
   - See detailed feedback on each answer

### For Interviewers (Dashboard)

1. **Access Dashboard**
   - Visit http://localhost:3000/dashboard
   - View all candidate results in one place

2. **Review Candidates**
   - Sort by score, name, or interview date
   - Search by name or email
   - Click "View Details" for complete interview history

3. **Analyze Performance**
   - Review individual question responses
   - See AI scoring rationale
   - Export data for further analysis

## 🚀 Deployment

### Frontend (Vercel)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Set environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url.com/api`
   - Deploy automatically

### Backend (Render/Heroku)

1. **Prepare for deployment**
   - Ensure all environment variables are set
   - Update CORS settings for production frontend URL

2. **Deploy to Render**
   - Create new Web Service
   - Connect GitHub repository
   - Set environment variables including `GEMINI_API_KEY`
   - Deploy

### Environment Variables

**Backend (.env)**
```env
PORT=5000
FRONTEND_URL=https://your-vercel-app.vercel.app
GEMINI_API_KEY=your-actual-gemini-api-key
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

## 📁 Project Structure

```
AIQuizz/
├── backend/
│   ├── server.js           # Express server with all APIs
│   ├── package.json        # Backend dependencies
│   ├── .env               # Environment variables
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Main interview page
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx       # Dashboard page
│   │   │   ├── layout.tsx         # Root layout
│   │   │   └── globals.css        # Global styles
│   │   ├── components/
│   │   │   ├── FileUpload.tsx     # Resume upload component
│   │   │   ├── CandidateForm.tsx  # Information form
│   │   │   ├── QuestionCard.tsx   # Interview question UI
│   │   │   ├── Timer.tsx          # Countdown timer
│   │   │   ├── ResultsPage.tsx    # Results display
│   │   │   ├── ReduxProvider.tsx  # Redux setup
│   │   │   └── ui/               # Reusable UI components
│   │   └── lib/
│   │       ├── store.ts          # Redux store configuration
│   │       ├── api.ts            # API client functions
│   │       ├── utils.ts          # Utility functions
│   │       └── slices/           # Redux slices
│   ├── package.json        # Frontend dependencies
│   ├── .env.local         # Environment variables
│   └── tailwind.config.ts # Tailwind configuration
└── README.md              # This file
```

## 🔧 API Endpoints

### Resume Processing
- `POST /api/resume/parse` - Parse uploaded resume file

### Interview Management
- `POST /api/interview/start` - Start new interview session
- `GET /api/interview/:id/question` - Get current question
- `POST /api/interview/:id/answer` - Submit answer
- `GET /api/interview/:id/results` - Get final results
- `GET /api/interview/:id/resume` - Resume interrupted interview

### Dashboard
- `GET /api/dashboard/candidates` - Get all candidates with filtering
- `GET /api/dashboard/candidates/:id` - Get candidate details

## 🎨 Features in Detail

### AI Question Generation
- Uses Google Gemini AI for dynamic question generation
- Focuses on Full Stack development (React + Node.js)
- Progressive difficulty scaling
- Contextual and relevant to current tech trends

### Smart Resume Parsing
- Supports PDF and DOCX formats
- Regex-based extraction for Name, Email, Phone
- Graceful fallback for missing information
- File size limits and type validation

### Real-time Timer System
- Visual progress indicators
- Color-coded urgency (green → yellow → red)
- Audio/visual alerts for final seconds
- Automatic submission on timeout

### Persistent State Management
- Redux Toolkit with redux-persist
- Survives browser refresh/restart
- "Welcome Back" modal for interrupted sessions
- Cross-tab synchronization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google for providing the Gemini AI capabilities
- Vercel for seamless frontend deployment
- The React and Node.js communities for excellent tooling

---

**Built with ❤️ for better technical interviews**