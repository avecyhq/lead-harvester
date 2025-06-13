# Lead Harvester

A powerful lead scraping and management application built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- 📊 **Dashboard** - Overview of lead statistics and recent activity
- 📤 **Lead Upload** - Manual entry and bulk CSV upload capabilities
- 🔧 **Settings** - Configurable scraping parameters and notifications
- 📋 **Lead Table** - Sortable, interactive table with search and filtering
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 🔒 **Secure** - Built with Supabase for authentication and data storage

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd lead-harvester
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   
   Create a table called `leads` in your Supabase database:
   ```sql
   CREATE TABLE leads (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     company_name TEXT NOT NULL,
     contact_name TEXT NOT NULL,
     email TEXT NOT NULL UNIQUE,
     phone TEXT,
     website TEXT,
     industry TEXT,
     status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'rejected')),
     source TEXT,
     notes TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
   );

   -- Enable Row Level Security (RLS)
   ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

   -- Create a policy that allows all operations (adjust as needed for your auth setup)
   CREATE POLICY "Allow all operations" ON leads FOR ALL USING (true);

   -- Create an index on email for better performance
   CREATE INDEX idx_leads_email ON leads(email);
   
   -- Create an index on status for filtering
   CREATE INDEX idx_leads_status ON leads(status);
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
lead-harvester/
├── app/                    # Next.js App Router directory
│   ├── dashboard/         # Dashboard page
│   ├── upload/           # Lead upload page
│   ├── settings/         # Settings page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (redirects to dashboard)
├── components/            # Reusable components
│   ├── Navigation.tsx    # Navigation bar
│   └── LeadTable.tsx     # Lead data table
├── lib/                  # Utility libraries
│   └── supabase.ts       # Supabase client and database functions
├── public/               # Static assets
└── ...config files
```

## Database Schema

The `leads` table contains the following fields:

- `id` (UUID) - Primary key
- `company_name` (TEXT) - Required
- `contact_name` (TEXT) - Required  
- `email` (TEXT) - Required, unique
- `phone` (TEXT) - Optional
- `website` (TEXT) - Optional
- `industry` (TEXT) - Optional
- `status` (ENUM) - new, contacted, qualified, converted, rejected
- `source` (TEXT) - Optional lead source
- `notes` (TEXT) - Optional notes
- `created_at` (TIMESTAMP) - Auto-generated
- `updated_at` (TIMESTAMP) - Auto-generated

## Features Overview

### Dashboard
- Lead statistics cards
- Recent leads table
- Interactive data visualization

### Upload Page
- Single lead manual entry form
- Bulk CSV upload (planned feature)
- Form validation and error handling

### Settings Page
- Database configuration
- Notification preferences
- Scraping parameters
- API key management

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new pages in the `app/` directory
2. Add reusable components in `components/`
3. Database functions go in `lib/supabase.ts`
4. Update navigation in `components/Navigation.tsx`

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details 