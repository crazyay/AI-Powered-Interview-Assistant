import { model } from '../config/gemini.js';
import { cleanGeminiResponse } from '../utils/helpers.js';
import { apiCallTracker } from '../utils/apiCallTracker.js';

// Utility function to generate AI questions (MCQ format)
export async function generateInterviewQuestions(candidateInfo = null, testConfig = {}) {
  try {
    const { 
      mode = 'resume', // 'resume' or 'custom'
      topics = [],
      questionCount = 20 
    } = testConfig;

    let contextPrompt = '';
    
    if (mode === 'resume' && candidateInfo?.resumeText) {
      contextPrompt = `
Candidate Background:
Name: ${candidateInfo.name}
Resume/Experience: ${candidateInfo.resumeText}

Generate ${questionCount} questions based on the candidate's background and experience level.`;
    } else if (mode === 'custom' && topics.length > 0) {
      contextPrompt = `
Generate ${questionCount} questions covering the following topics: ${topics.join(', ')}.
Mix of difficulty levels: ${Math.floor(questionCount * 0.3)} Easy, ${Math.floor(questionCount * 0.4)} Medium, ${Math.ceil(questionCount * 0.3)} Hard.`;
    } else {
      // Default to general full-stack questions
      contextPrompt = `
Generate ${questionCount} general Full Stack Developer questions covering React, Node.js, JavaScript, databases, and web development concepts.`;
    }

    const prompt = `Generate ${questionCount} UNIQUE and VARIED multiple choice questions (MCQ) for a technical knowledge test.${contextPrompt}

IMPORTANT INSTRUCTIONS:
1. Generate DIFFERENT questions each time - avoid repetition
2. Vary the difficulty and topics within the requested areas
3. Make questions practical and scenario-based when possible
4. Return ONLY valid JSON without any markdown formatting or code blocks

Required JSON structure:
{
  "questions": [
    {
      "id": 1,
      "difficulty": "easy",
      "question": "question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "brief explanation of correct answer"
    }
  ]
}

Requirements:
- Each question MUST be unique and different from common questions
- Each question must have exactly 4 options
- correctAnswer is the index (0-3) of the correct option
- Include a brief explanation for each answer
- Questions should be clear and unambiguous
- Options should be plausible and not obviously wrong
- Mix theoretical and practical questions
- Avoid basic "what is X" questions - prefer "how", "when", "why" questions
- Return ONLY the JSON object, no other text or formatting

Generation ID: ${Date.now()} (use this to ensure unique questions each time)`;

    console.log(`🎲 Generating ${questionCount} questions for mode: ${mode}, topics: ${topics.join(', ') || 'general'}`);
    
    // Track API call
    apiCallTracker.logCall('generateInterviewQuestions', { 
      mode, 
      topics: topics.join(', '), 
      questionCount 
    });
    
    // Retry logic for rate limiting
    let retries = 3;
    let delay = 2000; // Start with 2 seconds
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Clean the response before parsing
        const cleanedText = cleanGeminiResponse(text);
        console.log('✅ Questions generated successfully');
        
        return JSON.parse(cleanedText);
      } catch (apiError) {
        // Check if it's a rate limit error
        if (apiError.status === 429 && attempt < retries) {
          console.log(`⏳ Rate limit hit. Retrying in ${delay/1000}s... (Attempt ${attempt}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        } else {
          throw apiError; // Re-throw if not rate limit or last attempt
        }
      }
    }
  } catch (error) {
    console.error('❌ Error generating questions:', error.message);
    console.log('⚠️  Using fallback questions - API call failed after retries');
    // Fallback MCQ questions if API fails 
    const fallbackQuestions = [
      {
        id: 1,
        difficulty: "easy",
        question: "What is the difference between let, const, and var in JavaScript?",
        options: [
          "let and const are block-scoped, var is function-scoped",
          "var and const are block-scoped, let is function-scoped",
          "All three are function-scoped",
          "All three are block-scoped"
        ],
        correctAnswer: 0,
        explanation: "let and const are block-scoped (only exist within their block), while var is function-scoped. const also cannot be reassigned."
      },
      {
        id: 2,
        difficulty: "easy",
        question: "What is JSX in React?",
        options: [
          "A JavaScript XML syntax extension",
          "A CSS preprocessor",
          "A database query language",
          "A Node.js framework"
        ],
        correctAnswer: 0,
        explanation: "JSX is a syntax extension for JavaScript that allows writing HTML-like code in React components."
      },
      {
        id: 3,
        difficulty: "medium",
        question: "What does the useEffect hook do in React?",
        options: [
          "Manages component state",
          "Handles side effects and lifecycle events",
          "Creates context providers",
          "Optimizes rendering performance"
        ],
        correctAnswer: 1,
        explanation: "useEffect handles side effects like API calls, subscriptions, and replaces lifecycle methods like componentDidMount."
      },
      {
        id: 4,
        difficulty: "medium",
        question: "Which of the following is NOT a way to handle asynchronous operations in Node.js?",
        options: [
          "Callbacks",
          "Promises",
          "Async/Await",
          "Synchronous loops"
        ],
        correctAnswer: 3,
        explanation: "Synchronous loops block execution. Node.js uses callbacks, promises, and async/await for non-blocking async operations."
      },
      {
        id: 5,
        difficulty: "hard",
        question: "In a RESTful API, which HTTP method should be used to update a partial resource?",
        options: [
          "PUT",
          "PATCH",
          "POST",
          "UPDATE"
        ],
        correctAnswer: 1,
        explanation: "PATCH is used for partial updates, while PUT replaces the entire resource. UPDATE is not a valid HTTP method."
      },
      {
        id: 6,
        difficulty: "hard",
        question: "Which React optimization technique prevents unnecessary re-renders?",
        options: [
          "useState only",
          "React.memo and useMemo",
          "componentWillMount",
          "forceUpdate()"
        ],
        correctAnswer: 1,
        explanation: "React.memo memoizes components, useMemo memoizes values, and useCallback memoizes functions to prevent unnecessary re-renders."
      },
      {
        id: 7,
        difficulty: "easy",
        question: "What is the purpose of package.json in a Node.js project?",
        options: [
          "To store environment variables",
          "To manage project dependencies and metadata",
          "To configure the database",
          "To define routing rules"
        ],
        correctAnswer: 1,
        explanation: "package.json contains project metadata, dependencies, scripts, and configuration for Node.js projects."
      },
      {
        id: 8,
        difficulty: "medium",
        question: "What is the difference between SQL and NoSQL databases?",
        options: [
          "SQL is faster than NoSQL",
          "SQL uses structured tables, NoSQL uses flexible documents/key-value pairs",
          "NoSQL cannot handle large data",
          "SQL is only for web applications"
        ],
        correctAnswer: 1,
        explanation: "SQL databases use structured schemas with tables and relations, while NoSQL databases offer flexible, schema-less data models."
      },
      {
        id: 9,
        difficulty: "hard",
        question: "What is the event loop in Node.js?",
        options: [
          "A loop that handles user events",
          "A mechanism that handles asynchronous callbacks and non-blocking I/O",
          "A database query optimizer",
          "A debugging tool"
        ],
        correctAnswer: 1,
        explanation: "The event loop allows Node.js to perform non-blocking I/O operations by offloading operations to the system kernel when possible."
      },
      {
        id: 10,
        difficulty: "medium",
        question: "What is the purpose of middleware in Express.js?",
        options: [
          "To style HTML pages",
          "To process requests before they reach route handlers",
          "To store session data",
          "To compile TypeScript"
        ],
        correctAnswer: 1,
        explanation: "Middleware functions have access to request and response objects and can execute code, modify them, or end the request-response cycle."
      },
      {
        id: 11,
        difficulty: "easy",
        question: "What does CSS stand for?",
        options: [
          "Computer Style Sheets",
          "Cascading Style Sheets",
          "Creative Style System",
          "Colorful Style Sheets"
        ],
        correctAnswer: 1,
        explanation: "CSS (Cascading Style Sheets) is used to style and layout web pages."
      },
      {
        id: 12,
        difficulty: "medium",
        question: "What is JWT used for?",
        options: [
          "Database encryption",
          "Securely transmitting information between parties as a JSON object",
          "Styling web pages",
          "Compiling JavaScript"
        ],
        correctAnswer: 1,
        explanation: "JWT (JSON Web Token) is used for secure authentication and information exchange between client and server."
      },
      {
        id: 13,
        difficulty: "hard",
        question: "What is the purpose of Redux in React applications?",
        options: [
          "To style components",
          "To manage global application state",
          "To make HTTP requests",
          "To compile JSX"
        ],
        correctAnswer: 1,
        explanation: "Redux is a predictable state container that helps manage and centralize application state across components."
      },
      {
        id: 14,
        difficulty: "easy",
        question: "What is the purpose of the 'key' prop in React lists?",
        options: [
          "To style list items",
          "To help React identify which items have changed, added, or removed",
          "To encrypt data",
          "To define list order"
        ],
        correctAnswer: 1,
        explanation: "Keys help React identify which items have changed, are added, or removed, optimizing the rendering process."
      },
      {
        id: 15,
        difficulty: "medium",
        question: "What is CORS in web development?",
        options: [
          "A CSS framework",
          "Cross-Origin Resource Sharing - a security mechanism",
          "A database query language",
          "A JavaScript compiler"
        ],
        correctAnswer: 1,
        explanation: "CORS is a security feature that allows or restricts resources on a web page to be requested from another domain."
      },
      {
        id: 16,
        difficulty: "hard",
        question: "What is the difference between authentication and authorization?",
        options: [
          "They are the same thing",
          "Authentication verifies identity, authorization determines permissions",
          "Authorization is faster",
          "Authentication is only for databases"
        ],
        correctAnswer: 1,
        explanation: "Authentication verifies who you are (login), while authorization determines what you're allowed to do (permissions)."
      },
      {
        id: 17,
        difficulty: "medium",
        question: "What is the virtual DOM in React?",
        options: [
          "A real browser DOM",
          "A lightweight copy of the actual DOM kept in memory",
          "A database structure",
          "A CSS preprocessor"
        ],
        correctAnswer: 1,
        explanation: "Virtual DOM is a programming concept where a virtual representation of the UI is kept in memory and synced with the real DOM."
      },
      {
        id: 18,
        difficulty: "easy",
        question: "What is npm?",
        options: [
          "A programming language",
          "Node Package Manager - a package manager for JavaScript",
          "A database system",
          "A CSS framework"
        ],
        correctAnswer: 1,
        explanation: "npm is the default package manager for Node.js, used to install and manage JavaScript packages."
      },
      {
        id: 19,
        difficulty: "hard",
        question: "What is closure in JavaScript?",
        options: [
          "A way to close windows",
          "A function that has access to variables in its outer scope",
          "A database transaction",
          "A CSS property"
        ],
        correctAnswer: 1,
        explanation: "A closure is a function that retains access to variables from its outer scope even after the outer function has returned."
      },
      {
        id: 20,
        difficulty: "medium",
        question: "What is the purpose of async/await in JavaScript?",
        options: [
          "To style components",
          "To write asynchronous code that looks synchronous",
          "To create databases",
          "To compile TypeScript"
        ],
        correctAnswer: 1,
        explanation: "async/await is syntactic sugar over Promises, making asynchronous code easier to write and read."
      }
    ];
    
    // Shuffle and return random subset
    const shuffled = [...fallbackQuestions].sort(() => Math.random() - 0.5);
    const questionCount = testConfig?.questionCount || 20;
    const questions = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    
    // Re-number the questions
    questions.forEach((q, index) => {
      q.id = index + 1;
    });
    
    return { questions };
  }
}

// Utility function to score an MCQ answer (simplified - just check if correct)
export async function scoreAnswer(question, selectedOption, correctAnswer) {
  try {
    // Ensure both are numbers for proper comparison
    const selected = parseInt(selectedOption);
    const correct = parseInt(correctAnswer);
    
    console.log(`📊 MCQ Scoring: Selected=${selected} (${typeof selected}), Correct=${correct} (${typeof correct})`);
    
    // For MCQ, scoring is simple: correct = 1 mark, wrong = 0 marks
    const isCorrect = selected === correct;
    const score = isCorrect ? 1 : 0;
    
    console.log(`   Result: ${isCorrect ? '✅ CORRECT' : '❌ WRONG'} - Score=${score}`);
    return score;
    
  } catch (error) {
    console.error('Error scoring answer:', error);
    return 0;
  }
}

// Generate AI summary for MCQ test
export async function generateInterviewSummary(candidateInfo, answers, totalScore) {
  console.log(`📋 Generating summary for ${candidateInfo.name} with score ${totalScore}/${answers.length}`);
  
  // Track API call
  apiCallTracker.logCall('generateInterviewSummary', { 
    candidate: candidateInfo.name,
    totalQuestions: answers.length,
    totalScore 
  });
  
  // Calculate statistics
  const totalQuestions = answers.length;
  const correctAnswers = answers.filter(a => a.score === 1).length;
  const wrongAnswers = totalQuestions - correctAnswers;
  const percentage = ((correctAnswers / totalQuestions) * 100).toFixed(1);
  
  const summaryPrompt = `Generate a concise test summary based on performance:

Candidate: ${candidateInfo.name}
Total Questions: ${totalQuestions}
Correct Answers: ${correctAnswers}
Wrong Answers: ${wrongAnswers}
Score Percentage: ${percentage}%

Provide a brief 2-3 sentence summary that:
1. States the overall performance level
2. Mentions strong areas if applicable
3. Suggests improvement areas if score is below 70%

Be encouraging but honest.`;

  try {
    const result = await model.generateContent(summaryPrompt);
    const response = await result.response;
    let summary = response.text().trim();
    
    // Clean the summary response
    summary = summary.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '').trim();
    
    console.log(`📄 Generated Summary: ${summary}`);
    return summary;
    
  } catch (error) {
    console.error('Error generating summary:', error);
    
    // Fallback summary based on performance
    let summary = `Test completed with ${correctAnswers} out of ${totalQuestions} questions answered correctly (${percentage}%). `;
    
    if (percentage >= 80) {
      summary += 'Excellent performance! Strong grasp of the concepts tested.';
    } else if (percentage >= 60) {
      summary += 'Good performance with room for improvement in some areas.';
    } else if (percentage >= 40) {
      summary += 'Moderate performance. Consider reviewing the topics for better understanding.';
    } else {
      summary += 'Needs improvement. Focus on fundamentals and practice more.';
    }
    
    return summary;
  }
}