# Blog Project

A modern, full-featured blog application built with Next.js, Supabase, and GraphQL. Features user authentication, post management, category filtering, and a beautiful UI with dark mode support.

## 🚀 Features

### Core Features
- **Blog Post Management**: Create, read, update, and delete blog posts
- **User Authentication**: Secure sign-up, login, and session management
- **Pagination**: Browse posts with 5 posts per page
- **Category System**: Organize posts by categories
- **GraphQL API**: All data operations use Supabase GraphQL
- **Responsive Design**: Mobile-first, modern UI

### Bonus Features
- **User Settings Page**: Update profile name, password, and email with OTP verification
- **Post Editing**: Authors can edit their own posts
- **Post Deletion**: Authors can delete their own posts with confirmation
- **Category Pages**: Browse posts filtered by category
- **About Page**: Informative about page for the blog
- **User Menu**: Dropdown menu in header with user avatar, settings, and logout
- **Dark Mode**: Full theme support with next-themes
- **Form Validation**: Type-safe form validation with Zod and React Hook Form
- **Toast Notifications**: User-friendly feedback with Sonner
- **Author Display**: Smart author name fallback (full_name → username → email → "Anonymous")

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm**, **yarn**, or **pnpm** package manager
- **Supabase Account** (free tier works)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Blog_project
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

Using pnpm:
```bash
pnpm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note**: These variables are required for the application to function. See the "Linking to Supabase" section below for how to obtain these values.

## 🔗 How to Link to a Supabase Project

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in your project details:
   - **Name**: Choose a project name
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
5. Click "Create new project" and wait for provisioning (2-3 minutes)

### Step 2: Get Your Project Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Find the following values:
   - **Project URL**: Copy this value → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: Copy this value → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the SQL scripts in order:

   **a. Initial Schema** (`scripts/001_initial_schema.sql`):
   ```sql
   -- Creates tables: profiles, categories, posts
   -- Sets up Row Level Security (RLS) policies
   -- Creates trigger for automatic profile creation on signup
   ```

   **b. Seed Categories** (`scripts/002_seed_categories.sql`):
   ```sql
   -- Inserts default categories (Technology, Lifestyle, Travel, etc.)
   ```

   **c. (Optional) Seed Posts** (`scripts/003_seed_posts.sql` or `004_seed_posts_simple.sql`):
   ```sql
   -- Adds sample blog posts for testing
   ```

   Or use the Node.js script:
   ```bash
   npm run seed:posts
   ```

### Step 4: Configure Email Templates (for OTP)

1. Go to **Authentication** → **Email Templates**
2. For the **Magic Link** and **OTP** templates, ensure they include:
   ```
   {{ .Token }}
   ```
   or
   ```
   {{ .TokenHash }}
   ```
   This ensures the OTP code appears in the email.

3. Configure your email provider (SMTP) if you want custom emails, or use Supabase's default email service.

### Step 5: Update Environment Variables

Add the credentials to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 6: Verify GraphQL is Enabled

1. Go to **Settings** → **API**
2. Ensure **GraphQL** is enabled (it should be by default)
3. Your GraphQL endpoint will be: `https://your-project.supabase.co/graphql/v1`

## 🏃 How to Run Locally

### Development Mode

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

### Linting

Run ESLint to check for code issues:

```bash
npm run lint
```

## 🔐 How Auth is Configured

### Authentication Flow

The application uses **Supabase Auth** with the following setup:

#### 1. **Client-Side Auth** (`lib/supabase/client.ts`)
- Uses `@supabase/ssr` for browser-based authentication
- Handles session management in the browser
- Used in client components for user interactions

#### 2. **Server-Side Auth** (`lib/supabase/server.ts`)
- Uses `@supabase/ssr` with Next.js cookies
- Handles server-side session validation
- Used in server components and API routes

#### 3. **Authentication Pages**

**Sign Up** (`app/auth/sign-up/page.tsx`):
- Email and password registration
- Password strength validation (Zod schema)
- Password confirmation matching
- Automatic profile creation via database trigger

**Login** (`app/auth/login/page.tsx`):
- Email and password authentication
- Form validation with Zod
- Error handling and user feedback

**Sign Up Success** (`app/auth/sign-up-success/page.tsx`):
- Confirmation page after successful registration

**Error Page** (`app/auth/error/page.tsx`):
- Displays authentication errors

#### 4. **Protected Routes**

**Layout** (`app/protected/layout.tsx`):
- Wraps all authenticated routes
- Redirects unauthenticated users to login
- Includes user menu in header

