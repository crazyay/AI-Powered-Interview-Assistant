import { DatabaseService } from '../services/databaseService.js';
import { generateInterviewQuestions, scoreAnswer, generateInterviewSummary } from '../services/aiService.js';

export class InterviewController {
  // Start interview session
  static async startInterview(req, res) {
    try {
      const { candidateInfo } = req.body;
      
      console.log('Received candidateInfo:', candidateInfo);
      
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
      
      console.log('Starting interview for:', candidateInfo.name);
      if (candidateInfo.resumeText) {
        console.log('Resume text provided, generating personalized questions');
      } else {
        console.log('No resume text provided, using generic questions');
      }

      const questions = await generateInterviewQuestions(candidateInfo);
      
      const interviewData = {
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
        firstQuestion: questions.questions[0]
      });
    } catch (error) {
      console.error('Error starting interview:', error);
      res.status(500).json({ error: 'Failed to start interview' });
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
      const { answer, timeSpent } = req.body;
      const cleanInterviewId = req.params.interviewId.replace(/^:+/, '');
      const interview = await DatabaseService.findInterviewById(cleanInterviewId);
      
      if (!interview) {
        return res.status(404).json({ error: 'Interview not found' });
      }

      const currentQuestion = interview.questions[interview.currentQuestionIndex];
      
      console.log(`📝 Scoring Answer for Question ${currentQuestion.id}:`);
      console.log(`Question: ${currentQuestion.question}`);
      console.log(`Answer: "${answer || 'NO ANSWER PROVIDED'}"`);
      console.log(`Expected: ${currentQuestion.expectedAnswer}`);
      
      const score = await scoreAnswer(currentQuestion.question, answer, currentQuestion.expectedAnswer);
      
      // Validate score
      const finalScore = (score !== undefined && score !== null && !isNaN(score)) 
        ? Math.max(0, Math.min(100, score)) 
        : 0;
      
      console.log(`✅ Final Score Assigned: ${finalScore}/100`);
      
      const newAnswer = {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        answer: answer || '',
        timeSpent,
        score: finalScore,
        timestamp: new Date()
      };

      interview.answers.push(newAnswer);
      interview.currentQuestionIndex++;
      
      // Update the interview in database
      await DatabaseService.updateInterview(cleanInterviewId, {
        answers: interview.answers,
        currentQuestionIndex: interview.currentQuestionIndex
      });
      
      // Check if interview is finished
      if (interview.currentQuestionIndex >= interview.questions.length) {
        await InterviewController.finalizeInterview(interview);
        
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
  }

  // Finalize interview and generate summary
  static async finalizeInterview(interview) {
    try {
      // Calculate total score with proper validation
      let totalScore = 0;
      
      if (interview.answers && interview.answers.length > 0) {
        // Only count answers that have valid scores
        const validAnswers = interview.answers.filter(answer => 
          answer.score !== undefined && answer.score !== null && !isNaN(answer.score)
        );
        
        if (validAnswers.length > 0) {
          const sumScore = validAnswers.reduce((sum, answer) => sum + (answer.score || 0), 0);
          totalScore = Math.round(sumScore / validAnswers.length);
          console.log(`📊 Score calculation: ${sumScore} points / ${validAnswers.length} answers = ${totalScore}%`);
        } else {
          console.log('⚠️  No valid scores found, setting totalScore to 0');
          totalScore = 0;
        }
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