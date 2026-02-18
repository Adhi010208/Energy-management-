# Vercel Deployment Guide

## Setting Up Environment Variables on Vercel

The application requires the `VITE_GEMINI_API_KEY` environment variable to be set in Vercel.

### Steps to Deploy:

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Fix environment variables"
   git push
   ```

2. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/dashboard
   - Select your project "Energy-management-"

3. **Add Environment Variable:**
   - Go to **Settings** → **Environment Variables**
   - Add a new variable with:
     - **Name:** `VITE_GEMINI_API_KEY`
     - **Value:** Your Gemini API Key (get from https://makersuite.google.com/app/apikey)
     - **Environments:** Select "Production" (and "Preview" if needed)
   - Click "Save"

4. **Redeploy:**
   - Go to **Deployments**
   - Click the three dots on the latest deployment
   - Select "Redeploy"
   - Confirm

5. **Verify:**
   - Visit your deployed site
   - The Gemini API should now work without errors

## Local Development:

1. Create a `.env` file in the root directory:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

The `.env` file is already in `.gitignore` so it won't be committed to GitHub.
