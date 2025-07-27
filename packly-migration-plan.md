# Packly Migration Plan: From Base44 to Supabase

## 🎯 **Overview**
Complete migration plan to remove all base44 dependencies and transform this into a standalone Packly application powered by Supabase.

**Current State:** `base44-app` with base44 SDK integration  
**Target State:** `packly` standalone app with Supabase backend  
**Migration Date:** [Fill in date]

---

## 📋 **Prerequisites**

- [ ] Create Supabase account at [supabase.com](https://supabase.com)
- [ ] Have access to current base44 data (exported samples provided)
- [ ] Backup current codebase: `git commit -am "Pre-migration backup"`
- [ ] Verify app is working: `npm run dev`

---

## 🚀 **Phase 1: Setup Supabase Backend**

### Step 1.1: Create Supabase Project
- [ ] Go to [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] Click "New Project"
- [ ] Project name: `packly`
- [ ] Database password: [Save securely]
- [ ] Region: [Choose closest to users]
- [ ] Wait for setup completion (~2 minutes)

### Step 1.2: Install Supabase Dependencies
```bash
npm uninstall @base44/sdk
npm install @supabase/supabase-js
```

### Step 1.3: Setup Environment Variables
Create `.env.local`:
```env
VITE_SUPABASE_URL=https://xvsbrhcigjjnphnuxaay.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2c2JyaGNpZ2pqbnBobnV4YWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MjQ1OTEsImV4cCI6MjA2OTIwMDU5MX0.n_DGOaX8ZLNwqiDO9vB4ncI_cU7EN4bWT-4_gzudEAY
```

### Step 1.4: Create Database Schema
Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable RLS
ALTER DEFAULT PRIVILEGES GRANT ALL ON TABLES TO anon, authenticated;

-- Users table (handled by Supabase Auth automatically)

-- Base Lists table
CREATE TABLE base_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_type TEXT NOT NULL, -- 'activity', 'accommodation', 'companion'
  category TEXT NOT NULL, -- 'camping', 'beach', 'hotel', etc.
  items JSONB NOT NULL DEFAULT '[]',
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by_id UUID REFERENCES auth.users(id),
  created_by TEXT,
  is_sample BOOLEAN DEFAULT false
);

-- Tip Lists table  
CREATE TABLE tip_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_type TEXT NOT NULL, -- 'day_before', 'before_leaving'
  tips JSONB NOT NULL DEFAULT '[]',
  owner_id UUID REFERENCES auth.users(id),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by_id UUID REFERENCES auth.users(id),
  created_by TEXT,
  is_sample BOOLEAN DEFAULT false
);

-- Custom Lists table
CREATE TABLE lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_type TEXT NOT NULL,
  category TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  owner_id UUID REFERENCES auth.users(id),
  is_default BOOLEAN DEFAULT false,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by_id UUID REFERENCES auth.users(id),
  created_by TEXT,
  is_sample BOOLEAN DEFAULT false
);

-- Packing Lists table
CREATE TABLE packing_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  destinations JSONB NOT NULL DEFAULT '[]',
  activities JSONB NOT NULL DEFAULT '[]',
  accommodation TEXT,
  companions JSONB NOT NULL DEFAULT '[]',
  amenities JSONB NOT NULL DEFAULT '[]',
  is_favorite BOOLEAN DEFAULT false,
  items JSONB NOT NULL DEFAULT '[]',
  owner_id UUID REFERENCES auth.users(id),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by_id UUID REFERENCES auth.users(id),
  created_by TEXT,
  is_sample BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE base_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_lists ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Base lists: Public read, auth users can create
CREATE POLICY "Public can view base lists" ON base_lists FOR SELECT USING (true);
CREATE POLICY "Auth users can create base lists" ON base_lists FOR INSERT WITH CHECK (auth.uid() = created_by_id);

-- Tip lists: Public read, auth users can create  
CREATE POLICY "Public can view tip lists" ON tip_lists FOR SELECT USING (true);
CREATE POLICY "Auth users can create tip lists" ON tip_lists FOR INSERT WITH CHECK (auth.uid() = created_by_id);

-- Lists: Users can only access their own
CREATE POLICY "Users can view own lists" ON lists FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create own lists" ON lists FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own lists" ON lists FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own lists" ON lists FOR DELETE USING (auth.uid() = owner_id);

-- Packing lists: Users can only access their own
CREATE POLICY "Users can view own packing lists" ON packing_lists FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create own packing lists" ON packing_lists FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own packing lists" ON packing_lists FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own packing lists" ON packing_lists FOR DELETE USING (auth.uid() = owner_id);
```

### Step 1.5: Create Supabase Client
Create `src/api/supabaseClient.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Validation:**
- [ ] Database tables created successfully
- [ ] Environment variables set
- [ ] Supabase client connects without errors

