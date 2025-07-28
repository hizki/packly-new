# Packly - Smart Travel Packing Lists

A modern React application for creating and managing intelligent packing lists for your travels.

## Prerequisites

- **Node.js**: >= 24.0.0 (latest LTS recommended)
- **npm**: >= 10.0.0

> 💡 **Note**: This project uses the latest versions of all dependencies. If you encounter version compatibility issues, run `brew upgrade node` (macOS) or update Node.js to the latest version.

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
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_WEATHER_API_KEY=your_weather_api_key
```

### Getting API Keys

1. **Google Maps API Key**: 
   - Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
   - Create a new project or select existing one
   - Enable the Maps JavaScript API and Places API
   - Create credentials (API Key)
   - Restrict the key to your domain for security

2. **Weather API Key**:
   - Sign up at [OpenWeatherMap](https://openweathermap.org/api)
   - Get your free API key from the dashboard

## Google Maps Configuration

### Setting up Google Maps API

1. **Get a Google Maps API Key:**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the following APIs:
     - Maps JavaScript API
     - Places API (New)
     - Geocoding API
   - Create an API key in "APIs & Services" > "Credentials"

2. **Enable Billing:**
   - **Important:** Google Maps Platform requires billing to be enabled
   - Go to "Billing" in Google Cloud Console
   - Link a payment method to your project
   - Even with billing enabled, you get free usage credits each month

3. **Configure API Key:**
   - Copy your API key
   - Create a `.env.local` file in the project root
   - Add: `VITE_GOOGLE_MAPS_API_KEY=your_api_key_here`

### Common Issues

**"BillingNotEnabledMapError":**
- This means billing is not enabled for your Google Cloud project
- Follow step 2 above to enable billing
- You won't be charged unless you exceed the generous free tier limits

**"API key not valid":**
- Check that your API key is correctly set in `.env.local`
- Ensure the required APIs are enabled in Google Cloud Console
- Verify there are no domain restrictions that block localhost

### Free Tier Limits

Google Maps Platform provides generous free usage:
- 28,000+ map loads per month
- 100,000+ geocoding requests per month
- For most personal projects, you won't exceed these limits

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