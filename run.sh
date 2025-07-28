#!/bin/bash

# ===================================
# Packly Development Runner Script
# ===================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to compare version numbers
version_ge() {
    printf '%s\n%s\n' "$2" "$1" | sort -V -C
}

print_status "🚀 Starting Packly Development Environment..."

# Check if Node.js is installed
if ! command_exists node; then
    print_error "Node.js is not installed!"
    print_error "Please install Node.js 24.0.0 or higher from https://nodejs.org/"
    print_error "Or use nvm: 'nvm install 24.4.1 && nvm use 24.4.1'"
    exit 1
fi

# Check Node.js version
REQUIRED_NODE_VERSION="24.0.0"
CURRENT_NODE_VERSION=$(node --version | sed 's/v//')

if ! version_ge "$CURRENT_NODE_VERSION" "$REQUIRED_NODE_VERSION"; then
    print_error "Node.js version $CURRENT_NODE_VERSION is too old!"
    print_error "Required: $REQUIRED_NODE_VERSION or higher"
    print_error "You can use nvm to switch versions: 'nvm use' (if .nvmrc is present)"
    exit 1
fi

print_success "Node.js version $CURRENT_NODE_VERSION is compatible ✓"

# Check if npm is available
if ! command_exists npm; then
    print_error "npm is not available!"
    exit 1
fi

# Check npm version
REQUIRED_NPM_VERSION="10.0.0"
CURRENT_NPM_VERSION=$(npm --version)

if ! version_ge "$CURRENT_NPM_VERSION" "$REQUIRED_NPM_VERSION"; then
    print_warning "npm version $CURRENT_NPM_VERSION might be too old (recommended: $REQUIRED_NPM_VERSION+)"
    print_warning "Consider updating npm: 'npm install -g npm@latest'"
fi

print_success "npm version $CURRENT_NPM_VERSION is available ✓"

# Check if we need to install dependencies
if [ ! -d "node_modules" ] || [ "package-lock.json" -nt "node_modules" ]; then
    print_status "📦 Installing dependencies..."
    npm install
    print_success "Dependencies installed ✓"
else
    print_status "📦 Dependencies are up to date ✓"
fi

# Check for environment variables
ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
    ENV_FILE=".env"
fi

if [ ! -f "$ENV_FILE" ]; then
    print_warning "No environment file found (.env.local or .env)"
    print_warning "You may need to create one with your Supabase credentials:"
    echo ""
    echo "VITE_SUPABASE_URL=your_supabase_project_url"
    echo "VITE_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo ""
    print_warning "The app will run in development mode with mock data if no Supabase config is found."
else
    print_success "Environment file found: $ENV_FILE ✓"
    
    # Check if environment variables are set
    if grep -q "your_supabase" "$ENV_FILE" 2>/dev/null || grep -q "your-project" "$ENV_FILE" 2>/dev/null; then
        print_warning "Environment file contains placeholder values"
        print_warning "Please update $ENV_FILE with your actual Supabase credentials"
    fi
fi

# Function to handle cleanup on script termination
cleanup() {
    print_status "👋 Shutting down development server..."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

print_success "🎉 Environment setup complete!"
print_status "Starting development server..."
print_status "The application will be available at: ${GREEN}http://localhost:5173${NC}"
print_status "Press ${YELLOW}Ctrl+C${NC} to stop the server"

echo ""
echo "=================================================="
echo "  🎒 PACKLY - Smart Travel Packing Lists"
echo "=================================================="
echo ""

# Start the development server
npm run dev 