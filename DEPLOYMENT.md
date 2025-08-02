# Deploying Packly to Supabase + Vercel

This guide will help you deploy your Packly app with Supabase as the backend and Vercel for frontend hosting.

## Prerequisites

- Node.js 24+ installed
- Git repository (this project)
- Supabase account
- Vercel account (or Netlify as alternative)

## Step 1: Set Up Supabase Project

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Create a new project (choose a name, password, and region)
   - Wait for the project to be ready (~2 minutes)

2. **Set Up Database Schema**
   - In your Supabase dashboard, go to "SQL Editor"
   - Click "New query"
   - Copy the entire contents of `supabase-schema.sql` and paste it
   - Click "Run" to execute the schema

3. **Get API Keys**
   - Go to "Settings" → "API"
   - Copy the "Project URL" 
   - Copy the "anon public" key

## Step 2: Configure Environment Variables

1. **Create Local Environment File**
   ```bash
   cp env.template .env
   ```

2. **Update .env file with your Supabase credentials**
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Test Local Setup**
   ```bash
   npm install
   npm run dev
   ```
   - Open http://localhost:5173
   - Test authentication and basic functionality

## Step 3: Deploy to Vercel

### Option A: Deploy via GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite app

3. **Configure Environment Variables in Vercel**
   - In Vercel project settings → "Environment Variables"
   - Add:
     - `VITE_SUPABASE_URL` = your project URL
     - `VITE_SUPABASE_ANON_KEY` = your anon key

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at `https://your-app-name.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Add environment variables when prompted

## Step 4: Set Up Custom Domain (Optional)

1. In Vercel dashboard → "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions

## Step 5: Enable Supabase Auth Redirects

1. In Supabase dashboard → "Authentication" → "URL Configuration"
2. Add your production URL to "Redirect URLs":
   - `https://your-app-name.vercel.app/auth/callback`
   - `https://your-custom-domain.com/auth/callback` (if using custom domain)

## Alternative: Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `dist` folder
   - Or connect your GitHub repository

3. **Configure Environment Variables**
   - In Netlify: Site settings → Environment variables
   - Add the same VITE_ variables

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure variables start with `VITE_`
   - Restart dev server after adding variables
   - Check Vercel/Netlify environment variable settings

2. **Supabase Connection Issues**
   - Verify URL and key are correct
   - Check browser network tab for 401/403 errors
   - Ensure RLS policies are correctly set

3. **Build Failures**
   - Check Node.js version (requires 24+)
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

### Useful Commands

```bash
# Test build locally
npm run build
npm run preview

# Check for linting issues
npm run lint

# View build size analysis
npx vite-bundle-analyzer dist
```

## Post-Deployment Checklist

- [ ] App loads correctly
- [ ] Authentication works
- [ ] Database operations work
- [ ] All pages/routes accessible
- [ ] Environment variables are set
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Supabase auth redirects configured

## Production Monitoring

- **Vercel Analytics**: Enable in Vercel dashboard
- **Supabase Logs**: Monitor in Supabase dashboard → Logs
- **Error Tracking**: Consider adding Sentry or similar

Your Packly app should now be live and fully functional! 🎉 