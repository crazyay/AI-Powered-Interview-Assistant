import mammoth from 'mammoth';
import { extractResumeInfo } from '../utils/helpers.js';

export class ResumeService {
  static async parseResume(file) {
    try {
      if (!file) {
        throw new Error('No file uploaded');
      }

      let text = '';
      
      if (file.mimetype === 'application/pdf') {
        try {
          console.log('📄 Processing PDF file:', file.originalname);
          // Try to use pdf-parse if available
          const pdfParse = await import('pdf-parse').catch(() => null);
          if (pdfParse) {
            console.log('📄 Using pdf-parse library');
            const data = await pdfParse.default(file.buffer);
            text = data.text;
            console.log('📄 PDF text extracted, length:', text.length);
          } else {
            console.log('⚠️ pdf-parse not available, using fallback');
            // Fallback - create meaningful placeholder text
            text = `Resume uploaded: ${file.originalname}\n\nNote: PDF text extraction requires pdf-parse package. Please provide your contact information manually or install pdf-parse for automatic extraction.`;
          }
        } catch (pdfError) {
          console.log('❌ PDF parsing failed:', pdfError.message);
          text = `PDF file uploaded: ${file.originalname}. Could not extract text automatically. Error: ${pdfError.message}`;
        }
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        try {
          console.log('📄 Processing DOCX file:', file.originalname);
          const result = await mammoth.extractRawText({ buffer: file.buffer });
          text = result.value;
          console.log('📄 DOCX text extracted, length:', text.length);
        } catch (docxError) {
          console.log('❌ DOCX parsing failed:', docxError.message);
          throw new Error(`Failed to parse DOCX file: ${docxError.message}`);
        }
      } else {
        throw new Error(`Unsupported file type: ${file.mimetype}`);
      }

      return await extractResumeInfo(text);
    } catch (error) {
      throw new Error('Failed to parse resume: ' + error.message);
    }
  }
}