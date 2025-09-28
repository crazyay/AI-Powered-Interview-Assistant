import { ResumeService } from '../services/resumeService.js';

export class ResumeController {
  static async parseResume(req, res) {
    try {
      console.log('📄 Parsing resume:', req.file ? req.file.originalname : 'No file');
      
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No resume file uploaded' 
        });
      }
      
      const extractedData = await ResumeService.parseResume(req.file);
      console.log('✅ Resume parsed successfully:', extractedData);
      
      // Return the data in the format expected by frontend
      res.json({ 
        success: true, 
        candidateInfo: extractedData
      });
    } catch (error) {
      console.error('❌ Error parsing resume:', error.message);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
}