---

## 🔧 **Phase 2: Authentication Migration**

### Step 2.1: Create New Auth Utils
Create `src/api/auth.js`:
```javascript
import { supabase } from './supabaseClient'

export class AuthService {
  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  static async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    })
    return { data, error }
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  static onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export const User = AuthService // Maintain same export name for compatibility
```

### Step 2.2: Update Authentication Files
Files to update with new auth:

- [ ] `src/pages/Login.jsx` - Replace base44 auth with Supabase
- [ ] `src/pages/AuthCallback.jsx` - Update callback handling  
- [ ] `src/components/auth/LoginButton.jsx` - Update login flow

### Step 2.3: Update All Files Importing User
Replace in these 13+ files:
```javascript
// OLD:
import { User } from "@/api/entities";

// NEW:  
import { User } from "@/api/auth";
```

**Files to update:**
- [ ] `src/pages/Settings.jsx`
- [ ] `src/pages/Trips.jsx` 
- [ ] `src/pages/Home.jsx`
- [ ] `src/pages/Lists.jsx`
- [ ] `src/pages/BaseListManager.jsx`
- [ ] `src/pages/ListEditor.jsx`
- [ ] `src/pages/ListManager.jsx`
- [ ] `src/pages/ListDetail.jsx`
- [ ] `src/pages/New.jsx`
- [ ] `src/components/settings/DeleteAccountDialog.jsx`
- [ ] `src/components/settings/BaseListEditor.jsx`
- [ ] `src/components/tips/TipListManager.jsx`

**Validation:**
- [ ] Login/logout works with Supabase
- [ ] User state persists across refreshes
- [ ] No console errors related to auth

---

## 📊 **Phase 3: Data Layer Migration**

### Step 3.1: Create Entity Services
Create `src/api/entities.js`:
```javascript
import { supabase } from './supabaseClient'

export class PackingListService {
  static async findMany(filters = {}) {
    let query = supabase.from('packing_lists').select('*')
    
    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  }

  static async create(data) {
    const { data: result, error } = await supabase
      .from('packing_lists')
      .insert([data])
      .select()
      .single()
    
    if (error) throw error
    return result
  }

  static async update(id, data) {
    const { data: result, error } = await supabase
      .from('packing_lists')
      .update({ ...data, updated_date: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return result
  }

  static async delete(id) {
    const { error } = await supabase
      .from('packing_lists')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}

export class BaseListService {
  static async findMany(filters = {}) {
    let query = supabase.from('base_lists').select('*')
    
    if (filters.list_type) {
      query = query.eq('list_type', filters.list_type)
    }
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  }

  static async create(data) {
    const { data: result, error } = await supabase
      .from('base_lists')
      .insert([data])
      .select()
      .single()
    
    if (error) throw error
    return result
  }
}

export class TipListService {
  static async findMany(filters = {}) {
    let query = supabase.from('tip_lists').select('*')
    
    if (filters.list_type) {
      query = query.eq('list_type', filters.list_type)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  }

  static async create(data) {
    const { data: result, error } = await supabase
      .from('tip_lists')
      .insert([data])
      .select()
      .single()
    
    if (error) throw error
    return result
  }
}

export class ListService {
  static async findMany(filters = {}) {
    let query = supabase.from('lists').select('*')
    
    if (filters.owner_id) {
      query = query.eq('owner_id', filters.owner_id)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  }

  static async create(data) {
    const { data: result, error } = await supabase
      .from('lists')
      .insert([data])
      .select()
      .single()
    
    if (error) throw error
    return result
  }

  static async update(id, data) {
    const { data: result, error } = await supabase
      .from('lists')
      .update({ ...data, updated_date: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return result
  }

  static async delete(id) {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}

// Export with base44-compatible names
export const PackingList = PackingListService
export const BaseList = BaseListService  
export const TipList = TipListService
export const List = ListService
```

### Step 3.2: Update All Entity Imports
No changes needed - imports remain the same:
```javascript
import { PackingList, BaseList, TipList, List } from "@/api/entities";
```

**Validation:**
- [ ] All entity operations work with Supabase
- [ ] Data loads correctly in all components  
- [ ] CRUD operations function properly
- [ ] No base44-related errors in console

---

## 🤖 **Phase 4: Remove AI/LLM Integration**

### Step 4.1: Update New.jsx
In `src/pages/New.jsx`, replace the InvokeLLM section (around line 681):

