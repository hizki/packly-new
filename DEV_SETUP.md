# Development Setup Guide

This document explains how to quickly set up and run the Packly development environment.

## Quick Start Scripts

We've provided convenient scripts to get you up and running quickly:

### For macOS/Linux users:
```bash
./run.sh
```

### For Windows users:
```batch
run.bat
```

### Alternative (all platforms):
```bash
npm run start
# or
npm run dev
```

## What the Scripts Do

The run scripts will automatically:

1. ✅ **Check Node.js version** - Ensures you have Node.js 24.0.0 or higher
2. ✅ **Check npm version** - Verifies npm 10.0.0 or higher is available  
3. 📦 **Install dependencies** - Runs `npm install` if needed
4. 🔧 **Check environment setup** - Verifies Supabase configuration
5. 🚀 **Start development server** - Launches the Vite dev server

## Environment Setup

### Required Environment Variables

Create a `.env.local` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Getting Supabase Credentials

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Navigate to Settings → API
3. Copy your project URL and anon/public key
4. Add them to your `.env.local` file

## Development Mode Features

- 🔄 **Hot reload** - Changes reflect immediately
- 🛠️ **Mock data** - Works without Supabase if not configured
- 📱 **Responsive testing** - Access from mobile devices on your network
- 🐛 **DevTools integration** - React DevTools support

## Troubleshooting

### Node.js Version Issues
If you encounter version issues:
```bash
# Using nvm (recommended)
nvm use          # Uses version from .nvmrc
nvm install 24.4.1

# Or update Node.js directly
brew upgrade node  # macOS
```

### Port Already in Use
If port 5173 is busy:
```bash
# The script will automatically find an available port
# or you can specify a different port:
npm run dev -- --port 3000
```

### Missing Dependencies
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading
- Ensure file is named exactly `.env.local` (not `.env.local.txt`)
- Restart the development server after adding environment variables
- Check that variables start with `VITE_` prefix

## Development Workflow

1. **Start development**: `./run.sh` or `npm run start`
2. **Make changes**: Edit files in `src/`
3. **View changes**: Browser auto-refreshes
4. **Build for production**: `npm run build`
5. **Preview production build**: `npm run preview`

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `npm run start` | Start development server |
| `dev` | `npm run dev` | Start development server (alias) |
| `build` | `npm run build` | Build for production |
| `preview` | `npm run preview` | Preview production build |
| `lint` | `npm run lint` | Run ESLint |

## Development Server Info

- **URL**: http://localhost:5173
- **Network access**: Available on your local network
- **Auto-open**: Browser opens automatically
- **Hot reload**: Enabled by default

---

*For more detailed information, see the main [README.md](./README.md)* 