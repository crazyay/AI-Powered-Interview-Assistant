import { Candidate } from '../models/Candidate.js';
import { Interview } from '../models/Interview.js';

export class DatabaseService {
  // Candidate operations
  static async addCandidate(candidateData) {
    try {
      const candidate = new Candidate(candidateData);
      return await candidate.save();
    } catch (error) {
      throw new Error(`Error adding candidate: ${error.message}`);
    }
  }

  static async findCandidateByEmail(email) {
    try {
      return await Candidate.findOne({ email: email.toLowerCase() }).populate('interviewId');
    } catch (error) {
      throw new Error(`Error finding candidate: ${error.message}`);
    }
  }

  static async updateCandidate(email, updates) {
    try {
      return await Candidate.findOneAndUpdate(
        { email: email.toLowerCase() },
        updates,
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Error updating candidate: ${error.message}`);
    }
  }

  static async getAllCandidates(filters = {}) {
    try {
      const { search = '', sortBy = 'totalScore', order = 'desc', limit = 50, skip = 0 } = filters;
      
      let query = {};
      if (search) {
        query = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        };
      }

      const sortOrder = order === 'desc' ? -1 : 1;
      
      return await Candidate.find(query)
        .sort({ [sortBy]: sortOrder })
        .limit(limit)
        .skip(skip)
        .populate('interviewId');
    } catch (error) {
      throw new Error(`Error getting candidates: ${error.message}`);
    }
  }

  static async getCandidateById(id) {
    try {
      return await Candidate.findById(id).populate('interviewId');
    } catch (error) {
      throw new Error(`Error getting candidate: ${error.message}`);
    }
  }

  static async deleteCandidateById(id) {
    try {
      return await Candidate.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting candidate: ${error.message}`);
    }
  }

  // Interview operations
  static async addInterview(interviewData) {
    try {
      const interview = new Interview(interviewData);
      return await interview.save();
    } catch (error) {
      throw new Error(`Error adding interview: ${error.message}`);
    }
  }

  static async findInterviewById(id) {
    try {
      return await Interview.findById(id);
    } catch (error) {
      throw new Error(`Error finding interview: ${error.message}`);
    }
  }

  static async updateInterview(id, updates) {
    try {
      return await Interview.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Error updating interview: ${error.message}`);
    }
  }

  static async getAllInterviews(filters = {}) {
    try {
      const { status, limit = 50, skip = 0 } = filters;
      
      let query = {};
      if (status) {
        query.status = status;
      }

      return await Interview.find(query)
        .sort({ startTime: -1 })
        .limit(limit)
        .skip(skip);
    } catch (error) {
      throw new Error(`Error getting interviews: ${error.message}`);
    }
  }

  static async deleteInterviewById(id) {
    try {
      return await Interview.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting interview: ${error.message}`);
    }
  }

  // Analytics operations
  static async getInterviewStats() {
    try {
      const totalInterviews = await Interview.countDocuments();
      const completedInterviews = await Interview.countDocuments({ status: 'completed' });
      const inProgressInterviews = await Interview.countDocuments({ status: 'in-progress' });
      
      const avgScore = await Interview.aggregate([
        { $match: { status: 'completed', totalScore: { $ne: null } } },
        { $group: { _id: null, avgScore: { $avg: '$totalScore' } } }
      ]);

      return {
        totalInterviews,
        completedInterviews,
        inProgressInterviews,
        averageScore: avgScore.length > 0 ? Math.round(avgScore[0].avgScore) : 0
      };
    } catch (error) {
      throw new Error(`Error getting interview stats: ${error.message}`);
    }
  }

  static async getTopCandidates(limit = 10) {
    try {
      return await Candidate.find({ totalScore: { $ne: null } })
        .sort({ totalScore: -1 })
        .limit(limit)
        .select('name email totalScore lastInterview');
    } catch (error) {
      throw new Error(`Error getting top candidates: ${error.message}`);
    }
  }
}