```javascript
// OLD - Remove this entire section:
const response = await InvokeLLM({
  prompt,
  response_json_schema: {
    // ... schema definition
  }
});

// NEW - Replace with simple static suggestion:
const generateStaticSuggestions = (weatherType, baseItems) => {
  const suggestions = {
    cold: [
      { name: "Thermal Underwear", category: "clothing", quantity: 2 },
      { name: "Warm Jacket", category: "clothing", quantity: 1 },
      { name: "Gloves", category: "clothing", quantity: 1 },
      { name: "Scarf", category: "clothing", quantity: 1 },
      { name: "Beanie", category: "clothing", quantity: 1 }
    ],
    warm: [
      { name: "Sunscreen", category: "toiletries", quantity: 1 },
      { name: "Sunglasses", category: "essentials", quantity: 1 },
      { name: "Light Jacket", category: "clothing", quantity: 1 },
      { name: "Sandals", category: "clothing", quantity: 1 }
    ],
    // Add more weather-based suggestions...
  };
  
  return { items: suggestions[weatherType] || [] };
};

const response = generateStaticSuggestions(weatherType, baseItems);
```

### Step 4.2: Remove InvokeLLM Import
In `src/pages/New.jsx`:
```javascript
// OLD - Remove this line:
import { InvokeLLM } from "@/api/integrations";

// No replacement needed
```

**Validation:**
- [ ] New packing list creation works without AI
- [ ] Static suggestions appear correctly
- [ ] No InvokeLLM-related errors

---

## 🏷️ **Phase 5: Clean Base44 References**

### Step 5.1: Update package.json
```json
{
  "name": "packly",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  // ... rest remains the same
}
```

### Step 5.2: Update index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/packly-logo.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Packly - Smart Packing Lists</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### Step 5.3: Add Packly Logo
- [ ] Create or download a Packly logo as `/public/packly-logo.svg`
- [ ] Save a larger logo as `/public/packly-logo.png` for the home page

### Step 5.4: Update Home.jsx Logo
In `src/pages/Home.jsx` (around line 203):
```javascript
// OLD:
src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/44165e_thehizki_Minimalist_modern_web_app_logo_for_a_travel_and_packin_e1d8508e-b43c-44a9-88f4-186b1b61ef74.png"

// NEW:
src="/packly-logo.png"
```

### Step 5.5: Rewrite README.md
```markdown
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
VITE_SUPABASE_URL=https://xvsbrhcigjjnphnuxaay.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2c2JyaGNpZ2pqbnBobnV4YWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MjQ1OTEsImV4cCI6MjA2OTIwMDU5MX0.n_DGOaX8ZLNwqiDO9vB4ncI_cU7EN4bWT-4_gzudEAY
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
```

**Validation:**
- [ ] App title shows "Packly" in browser tab
- [ ] Favicon displays correctly  
- [ ] Logo displays on home page
- [ ] README reflects new branding

---

## 🧹 **Phase 6: Final Cleanup**

### Step 6.1: Remove Base44 Files
```bash
rm src/api/base44Client.js
```

### Step 6.2: Clean integrations.js
Replace `src/api/integrations.js` with:
```javascript
// This file previously contained base44 integrations
// All functionality has been migrated to native implementations
// File kept for potential future integrations

export const Integrations = {
  // Future integrations can be added here
}
```

### Step 6.3: Verify Dependencies
Check `package.json` - ensure `@base44/sdk` is removed:
```bash
npm list @base44/sdk  # Should show "empty"
```

### Step 6.4: Final Testing
- [ ] Run full app: `npm run dev`
- [ ] Test user registration/login
- [ ] Create a new packing list
- [ ] Edit existing lists  
- [ ] Verify all pages load without errors
- [ ] Check browser console for any base44 references

### Step 6.5: Clean Git History (Optional)
```bash
# Remove base44 references from commit history if desired
git filter-branch --tree-filter 'rm -f src/api/base44Client.js' HEAD
```

**Final Validation:**
- [ ] No base44 references in codebase: `grep -r "base44" src/`
- [ ] No base44 references in console
- [ ] App fully functional
- [ ] All tests pass: `npm run test` (if tests exist)

---

## 🎉 **Migration Complete!**

### Post-Migration Checklist
- [ ] Update deployment configuration (if applicable)
- [ ] Update any CI/CD pipelines
- [ ] Update environment variables in production
- [ ] Inform team members of changes
- [ ] Update documentation/wiki references
- [ ] Consider setting up monitoring for the new backend

### Rollback Plan (If Needed)
1. `git revert` to pre-migration commit
2. Reinstall base44 SDK: `npm install @base44/sdk@^0.1.2`
3. Restore original environment variables
4. Contact base44 support if data recovery needed

---

**Migration Completed:** [Date]  
**Migrated By:** [Name]  
**Notes:** [Any additional notes or issues encountered] 