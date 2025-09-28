// Helper function // Extract information from resume text using AI and regex patterns
export async function extractResumeInfo(text) {
  // First try AI extraction
  try {
    const { model } = await import('../config/gemini.js');
    
    const prompt = `Extract the candidate's contact information from this resume text. Analyze carefully and extract the most relevant information.

Resume Text:
${text}

Required JSON structure:
{
  "name": "Full Name (look for names at the top, in headers, or contact sections)",
  "email": "email@example.com (look for valid email addresses)",
  "phone": "+1-234-567-8900 (look for phone numbers in various formats)",
  "resumeText": "original resume text",
  "skills": "comma-separated list of technical skills mentioned",
  "experience": "brief summary of work experience"
}

Extraction Guidelines:
- Name: Usually appears at the top of resume, may be in larger font or header
- Email: Look for valid email format (xxx@xxx.xxx)
- Phone: Can be in formats like (123) 456-7890, 123-456-7890, +1-123-456-7890
- Skills: Technical skills, programming languages, frameworks
- Experience: Years of experience, job titles, companies

If any field cannot be found, use an empty string. Return ONLY the JSON object without markdown formatting.`;

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
  const cleanText = text.toLowerCase();
  
  switch (field) {
    case 'email':
      const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g);
      return emailMatch ? emailMatch[0] : '';
      
    case 'phone':
      // Match various phone formats
      const phoneMatch = text.match(/(?:\+?1[-\s]?)?\(?([0-9]{3})\)?[-\s]?([0-9]{3})[-\s]?([0-9]{4})/g);
      return phoneMatch ? phoneMatch[0] : '';
      
    case 'name':
      // Look for name patterns (this is basic, AI is better for this)
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        const firstLine = lines[0].trim();
        // If first line looks like a name (2-3 words, no numbers/special chars)
        if (/^[A-Za-z\s]{2,50}$/.test(firstLine) && firstLine.split(' ').length <= 4) {
          return firstLine;
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

