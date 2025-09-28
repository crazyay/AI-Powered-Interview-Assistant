// Test script to verify scoring functionality
import { scoreAnswer } from './services/aiService.js';

const testCases = [
  {
    question: "What is the difference between let and var in JavaScript?",
    expectedAnswer: "let has block scope, var has function scope. let prevents hoisting issues.",
    testAnswers: [
      "", // Empty answer
      "I don't know", // Non-answer  
      "let is better", // Too short/vague
      "let has block scope and var has function scope", // Correct but basic
      "let has block scope while var has function scope. let prevents hoisting issues and is generally preferred in modern JavaScript for better variable management.", // Complete answer
    ]
  }
];

async function testScoring() {
  console.log('🧪 Testing Scoring System...\n');
  
  const testCase = testCases[0];
  
  for (let i = 0; i < testCase.testAnswers.length; i++) {
    const answer = testCase.testAnswers[i];
    console.log(`\n--- Test ${i + 1} ---`);
    console.log(`Answer: "${answer}"`);
    
    try {
      const score = await scoreAnswer(testCase.question, answer, testCase.expectedAnswer);
      console.log(`Score: ${score}/100`);
      console.log(`Expected: ${getExpectedScoreRange(answer)}`);
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

function getExpectedScoreRange(answer) {
  if (!answer || answer.trim().length === 0) return "0-5";
  if (answer.toLowerCase().includes("don't know")) return "0-10";
  if (answer.length < 20) return "10-30";
  if (answer.length < 50) return "30-60";
  return "60-90";
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testScoring().catch(console.error);
}