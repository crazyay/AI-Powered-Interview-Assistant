import { model } from '../config/gemini.js';
import { cleanGeminiResponse } from '../utils/helpers.js';

// Utility function to generate AI questions
export async function generateInterviewQuestions(candidateInfo = null) {
  try {
    // Build personalized prompt based on resume data
    let candidateContext = '';
    if (candidateInfo && candidateInfo.resumeText) {
      candidateContext = `

Candidate Background:
Name: ${candidateInfo.name}
Resume/Experience: ${candidateInfo.resumeText}

Please customize the questions based on the candidate's background and experience level mentioned in their resume. Make questions more relevant to their stated experience.`;
    }

    const prompt = `Generate 6 coding interview questions for a Full Stack Developer (React + Node.js) position.${candidateContext}

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
- Questions should be practical and interview-appropriate${candidateInfo?.resumeText ? '\n- Tailor difficulty and topics based on candidate experience' : ''}
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
export async function scoreAnswer(question, answer, expectedAnswer) {
  try {
    // Pre-validation for empty or minimal answers
    if (!answer || answer.trim().length === 0) {
      console.log('❌ Empty answer - Score: 0');
      return 0;
    }
    
    if (answer.trim().length < 5) {
      console.log('❌ Too short answer - Score: 5');
      return 5;
    }

    const prompt = `You are a strict technical interviewer. Score this answer from 0-100 based on STRICT criteria:

QUESTION: ${question}
EXPECTED ANSWER: ${expectedAnswer}
CANDIDATE ANSWER: ${answer}

SCORING RULES (BE VERY STRICT):
- 0-20: Wrong, irrelevant, or shows no understanding
- 21-40: Partially correct but missing key concepts or has major errors  
- 41-60: Generally correct but incomplete or lacks depth
- 61-80: Good answer covering most key points with minor gaps
- 81-100: Excellent, complete, accurate answer with good understanding

CRITICAL EVALUATION CRITERIA:
1. Technical Accuracy (40%): Are the technical facts correct?
2. Completeness (30%): Does it address all parts of the question?
3. Understanding (20%): Shows deep conceptual understanding?
4. Clarity (10%): Is the explanation clear and well-structured?

BE HARSH - Most answers should score 40-70. Only exceptional answers deserve 80+.
Empty or vague answers should score 0-20.

Return ONLY the numeric score (0-100), nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    console.log('🤖 AI Scoring Response:', text);
    
    // Extract number from response more carefully
    const numbers = text.match(/\b(\d{1,3})\b/g);
    let score = 0;
    
    if (numbers && numbers.length > 0) {
      // Take the first valid number found
      score = parseInt(numbers[0]);
      // Ensure it's within valid range
      score = Math.max(0, Math.min(100, score));
    }
    
    console.log(`📊 Final Score: ${score}/100 for answer: "${answer.substring(0, 50)}..."`);
    return score;
    
  } catch (error) {
    console.error('Error scoring answer:', error);
    
    // Much stricter fallback scoring
    const trimmedAnswer = answer.trim().toLowerCase();
    
    // Empty or very short answers get 0
    if (trimmedAnswer.length < 10) {
      return 0;
    }
    
    // Check for obvious non-answers
    const nonAnswers = ['i don\'t know', 'no idea', 'not sure', 'idk', '?', 'skip'];
    if (nonAnswers.some(na => trimmedAnswer.includes(na))) {
      return 0;
    }
    
    // Very basic answer (20-50 chars) gets low score
    if (trimmedAnswer.length < 50) {
      return 15;
    }
    
    // Medium length answer gets moderate score
    if (trimmedAnswer.length < 100) {
      return 35;
    }
    
    // Longer answers might have more substance but cap the fallback
    return 45; // Max fallback score reduced significantly
  }
}

// Generate AI summary for interview
export async function generateInterviewSummary(candidateInfo, answers, totalScore) {
  console.log(`📋 Generating summary for ${candidateInfo.name} with score ${totalScore}/100`);
  
  // Calculate some statistics
  const answeredQuestions = answers.length;
  const averageScore = totalScore;
  const highScoreCount = answers.filter(a => a.score >= 70).length;
  const lowScoreCount = answers.filter(a => a.score < 40).length;
  
  const summaryPrompt = `Generate a realistic and honest interview summary based on actual performance:

Candidate: ${candidateInfo.name}
Questions Answered: ${answeredQuestions}
Average Score: ${averageScore}/100
High-scoring answers (70+): ${highScoreCount}/${answeredQuestions}
Low-scoring answers (<40): ${lowScoreCount}/${answeredQuestions}

Individual Question Performance:
${answers.map(a => `Q: ${a.question}\nA: ${a.answer || 'No answer provided'}\nScore: ${a.score}/100`).join('\n\n')}

IMPORTANT: Base the summary ONLY on actual performance shown above. Be honest about weak areas.

Provide a realistic 2-3 sentence summary that:
1. Accurately reflects the actual scores achieved
2. Mentions specific strengths if scores are genuinely high (70+)
3. Identifies areas for improvement if scores are low (<50)
4. Is honest about poor performance when warranted

Do not inflate or sugar-coat the assessment.`;

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
    
    // Realistic fallback summaries based on actual performance
    let summary = `Interview completed with ${answeredQuestions} questions answered. `;
    
    if (totalScore >= 80) {
      summary += 'Excellent performance demonstrating strong technical knowledge and clear communication skills.';
    } else if (totalScore >= 60) {
      summary += 'Good understanding of core concepts with some areas needing further development.';
    } else if (totalScore >= 40) {
      summary += 'Basic understanding shown but significant gaps in technical knowledge that require improvement.';
    } else {
      summary += 'Fundamental concepts not adequately demonstrated. Substantial study and practice recommended before next interview.';
    }
    
    return summary;
  }
}