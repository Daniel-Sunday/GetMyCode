# GetCode

GetCode is a secure verification portal for classroom attendance code claiming. Instructors upload session spreadsheets containing lists of authorized student emails and unique claim codes via the admin dashboard. Attendees select their active session, authenticate their email via a 6-digit One-Time Password sent through Resend, and copy their unique attendance code inline to confirm their claim.

## Setup Local Environment

Create a `.env.local` file at the root of the project with the following configuration:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-client-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-secret-service-role-key

# Email Dispatch
RESEND_API_KEY=your-resend-api-key

# Admin Configuration
ADMIN_PASSWORD=your-secure-admin-password
```

### Key Retrieval Guidance:
1. **Supabase URL & Anon Key**: Retrieve these from the **API Keys** section under **Project Settings > API** in your Supabase Dashboard.
2. **Supabase Service Role Key**: Retrieve this from the same section in your Supabase Dashboard. *Keep this key secret as it bypasses Row Level Security (RLS) policies.*
3. **Resend API Key**: Create a free account at [resend.com](https://resend.com), navigate to **API Keys**, and generate a token.
4. **Admin Password**: Set a custom password of your choice to access `/admin/dashboard`.

## Running the Application Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local Next.js development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`.

## Deploying to Vercel

1. Make sure you have the Vercel CLI installed, or push your project to a GitHub repository.
2. Initialize Vercel deployment:
   ```bash
   vercel
   ```
3. Set your environment variables in the Vercel Dashboard project settings matching the `.env.local` keys.
4. Run a production build deployment:
   ```bash
   vercel --prod
   ```
