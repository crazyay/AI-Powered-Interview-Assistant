import { DatabaseService } from '../services/databaseService.js';
import { generateInterviewQuestions, scoreAnswer, generateInterviewSummary } from '../services/aiService.js';

export class InterviewController {
  // Start interview session
  static async startInterview(req, res) {
    try {
      const { candidateInfo, testMode = 'resume', topics = [], questionCount = 20 } = req.body;
      
      console.log('Received request:', { testMode, topics, questionCount });
      console.log('Candidate Info:', candidateInfo);
      
      // Trim whitespace and validate
      const name = candidateInfo?.name?.trim();
      const email = candidateInfo?.email?.trim();  
      const phone = candidateInfo?.phone?.trim();
      
      if (!name || !email || !phone) {
        console.log('Validation failed:', { name: !!name, email: !!email, phone: !!phone });
        return res.status(400).json({ 
          error: 'Missing required information', 
          missing: {
            name: !name,
            email: !email,
            phone: !phone
          }
        });
      }
      
      // Additional email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'Invalid email format', 
          missing: { name: false, email: true, phone: false }
        });
      }
      
      // Validate test mode specific requirements
      if (testMode === 'custom' && (!topics || topics.length === 0)) {
        return res.status(400).json({ 
          error: 'Topics are required for custom test mode'
        });
      }
      
      console.log(`Starting ${testMode} test for:`, candidateInfo.name);
      
      // Generate questions based on test mode
      const testConfig = { mode: testMode, topics, questionCount };
      const questions = await generateInterviewQuestions(candidateInfo, testConfig);
      console.log(questions);
      
      const interviewData = {
        testMode,
        topics,
        candidateInfo,
        questions: questions.questions,
        currentQuestionIndex: 0,
        answers: [],
        startTime: new Date(),
        status: 'in-progress',
        totalScore: null,
        summary: null
      };

      const interview = await DatabaseService.addInterview(interviewData);
      
      res.json({ 
        success: true, 
        interviewId: interview._id,
        firstQuestion: questions.questions[0],
        totalQuestions: questions.questions.length
      });
    } catch (error) {
      console.error('Error starting interview:', error);
      res.status(500).json({ error: 'Failed to start interview' });
    }
  }

  // Get all questions for an interview
  static async getAllQuestions(req, res) {
    try {
      const cleanInterviewId = req.params.interviewId.replace(/^:+/, '');
      const interview = await DatabaseService.findInterviewById(cleanInterviewId);
      
      if (!interview) {
        return res.status(404).json({ error: 'Interview not found' });
      }

      res.json({
        questions: interview.questions,
        totalQuestions: interview.questions.length
      });
    } catch (error) {
      console.error('Error getting all questions:', error);
      res.status(500).json({ error: 'Failed to get questions' });
    }
  }
 
  // Get current question
  static async getCurrentQuestion(req, res) {
    try {
      console.log('Raw params:', req.params);
      
      // Clean the interviewId parameter (remove any leading colons)
      const cleanInterviewId = req.params.interviewId.replace(/^:+/, '');
      console.log('Cleaned interviewId:', cleanInterviewId);
      
      const interview = await DatabaseService.findInterviewById(cleanInterviewId);
      console.log("FOUND INTERVIEW:", interview);
      
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
  }

  // Submit answer
  static async submitAnswer(req, res) {
    try {
      const { selectedOption } = req.body;
      const cleanInterviewId = req.params.interviewId.replace(/^:+/, '');
      const interview = await DatabaseService.findInterviewById(cleanInterviewId);
      
      if (!interview) {
        return res.status(404).json({ error: 'Interview not found' });
      }

      const currentQuestion = interview.questions[interview.currentQuestionIndex];
      
      console.log(`📝 Scoring MCQ Answer for Question ${currentQuestion.id}:`);
      console.log(`Question: ${currentQuestion.question}`);
      console.log(`Selected Option: ${selectedOption} (type: ${typeof selectedOption})`);
      console.log(`Correct Answer: ${currentQuestion.correctAnswer} (type: ${typeof currentQuestion.correctAnswer})`);
      
      // Ensure both are numbers for comparison
      const selectedOptionNum = parseInt(selectedOption);
      const correctAnswerNum = parseInt(currentQuestion.correctAnswer);
      
      // Score MCQ answer (1 if correct, 0 if wrong)
      const score = await scoreAnswer(currentQuestion.question, selectedOptionNum, correctAnswerNum);
      
      console.log(`✅ Score Assigned: ${score}/1`);
      
      const newAnswer = {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        selectedOption: selectedOptionNum,
        correctAnswer: correctAnswerNum,
        score: score,
        timestamp: new Date()
      };

      interview.answers.push(newAnswer);
      interview.currentQuestionIndex++;
      
      console.log(`📝 Answer added. Total answers now: ${interview.answers.length}`);
      console.log(`   Current question index: ${interview.currentQuestionIndex}/${interview.questions.length}`);
      
      // Update the interview in database
      await DatabaseService.updateInterview(cleanInterviewId, {
        answers: interview.answers,
        currentQuestionIndex: interview.currentQuestionIndex
      });
      
      // Check if interview is finished
      if (interview.currentQuestionIndex >= interview.questions.length) {
        // Fetch fresh interview data to ensure we have all answers
        const updatedInterview = await DatabaseService.findInterviewById(cleanInterviewId);
        await InterviewController.finalizeInterview(updatedInterview);
        
        res.json({ 
          success: true, 
          finished: true,
          answerScore: score, // Score for the last answer submitted
          totalScore: updatedInterview.totalScore, // Total score for all answers
          summary: updatedInterview.summary
        });
      } else {
        const nextQuestion = interview.questions[interview.currentQuestionIndex];
        res.json({ 
          success: true, 
          finished: false,
          score: score, // Return the score for this answer
          nextQuestion,
          questionNumber: interview.currentQuestionIndex + 1
        });
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      res.status(500).json({ error: 'Failed to submit answer' });
    }
  }

  // Finalize interview and generate summary
  static async finalizeInterview(interview) {
    try {
      console.log(`🏁 Finalizing interview with ${interview.answers.length} answers`);
      
      // Calculate total score (sum of correct answers for MCQ)
      let totalScore = 0;
      
      if (interview.answers && interview.answers.length > 0) {
        totalScore = interview.answers.reduce((sum, answer) => sum + (answer.score || 0), 0);
        console.log(`📊 Total Score Calculation:`);
        console.log(`   Answers received: ${interview.answers.length}`);
        console.log(`   Total Score: ${totalScore}/${interview.answers.length}`);
        
        // Log each answer for debugging
        interview.answers.forEach((ans, idx) => {
          console.log(`   Q${idx + 1}: Selected=${ans.selectedOption}, Correct=${ans.correctAnswer}, Score=${ans.score}`);
        });
      } else {
        console.log('⚠️  No answers found, setting totalScore to 0');
        totalScore = 0;
      }
      
      // Generate AI summary
      const summary = await generateInterviewSummary(interview.candidateInfo, interview.answers, totalScore);

      interview.totalScore = totalScore;
      interview.summary = summary;
      interview.status = 'completed';
      interview.endTime = new Date();
      
      // Update interview in database
      await DatabaseService.updateInterview(interview._id, {
        totalScore,
        summary,
        status: 'completed',
        endTime: new Date()
      });
      
      // Add to candidates list
      const existingCandidate = await DatabaseService.findCandidateByEmail(interview.candidateInfo.email);
      if (existingCandidate) {
        await DatabaseService.updateCandidate(interview.candidateInfo.email, {
          totalScore,
          summary,
          lastInterview: new Date(),
          interviewId: interview._id,
          status: 'completed'
        });
      } else {
        await DatabaseService.addCandidate({
          name: interview.candidateInfo.name,
          email: interview.candidateInfo.email,
          phone: interview.candidateInfo.phone,
          totalScore,
          summary,
          interviewId: interview._id,
          lastInterview: new Date(),
          status: 'completed'
        });
      }
    } catch (error) {
      console.error('Error finalizing interview:', error);
      interview.status = 'error';
    }
  }

  // Get interview results
  static async getResults(req, res) {
    try {
      const cleanInterviewId = req.params.interviewId.replace(/^:+/, '');
      const interview = await DatabaseService.findInterviewById(cleanInterviewId);
      
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
  }

  // Resume incomplete interview
  static async resumeInterview(req, res) {
    try {
      const cleanInterviewId = req.params.interviewId.replace(/^:+/, '');
      const interview = await DatabaseService.findInterviewById(cleanInterviewId);
      
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
  }

  // Finish interview early (before completing all questions)
  static async finishInterviewEarly(req, res) {
    try {
      const cleanInterviewId = req.params.interviewId.replace(/^:+/, '');
      const interview = await DatabaseService.findInterviewById(cleanInterviewId);
      
      if (!interview) {
        return res.status(404).json({ error: 'Interview not found' });
      }

      if (interview.status === 'completed') {
        return res.status(400).json({ error: 'Interview already completed' });
      }

      // Finalize the interview with current answers
      await InterviewController.finalizeInterview(interview);
      
      res.json({ 
        success: true, 
        message: 'Interview submitted successfully',
        totalScore: interview.totalScore,
        summary: interview.summary 
      });
    } catch (error) {
      console.error('Error finishing interview early:', error);
      res.status(500).json({ error: 'Failed to finish interview' });
    }
  }
}