**Protected Pages**:
- `/protected` - User dashboard (list of user's posts)
- `/protected/new` - Create new post
- `/protected/edit/[slug]` - Edit existing post
- `/protected/settings` - User settings

#### 5. **Row Level Security (RLS)**

The database uses Supabase RLS policies:

**Profiles**:
- Public read access
- Users can only insert/update their own profile

**Posts**:
- Published posts: Public read access
- Unpublished posts: Only author can view
- Users can only create/update/delete their own posts

**Categories**:
- Public read access
- Only authenticated users can manage

#### 6. **GraphQL Authentication**

Apollo Client is configured to include Supabase JWT tokens in GraphQL requests (`lib/apollo/client.ts`):
- Automatically attaches `Authorization` header with user's session token
- Falls back to anon key for unauthenticated requests
- Handles token refresh automatically

### OTP Verification (Settings Page)

For sensitive operations (password/email changes), the app uses OTP:

1. **Request OTP**: User requests OTP via email
2. **Receive Code**: OTP code sent to user's email
3. **Verify**: User enters 6-digit code to verify identity
4. **Proceed**: After verification, sensitive changes are allowed

**Note**: OTP is optional for password changes (current password verification is primary), but required for email changes.

## 🎨 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Form Management**: React Hook Form + Zod
- **Backend**: Supabase (PostgreSQL + Auth + GraphQL)
- **GraphQL Client**: Apollo Client
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Theme**: next-themes

## 📁 Project Structure

```
Blog_project/
├── app/                      # Next.js app directory
│   ├── auth/                 # Authentication pages
│   ├── blog/                 # Blog post detail pages
│   ├── categories/           # Category listing and detail pages
│   ├── protected/            # Authenticated user pages
│   │   ├── new/             # Create post
│   │   ├── edit/[slug]/     # Edit post
│   │   └── settings/        # User settings
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   └── providers.tsx        # Apollo Provider
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   ├── app-sidebar.tsx      # Sidebar navigation
│   ├── blog-header.tsx      # Blog header
│   ├── post-actions.tsx     # Post edit/delete actions
│   └── user-menu.tsx        # User dropdown menu
├── lib/                     # Utility libraries
│   ├── apollo/              # Apollo Client setup
│   ├── graphql/             # GraphQL queries and mutations
│   ├── supabase/            # Supabase clients
│   └── validations/         # Zod schemas
├── scripts/                 # Database scripts
│   ├── 001_initial_schema.sql
│   ├── 002_seed_categories.sql
│   └── seed-posts.js
└── public/                  # Static assets
```

## 🔍 GraphQL Queries & Mutations

All data operations use Supabase GraphQL:

### Queries
- `GET_PAGINATED_POSTS` - Fetch paginated posts
- `GET_PAGINATED_POSTS_BY_CATEGORY` - Fetch posts by category
- `GET_POST_BY_ID` - Fetch post by ID
- `GET_POST_BY_SLUG` - Fetch post by slug
- `GET_CATEGORIES` - Fetch all categories
- `GET_CATEGORY_BY_SLUG` - Fetch category by slug

### Mutations
- `CREATE_POST` - Create new blog post
- (Update/Delete use REST API for now)

## 🎯 Key Features Explained

### 1. Pagination
- Homepage displays 5 posts per page
- URL-based pagination (`?page=1`, `?page=2`)
- Previous/Next navigation buttons

### 2. Category Filtering
- Browse posts by category
- Category pages show filtered posts
- Category badges on post cards

### 3. Post Management
- **Create**: Rich text editor with title, content, excerpt, cover image, category
- **Edit**: Pre-filled form with existing post data
- **Delete**: Confirmation dialog before deletion
- **Publish**: Toggle publish status (draft/published)

### 4. User Settings
- **Profile**: Update full name
- **Password**: Change password with current password verification + optional OTP
- **Email**: Change email with current password + OTP verification

### 5. Author Display
Smart fallback chain for author names:
1. `profile.full_name`
2. `profile.username`
3. `user.email.split('@')[0]`
4. "Anonymous"

## 🐛 Troubleshooting

### "Error loading posts"
- Check that Supabase environment variables are set correctly
- Verify GraphQL is enabled in Supabase dashboard
- Check browser console for specific GraphQL errors

### OTP not received
- Check Supabase email templates include `{{ .Token }}`
- Verify email provider is configured
- Check spam folder

### "Token has expired or is invalid"
- OTP codes expire after a few minutes
- Request a new OTP code
- Ensure you're entering the 6-digit code correctly

### Author name shows "Anonymous"
- Ensure user has a profile record in `profiles` table
- Check that `full_name` or `username` is set in profile
- Verify RLS policies allow reading profiles

### GraphQL errors
- Ensure Apollo Client is properly configured
- Check that JWT tokens are being sent in headers
- Verify Supabase GraphQL endpoint is accessible

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed:posts` - Seed sample posts (requires database setup)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend platform
- [Next.js](https://nextjs.org) for the React framework
- [Radix UI](https://www.radix-ui.com) for accessible components
- [Tailwind CSS](https://tailwindcss.com) for styling

---

**Happy Blogging! 🚀**

