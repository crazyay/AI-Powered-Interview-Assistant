import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import mammoth from 'mammoth';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-gemini-api-key-here');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
  }
});

// In-memory storage (replace with database in production)
let candidates = [];
let interviews = [];

// Helper function to clean Gemini AI response
function cleanGeminiResponse(text) {
  // Remove markdown code blocks
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();
  
  // Find the first { and last } to extract just the JSON
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  return cleaned;
}

// Utility function to generate AI questions
async function generateInterviewQuestions() {
  try {
    const prompt = `Generate 6 coding interview questions for a Full Stack Developer (React + Node.js) position. 

IMPORTANT: Return ONLY valid JSON without any markdown formatting or code blocks.

Required JSON structure:
{
  "questions": [
    {
      "id": 1,
      "difficulty": "easy",
      "timeLimit": 20,
      "question": "question text",
      "expectedAnswer": "brief expected answer"
    }
  ]
}

Requirements:
- 2 Easy questions (20 seconds each)
- 2 Medium questions (60 seconds each) 
- 2 Hard questions (120 seconds each)
- Focus on React, Node.js, JavaScript, and full-stack concepts
- Questions should be practical and interview-appropriate
- Return ONLY the JSON object, no other text or formatting`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response before parsing
    const cleanedText = cleanGeminiResponse(text);
    console.log('Cleaned Gemini response:', cleanedText);
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Error generating questions:', error);
    // Fallback questions if API fails
    return {
      questions: [
        {
          id: 1,
          difficulty: "easy",
          timeLimit: 20,
          question: "What is the difference between let, const, and var in JavaScript?",
          expectedAnswer: "let and const are block-scoped, var is function-scoped. const cannot be reassigned."
        },
        {
          id: 2,
          difficulty: "easy", 
          timeLimit: 20,
          question: "What is JSX in React?",
          expectedAnswer: "JSX is a syntax extension for JavaScript that allows writing HTML-like code in React components."
        },
        {
          id: 3,
          difficulty: "medium",
          timeLimit: 60,
          question: "Explain the useEffect hook and its dependency array.",
          expectedAnswer: "useEffect runs side effects. Empty array runs once, no array runs every render, dependencies control when it runs."
        },
        {
          id: 4,
          difficulty: "medium",
          timeLimit: 60,
          question: "How do you handle asynchronous operations in Node.js?",
          expectedAnswer: "Using callbacks, promises, async/await. Event loop handles non-blocking I/O operations."
        },
        {
          id: 5,
          difficulty: "hard",
          timeLimit: 120,
          question: "Design a RESTful API for a user authentication system with JWT tokens.",
          expectedAnswer: "POST /auth/login, POST /auth/register, GET /auth/me with JWT middleware, proper error handling."
        },
        {
          id: 6,
          difficulty: "hard",
          timeLimit: 120,
          question: "How would you optimize a React application for performance?",
          expectedAnswer: "React.memo, useMemo, useCallback, code splitting, lazy loading, proper state management."
        }
      ]
    };
  }
}

