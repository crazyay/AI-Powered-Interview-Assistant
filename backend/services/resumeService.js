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
          
          // Use pdf2json as it's more reliable
          const PDFParser = (await import('pdf2json')).default;
          
          console.log('📄 Parsing PDF with pdf2json...');
          
          // Create a promise-based wrapper for pdf2json
          const parsePdf = () => {
            return new Promise((resolve, reject) => {
              const pdfParser = new PDFParser();
              
              pdfParser.on('pdfParser_dataError', (errData) => {
                reject(new Error(errData.parserError));
              });
              
              pdfParser.on('pdfParser_dataReady', (pdfData) => {
                try {
                  // Extract text from pdf2json format
                  let extractedText = '';
                  if (pdfData.Pages) {
                    pdfData.Pages.forEach(page => {
                      if (page.Texts) {
                        page.Texts.forEach(textItem => {
                          if (textItem.R) {
                            textItem.R.forEach(r => {
                              if (r.T) {
                                extractedText += decodeURIComponent(r.T) + ' ';
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                  resolve(extractedText.trim());
                } catch (parseError) {
                  reject(new Error('Failed to extract text from PDF data'));
                }
              });
              
              // Parse the PDF buffer
              pdfParser.parseBuffer(file.buffer);
            });
          };
          
          text = await parsePdf();
          console.log('📄 PDF text extracted, length:', text.length);
          console.log('📄 First 200 chars of extracted text:', text.substring(0, 200));
          
          if (!text || text.trim().length < 10) {
            throw new Error('PDF appears to be empty or contains no readable text');
          }
        } catch (pdfError) {
          console.log('❌ PDF parsing failed:', pdfError.message);
          text = `PDF file uploaded: ${file.originalname}. Could not extract text automatically. Error: ${pdfError.message}. Please fill in your information manually.`;
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