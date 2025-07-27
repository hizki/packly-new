# Packly - Smart Travel Packing Lists

A modern React application for creating and managing intelligent packing lists for your travels.

## Features

- 🎒 Create custom packing lists for any trip
- 🌤️ Weather-aware item suggestions  
- 📱 Responsive design for mobile and desktop
- ✅ Track packing progress with checkboxes
- 💡 Pre-built templates for activities and accommodations
- 🔐 Secure user authentication

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Supabase  
- **Styling**: Tailwind CSS + Radix UI
- **Auth**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd packly
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Building for Production

```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -am 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.