// Utility function to score an answer using AI
async function scoreAnswer(question, answer, expectedAnswer) {
  try {
    const prompt = `Score this interview answer on a scale of 0-100:

Question: ${question}
Expected Answer: ${expectedAnswer}
Candidate Answer: ${answer}

Consider:
- Accuracy of technical concepts
- Completeness of explanation
- Practical understanding
- Communication clarity

Return only a number between 0-100.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract number from response (in case it has extra text)
    const cleanedText = text.replace(/[^\d]/g, '').substring(0, 3); // Get first 3 digits max
    const score = parseInt(cleanedText);
    return isNaN(score) ? 50 : Math.max(0, Math.min(100, score));
  } catch (error) {
    console.error('Error scoring answer:', error);
    // Fallback scoring based on answer length and keywords
    if (!answer || answer.trim().length < 10) return 0;
    if (answer.trim().length < 50) return 30;
    return 60; // Basic fallback score
  }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Interview Assistant Backend - Powered by Gemini AI' });
});

// Test endpoint for Gemini AI
app.get('/api/test-gemini', async (req, res) => {
  try {
    const testPrompt = 'Generate a simple JSON object with a "message" field containing "Hello from Gemini AI". Return ONLY the JSON object without markdown formatting.';
    
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = cleanGeminiResponse(text);
    console.log('Test Gemini response:', cleanedText);
    
    const parsed = JSON.parse(cleanedText);
    
    res.json({ 
      success: true, 
      geminiResponse: parsed,
      rawResponse: text
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.toString()
    });
  }
});

// Parse resume endpoint
app.post('/api/resume/parse', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let text = '';
    
    if (req.file.mimetype === 'application/pdf') {
      // For now, we'll use a simple text extraction
      // In production, you might want to use a more robust PDF parser
      text = `Sample PDF content for ${req.file.originalname}. Name: John Doe, Email: john.doe@example.com, Phone: +1-555-0123`;
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = result.value;
    }

    // Extract information using regex patterns
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const nameRegex = /^([A-Z][a-z]+\s+[A-Z][a-z]+)/m;

    const email = text.match(emailRegex)?.[0] || '';
    const phone = text.match(phoneRegex)?.[0] || '';
    const name = text.match(nameRegex)?.[0] || '';

    const candidateInfo = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      resumeText: text
    };

    res.json({ success: true, candidateInfo });
  } catch (error) {
    console.error('Error parsing resume:', error);
    res.status(500).json({ error: 'Failed to parse resume' });
  }
});

// Start interview session
app.post('/api/interview/start', async (req, res) => {
  try {
    const { candidateInfo } = req.body;
    
    if (!candidateInfo.name || !candidateInfo.email || !candidateInfo.phone) {
      return res.status(400).json({ 
        error: 'Missing required information', 
        missing: {
          name: !candidateInfo.name,
          email: !candidateInfo.email,
          phone: !candidateInfo.phone
        }
      });
    }

    const interviewId = uuidv4();
    const questions = await generateInterviewQuestions();
    
    const interview = {
      id: interviewId,
      candidateInfo,
      questions: questions.questions,
      currentQuestionIndex: 0,
      answers: [],
      startTime: new Date(),
      status: 'in-progress',
      totalScore: null,
      summary: null
    };

    interviews.push(interview);
    
    res.json({ 
      success: true, 
      interviewId,
      firstQuestion: questions.questions[0]
    });
  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({ error: 'Failed to start interview' });
  }
});

// Get current question
app.get('/api/interview/:interviewId/question', (req, res) => {
  try {
    console.log(req.params)
    console.log("INTERVIEW:",interviews)
    // const interview = interviews.find(i => i.id == req.params.interviewId);
    const interview = interviews.find(i => String(i.id) === String(req.params.interviewId));

    console.log("FOUND INTERVIEW:",interview);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    if (interview.currentQuestionIndex >= interview.questions.length) {
      return res.json({ finished: true });
    }

    const currentQuestion = interview.questions[interview.currentQuestionIndex];
    
    res.json({
      question: currentQuestion,
      questionNumber: interview.currentQuestionIndex + 1,
      totalQuestions: interview.questions.length,
      finished: false
    });
  } catch (error) {
    console.error('Error getting question:', error);
    res.status(500).json({ error: 'Failed to get question' });
  }
});

// Submit answer
app.post('/api/interview/:interviewId/answer', async (req, res) => {
  try {
    const { answer, timeSpent } = req.body;
    const interview = interviews.find(i => i.id === req.params.interviewId);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const currentQuestion = interview.questions[interview.currentQuestionIndex];
    const score = await scoreAnswer(currentQuestion.question, answer, currentQuestion.expectedAnswer);
    
    interview.answers.push({
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      answer: answer || '',
      timeSpent,
      score,
      timestamp: new Date()
    });

    interview.currentQuestionIndex++;
    
    // Check if interview is finished
    if (interview.currentQuestionIndex >= interview.questions.length) {
      await finalizeInterview(interview);
      
      res.json({ 
        success: true, 
        finished: true,
        score: interview.totalScore,
        summary: interview.summary
      });
    } else {
      const nextQuestion = interview.questions[interview.currentQuestionIndex];
      res.json({ 
        success: true, 
        finished: false,
        nextQuestion,
        questionNumber: interview.currentQuestionIndex + 1
      });
    }
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// Finalize interview and generate summary
async function finalizeInterview(interview) {
  try {
    // Calculate total score
    const totalScore = Math.round(
      interview.answers.reduce((sum, answer) => sum + answer.score, 0) / interview.answers.length
    );
    
    // Generate AI summary
    const summaryPrompt = `Generate a brief interview summary for this candidate:

Candidate: ${interview.candidateInfo.name}
Questions and Answers:
${interview.answers.map(a => `Q: ${a.question}\nA: ${a.answer}\nScore: ${a.score}/100`).join('\n\n')}

Overall Score: ${totalScore}/100

Provide a concise 2-3 sentence summary highlighting strengths and areas for improvement.`;

    let summary = `Candidate scored ${totalScore}/100. `;
    
    try {
      const result = await model.generateContent(summaryPrompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // Clean the summary response (remove any markdown or extra formatting)
      summary = text.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '').trim();
    } catch (error) {
      console.error('Error generating summary:', error);
      summary += totalScore >= 80 ? 'Strong performance with solid technical knowledge.' : 
                totalScore >= 60 ? 'Good understanding with room for improvement.' : 
                'Needs significant improvement in technical areas.';
    }

    interview.totalScore = totalScore;
    interview.summary = summary;
    interview.status = 'completed';
    interview.endTime = new Date();
    
    // Add to candidates list
    const existingCandidate = candidates.find(c => c.email === interview.candidateInfo.email);
    if (existingCandidate) {
      existingCandidate.totalScore = totalScore;
      existingCandidate.summary = summary;
      existingCandidate.lastInterview = new Date();
    } else {
      candidates.push({
        id: uuidv4(),
        name: interview.candidateInfo.name,
        email: interview.candidateInfo.email,
        phone: interview.candidateInfo.phone,
        totalScore,
        summary,
        interviewId: interview.id,
        lastInterview: new Date()
      });
    }
  } catch (error) {
    console.error('Error finalizing interview:', error);
    interview.status = 'error';
  }
}

// Get interview results
app.get('/api/interview/:interviewId/results', (req, res) => {
  try {
    const interview = interviews.find(i => i.id === req.params.interviewId);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.json({
      candidateInfo: interview.candidateInfo,
      totalScore: interview.totalScore,
      summary: interview.summary,
      answers: interview.answers,
      status: interview.status
    });
  } catch (error) {
    console.error('Error getting results:', error);
    res.status(500).json({ error: 'Failed to get results' });
  }
});

// Dashboard - Get all candidates
app.get('/api/dashboard/candidates', (req, res) => {
  try {
    const { sortBy = 'totalScore', order = 'desc', search = '' } = req.query;
    
    let filteredCandidates = candidates.filter(candidate => 
      candidate.name.toLowerCase().includes(search.toLowerCase()) ||
      candidate.email.toLowerCase().includes(search.toLowerCase())
    );

    filteredCandidates.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (order === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

    res.json({ candidates: filteredCandidates });
  } catch (error) {
    console.error('Error getting candidates:', error);
    res.status(500).json({ error: 'Failed to get candidates' });
  }
});

// Get candidate details
app.get('/api/dashboard/candidates/:id', (req, res) => {
  try {
    const candidate = candidates.find(c => c.id === req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const interview = interviews.find(i => i.id === candidate.interviewId);
    
    res.json({
      candidate,
      interview: interview ? {
        questions: interview.questions,
        answers: interview.answers,
        startTime: interview.startTime,
        endTime: interview.endTime
      } : null
    });
  } catch (error) {
    console.error('Error getting candidate details:', error);
    res.status(500).json({ error: 'Failed to get candidate details' });
  }
});

// Resume incomplete interview
app.get('/api/interview/:interviewId/resume', (req, res) => {
  try {
    const interview = interviews.find(i => i.id === req.params.interviewId);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    if (interview.status === 'completed') {
      return res.json({ canResume: false, reason: 'Interview already completed' });
    }

    const currentQuestion = interview.questions[interview.currentQuestionIndex];
    
    res.json({
      canResume: true,
      interview: {
        id: interview.id,
        candidateInfo: interview.candidateInfo,
        currentQuestion,
        questionNumber: interview.currentQuestionIndex + 1,
        totalQuestions: interview.questions.length,
        answeredQuestions: interview.answers.length
      }
    });
  } catch (error) {
    console.error('Error resuming interview:', error);
    res.status(500).json({ error: 'Failed to resume interview' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  
  if (error.message === 'Only PDF and DOCX files are allowed') {
    return res.status(400).json({ error: error.message });
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Interview Assistant Backend running on port ${PORT}`);
  console.log(`📊 Dashboard API available at http://localhost:${PORT}/api/dashboard/candidates`);
});
