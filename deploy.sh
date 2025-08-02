#!/bin/bash

# Packly Deployment Script
set -e

echo "🚀 Packly Deployment Script"
echo "=========================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file using env.template as reference"
    echo "Run: cp env.template .env"
    echo "Then add your Supabase credentials"
    exit 1
fi

# Check if environment variables are set
if ! grep -q "VITE_SUPABASE_URL=https://" .env || ! grep -q "VITE_SUPABASE_ANON_KEY=eyJ" .env; then
    echo "⚠️  Warning: Environment variables may not be properly set"
    echo "Make sure your .env file contains valid Supabase credentials"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📦 Installing dependencies..."
npm install

echo "🧹 Running linter..."
npm run lint

echo "🏗️  Building for production..."
npm run build

echo "✅ Build completed successfully!"
echo ""
echo "📁 Build output is in ./dist directory"
echo ""

# Check if vercel CLI is available
if command -v vercel &> /dev/null; then
    echo "🌐 Vercel CLI detected!"
    read -p "Deploy to Vercel now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Deploying to Vercel..."
        vercel --prod
        echo "🎉 Deployment complete!"
    fi
else
    echo "💡 Next steps:"
    echo "1. Install Vercel CLI: npm i -g vercel"
    echo "2. Deploy: vercel --prod"
    echo "3. Or drag and drop ./dist folder to vercel.com"
fi

echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md" 