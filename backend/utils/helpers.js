// Helper function // Extract information from resume text using AI and regex patterns
export async function extractResumeInfo(text) {
  console.log('📋 Starting resume info extraction from text length:', text.length);
  
  // Check if text is meaningful (not just a placeholder)
  const isPlaceholder = text.includes('Note: PDF text extraction requires') || 
                       text.includes('Could not extract text automatically') ||
                       text.trim().length < 20;
  
  if (isPlaceholder) {
    console.log('⚠️ Detected placeholder text, using regex-only extraction');
    return {
      name: extractWithRegex(text, 'name'),
      email: extractWithRegex(text, 'email'),
      phone: extractWithRegex(text, 'phone'),
      resumeText: text
    };
  }
  
  // First try AI extraction
  try {
    const { model } = await import('../config/gemini.js');
    
    const prompt = `CRITICAL: Extract ONLY contact information from this resume. Be extremely careful and thorough.

Resume Text:
${text}

EXTRACTION REQUIREMENTS:
1. NAME: Look at the very top of the resume, header sections, or contact sections. Usually the first or second line.
2. EMAIL: Find ANY valid email address in format xxx@xxx.xxx
3. PHONE: Find ANY phone number in formats like: (123) 456-7890, 123-456-7890, +1-123-456-7890, 123.456.7890

RETURN EXACT JSON FORMAT (no markdown, no extra text):
{
  "name": "exact full name found",
  "email": "exact email found",
  "phone": "exact phone found",
  "resumeText": "first 500 chars of resume"
}

CRITICAL RULES:
- Search the ENTIRE text thoroughly for email and phone
- If multiple emails/phones exist, use the first professional one
- Name is usually in the first 3 lines
- Return empty string "" if not found, DO NOT guess
- Ensure valid email format (must contain @ and .)
- Phone must be 10+ digits`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();
    
    const cleanedAiResponse = cleanGeminiResponse(aiText);
    const aiExtracted = JSON.parse(cleanedAiResponse);
    
    // Validate AI results and fallback to regex if needed
    const finalResult = {
      name: aiExtracted.name || extractWithRegex(text, 'name'),
      email: aiExtracted.email || extractWithRegex(text, 'email'),
      phone: aiExtracted.phone || extractWithRegex(text, 'phone'),
      resumeText: text
    };
    
    return finalResult;
  } catch (aiError) {
    console.log('AI extraction failed, using regex fallback:', aiError.message);
    // Fallback to regex extraction
    return {
      name: extractWithRegex(text, 'name'),
      email: extractWithRegex(text, 'email'),
      phone: extractWithRegex(text, 'phone'),
      resumeText: text
    };
  }
}

// Helper function for regex-based extraction
function extractWithRegex(text, field) {
  console.log(`Extracting ${field} from text (length: ${text.length})`);
  
  switch (field) {
    case 'email':
      // Multiple email patterns to catch more variations
      const emailPatterns = [
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
        /[\w\.-]+@[\w\.-]+\.\w+/gi
      ];
      
      for (const pattern of emailPatterns) {
        const emailMatches = text.match(pattern);
        if (emailMatches && emailMatches.length > 0) {
          console.log('Found email:', emailMatches[0]);
          return emailMatches[0];
        }
      }
      console.log('No email found');
      return '';
      
    case 'phone':
      // Multiple phone patterns to catch more variations
      const phonePatterns = [
        /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
        /(?:\+?[1-9]\d{0,3}[-.\s]?)?(?:\(?[0-9]{1,4}\)?[-.\s]?)?[0-9]{3,4}[-.\s]?[0-9]{3,4}/g,
        /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g
      ];
      
      for (const pattern of phonePatterns) {
        const phoneMatch = text.match(pattern);
        if (phoneMatch && phoneMatch[0]) {
          return phoneMatch[0];
        }
      }
      return '';
      
    case 'name':
      // More sophisticated name extraction
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      
      // Look in first few lines for name patterns
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i];
        
        // Skip lines with common header text
        if (line.toLowerCase().includes('resume') || 
            line.toLowerCase().includes('curriculum') ||
            line.toLowerCase().includes('cv') ||
            line.length < 3) {
          continue;
        }
        
        // Check if line looks like a name
        const nameMatch = line.match(/^([A-Z][a-z]+ (?:[A-Z][a-z]* )*[A-Z][a-z]+)$/);
        if (nameMatch) {
          return nameMatch[1];
        }
        
        // Fallback: if first substantial line looks like a name
        if (i === 0 && /^[A-Za-z\s]{2,50}$/.test(line) && 
            line.split(' ').length >= 2 && line.split(' ').length <= 4) {
          return line;
        }
      }
      return '';
      
    default:
      return '';
  }
}

export function cleanGeminiResponse(text) {
  // Remove markdown code blocks
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();
  
  // Find the first { and last } to extract just the JSON
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  return cleaned;
}

