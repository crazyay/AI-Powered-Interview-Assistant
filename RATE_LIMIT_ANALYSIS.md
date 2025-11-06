# Gemini API Rate Limit Analysis

## Problem
Getting `429 Too Many Requests` error from Google Gemini API with error:
```
Quota exceeded for quota metric 'Generate Content API requests per minute'
```

## Where We Call Gemini API

I've analyzed all Gemini API calls in the backend:

### 1. **Resume Upload Flow** (`utils/helpers.js`)
   - **Function**: `extractResumeInfo()`
   - **When**: User uploads a resume (PDF/DOCX)
   - **Calls**: 1 API call per resume upload
   - **Purpose**: Extract name, email, phone from resume text

### 2. **Start Test Flow** (`services/aiService.js`)
   - **Function**: `generateInterviewQuestions()`
   - **When**: User starts a test (custom or resume mode)
   - **Calls**: 1 API call per test start
   - **Purpose**: Generate MCQ questions based on topics/resume
   - **Has retry logic**: 3 attempts with exponential backoff (2s, 4s, 8s)

### 3. **Complete Test Flow** (`services/aiService.js`)
   - **Function**: `generateInterviewSummary()`
   - **When**: User completes all questions
   - **Calls**: 1 API call per test completion
   - **Purpose**: Generate AI summary of performance

## Total API Calls Per User Flow

### Scenario A: Resume-Based Test (typical)
1. Upload resume → **1 call** (extractResumeInfo)
2. Start test → **1 call** (generateInterviewQuestions)
3. Complete test → **1 call** (generateInterviewSummary)
**Total: 3 API calls**

### Scenario B: Custom Test (no resume)
1. Start test → **1 call** (generateInterviewQuestions)
2. Complete test → **1 call** (generateInterviewSummary)
**Total: 2 API calls**

## Gemini Free Tier Limits

Based on the error message:
- **Region**: asia-southeast1
- **Limit**: ~15 requests per minute per region
- **Current quota**: 0/min (suggests free tier or very low limit)

## Root Cause Analysis

### Is it OUR code making too many calls?
**Answer: Unlikely for single user testing**

If you're the only person testing:
- 3 calls per test session is reasonable
- Unless you're starting multiple tests within 1 minute

### Possible causes:

1. **Multiple rapid test attempts**
   - Starting 5+ tests in < 1 minute = 5-10 API calls
   - Could hit the 15/min limit

2. **Retry logic amplifying requests**
   - If API is slow/failing, retries (3x) could multiply calls
   - 5 test starts × 3 retries = 15 calls in seconds

3. **Region-specific limits**
   - `asia-southeast1` might have stricter limits
   - Free tier might be throttled more aggressively

4. **API key shared/quota exhausted**
   - If API key is used elsewhere
   - Daily quota might be exhausted (not just per-minute)

## Solution: API Call Tracking

I've added comprehensive tracking:

### New Tools Added:
1. **`apiCallTracker.js`** - Monitors all Gemini API calls
   - Tracks timestamps, source, details
   - Counts calls per minute
   - Warns when approaching limit

2. **API Stats Endpoint**: `GET /api/stats/stats`
   - View real-time API usage
   - See call breakdown by source
   - Check calls in last minute

### How to Use:

1. Start backend:
```bash
cd F:\AIQuizz\backend
node server.js
```

2. Perform your test flow (upload resume, start test, complete)

3. Check stats:
```bash
# In browser or curl
http://localhost:5000/api/stats/stats
```

4. Look for:
   - `callsLastMinute`: Should be < 15
   - `callsBySource`: Which functions are called most
   - `recentCallTimestamps`: Exact timing of calls

## Console Output Now Shows:

Every API call will log:
```
🔔 API CALL TRACKER:
   Source: generateInterviewQuestions
   Total calls since start: 5
   Calls in last minute: 3
   Time since start: 45s
   Details: {"mode":"custom","topics":"JavaScript,React","questionCount":20}
```

## Recommendations:

1. **Test with tracking enabled** - Start backend and check console logs
2. **Visit stats endpoint** after each test to see accumulation
3. **If we're making 15+ calls/min**:
   - Add debouncing on frontend
   - Cache results where possible
   - Increase delays between retries

4. **If Gemini limit is too strict**:
   - Upgrade API plan
   - Switch to different model (gemini-1.5-flash might have better limits)
   - Add local caching of common question sets

5. **If you're testing rapidly**:
   - Wait 60 seconds between test starts
   - Use fallback questions for rapid testing
   - Consider mock mode for development

## Next Steps:

Run a test now and share:
1. Console output from backend (the API tracker logs)
2. Response from `http://localhost:5000/api/stats/stats`

This will tell us definitively if WE'RE calling too much or if Gemini's limits are just very restrictive.
