import { DatabaseService } from '../services/databaseService.js';

export class DashboardController {
  // Get all candidates
  static async getAllCandidates(req, res) {
    try {
      const { sortBy = 'totalScore', order = 'desc', search = '' } = req.query;
      
      const candidates = await DatabaseService.getAllCandidates({
        search,
        sortBy,
        order
      });

      res.json({ candidates });
    } catch (error) {
      console.error('Error getting candidates:', error);
      res.status(500).json({ error: 'Failed to get candidates' });
    }
  }

  // Get candidate details
  static async getCandidateDetails(req, res) {
    try {
      const candidate = await DatabaseService.getCandidateById(req.params.id);
      
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

      const interview = await DatabaseService.findInterviewById(candidate.interviewId);
      
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
  }

  // Get dashboard analytics
  static async getAnalytics(req, res) {
    try {
      const stats = await DatabaseService.getInterviewStats();
      const topCandidates = await DatabaseService.getTopCandidates(5);
      
      res.json({
        stats,
        topCandidates
      });
    } catch (error) {
      console.error('Error getting analytics:', error);
      res.status(500).json({ error: 'Failed to get analytics' });
    }
  }

  // Delete candidate
  static async deleteCandidate(req, res) {
    try {
      const candidate = await DatabaseService.getCandidateById(req.params.id);
      
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

      // Delete associated interview
      if (candidate.interviewId) {
        await DatabaseService.deleteInterviewById(candidate.interviewId);
      }
      
      await DatabaseService.deleteCandidateById(req.params.id);
      
      res.json({ success: true, message: 'Candidate deleted successfully' });
    } catch (error) {
      console.error('Error deleting candidate:', error);
      res.status(500).json({ error: 'Failed to delete candidate' });
    }
  }
}