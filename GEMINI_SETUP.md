# Getting Your Google Gemini API Key

To use Google Gemini AI for quiz generation, you'll need to obtain an API key from Google AI Studio.

## Steps to Get Your Gemini API Key:

1. **Visit Google AI Studio**
   - Go to https://aistudio.google.com/

2. **Sign in with your Google Account**
   - Use your existing Google account or create a new one

3. **Create a New API Key**
   - Click on "Get API key" in the left sidebar
   - Click "Create API key in new project" or select an existing project
   - Copy the generated API key

4. **Add API Key to Environment**
   - Open `backend/.env` file
   - Replace `your-gemini-api-key-here` with your actual API key:
   ```env
   GEMINI_API_KEY=your-actual-api-key-here
   ```

5. **Restart the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

## Important Notes:

- **Keep your API key secure** - Never commit it to version control
- **Free Tier Available** - Google Gemini offers a generous free tier for development
- **Rate Limits** - Be aware of API rate limits in the free tier
- **Billing** - Monitor usage in Google Cloud Console if you exceed free tier

## Alternative: Use Environment Variables

For production deployment, set the environment variable directly:

```bash
export GEMINI_API_KEY=your-actual-api-key-here
```

Or in your hosting platform's environment variable settings.

## Troubleshooting

If you encounter issues:

1. **Invalid API Key**: Ensure the key is copied correctly without extra spaces
2. **Rate Limits**: Wait a moment and try again if you hit rate limits  
3. **Network Issues**: Check your internet connection
4. **Fallback Questions**: The app includes fallback questions if the API fails

The application will still work with fallback questions even if the Gemini API is unavailable.