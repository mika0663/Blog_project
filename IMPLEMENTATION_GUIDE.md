# Implementation Guide

This document provides a comprehensive overview of all features implemented in the Blog Project, the technologies used, and detailed explanations of how each component works.

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Architecture Overview](#architecture-overview)
3. [Feature Implementations](#feature-implementations)
4. [Technology Deep Dives](#technology-deep-dives)
5. [Code Patterns & Best Practices](#code-patterns--best-practices)

---

## Technology Stack

### Core Framework & Runtime
- **Next.js 16.1.1** (App Router)
  - Server-side rendering (SSR)
  - Server Components
  - Client Components
  - File-based routing
  - API routes

- **React 19.2.0**
  - Component-based architecture
  - Hooks (useState, useEffect, useMemo, etc.)
  - Context API

- **TypeScript 5**
  - Type safety
  - Interface definitions
  - Type inference

### Backend & Database
- **Supabase**
  - PostgreSQL database
  - Authentication service
  - Row Level Security (RLS)
  - GraphQL API
  - REST API
  - Real-time subscriptions

### Data Fetching & State Management
- **Apollo Client 4.0.11**
  - GraphQL client
  - Query caching
  - Mutation handling
  - Error handling
  - Authentication headers

- **GraphQL 16.12.0**
  - Query language
  - Type system
  - Schema definition

### Form Management & Validation
- **React Hook Form 7.60.0**
  - Form state management
  - Performance optimization
  - Uncontrolled components

- **Zod 3.25.76**
  - Schema validation
  - Type inference
  - Runtime type checking

- **@hookform/resolvers 3.10.0**
  - Integration between React Hook Form and Zod

### UI Components & Styling
- **Radix UI**
  - Accessible component primitives
  - Unstyled components
  - Keyboard navigation
  - ARIA attributes

- **Tailwind CSS 4.1.9**
  - Utility-first CSS
  - Responsive design
  - Dark mode support
  - Custom theme configuration

- **next-themes 0.4.6**
  - Theme switching
  - System preference detection
  - Persistent theme storage

### UI Libraries
- **Lucide React 0.454.0**
  - Icon library
  - SVG icons
  - Tree-shakeable

- **Framer Motion 12.23.26**
  - Animation library
  - Page transitions
  - Component animations

- **Sonner 1.7.4**
  - Toast notifications
  - Success/error messages
  - Non-blocking UI feedback

### Utilities
- **date-fns 4.1.0**
  - Date formatting
  - Date manipulation
  - Locale support

- **clsx & tailwind-merge**
  - Conditional class names
  - Tailwind class merging

---

## Architecture Overview

### Project Structure

```
Blog_project/
├── app/                          # Next.js App Router
│   ├── auth/                     # Authentication pages
│   │   ├── login/                # Login page
│   │   ├── sign-up/              # Registration page
│   │   └── error/                # Auth error page
│   ├── blog/                     # Blog post pages
│   │   └── [slug]/               # Dynamic post page
│   ├── categories/               # Category pages
│   │   ├── page.tsx              # Category listing
│   │   └── [slug]/               # Category detail page
│   ├── protected/                # Authenticated routes
│   │   ├── layout.tsx           # Protected layout wrapper
│   │   ├── page.tsx             # User dashboard
│   │   ├── new/                 # Create post page
│   │   ├── edit/[slug]/         # Edit post page
│   │   └── settings/            # User settings page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   └── providers.tsx            # Apollo Provider wrapper
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   ├── app-sidebar.tsx          # Sidebar navigation
│   ├── blog-header.tsx          # Blog header component
│   ├── post-actions.tsx         # Post edit/delete actions
│   └── user-menu.tsx            # User dropdown menu
├── lib/                         # Utility libraries
│   ├── apollo/                  # Apollo Client setup
│   │   └── client.ts            # Apollo configuration
│   ├── graphql/                 # GraphQL queries/mutations
│   │   └── queries.ts           # All GraphQL operations
│   ├── supabase/                # Supabase clients
│   │   ├── client.ts           # Browser client
│   │   └── server.ts            # Server client
│   └── validations/             # Zod schemas
│       ├── auth.ts             # Auth form schemas
│       └── settings.ts         # Settings form schemas
└── scripts/                     # Database scripts
    ├── 001_initial_schema.sql  # Database schema
    └── seed-posts.js           # Seed script
```

### Data Flow

1. **Client-Side Data Fetching**:
   - Apollo Client → GraphQL API → Supabase
   - React Query hooks (`useQuery`, `useMutation`)
   - Automatic caching and refetching

2. **Server-Side Data Fetching**:
   - Next.js Server Components
   - Supabase Server Client
   - Direct database queries

3. **Authentication Flow**:
   - Supabase Auth → JWT tokens
   - Tokens stored in cookies (SSR)
   - Tokens included in GraphQL headers

---

## Feature Implementations

### 1. Authentication System

#### 1.1 Sign Up Implementation

**Location**: `app/auth/sign-up/page.tsx`

**Technologies Used**:
- React Hook Form for form management
- Zod for validation
- Supabase Auth for user registration

**Key Features**:
- Email and password registration
- Password strength validation
- Password confirmation matching
- Automatic profile creation via database trigger

**Implementation Details**:

```typescript
// Validation Schema (lib/validations/auth.ts)
export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and number"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})
```

**Form Implementation**:
- Uses `useForm` hook from React Hook Form
- `zodResolver` integrates Zod validation
- Real-time validation feedback
- Error messages displayed per field

**Database Trigger**:
- Automatically creates profile record on user signup
- Trigger: `on_auth_user_created`
- Function: `handle_new_user()`

#### 1.2 Login Implementation

**Location**: `app/auth/login/page.tsx`

**Features**:
- Email/password authentication
- Form validation with Zod
- Error handling
- Redirect to dashboard on success

**Implementation**:
```typescript
const onSubmit = async (data: LoginFormData) => {
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })
  
  if (error) {
    form.setError("root", { message: error.message })
  } else {
    router.push("/protected")
  }
}
```

#### 1.3 Protected Routes

**Location**: `app/protected/layout.tsx`

**Implementation**:
- Server Component that checks authentication
- Redirects unauthenticated users to login
- Wraps all protected pages
- Provides user context to child components

```typescript
export default async function ProtectedLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }
  
  return <SidebarProvider>...</SidebarProvider>
}
```

---

### 2. Blog Post Management

#### 2.1 Create Post (GraphQL Mutation)

**Location**: `app/protected/new/page.tsx`

**Technologies**:
- Apollo Client `useMutation`
- GraphQL mutation
- React state management

**GraphQL Mutation** (`lib/graphql/queries.ts`):
```graphql
mutation CreatePost(
  $title: String!
  $slug: String!
  $content: String!
  $excerpt: String
  $cover_image: String
  $category_id: UUID
  $author_id: UUID!
  $is_published: Boolean!
  $published_at: Datetime
) {
  insertIntopostsCollection(objects: [{ ... }]) {
    records { id, title, slug, ... }
  }
}
```

**Implementation Flow**:
1. User fills form (title, content, excerpt, category, etc.)
2. Slug auto-generated from title
3. Form submission triggers GraphQL mutation
4. Apollo Client sends mutation with JWT token
5. Supabase processes mutation
6. Success: redirect to dashboard
7. Error: display toast notification

**Key Features**:
- Auto-slug generation from title
- Category selection via GraphQL query
- Publish/draft toggle
- Cover image URL input
- Rich content textarea

#### 2.2 Edit Post

**Location**: `app/protected/edit/[slug]/page.tsx`

**Implementation**:
- Fetches existing post data via Supabase REST API
- Pre-fills form with current values
- Updates post using REST API (can be migrated to GraphQL)
- Permission check: only author can edit

**Features**:
- Pre-populated form fields
- Maintains publish status
- Updates `updated_at` timestamp
- Preserves `published_at` if already published

#### 2.3 Delete Post

**Location**: `components/post-actions.tsx`

**Implementation**:
- Dropdown menu with edit/delete options
- AlertDialog for delete confirmation
- REST API delete operation
- Permission verification

**User Experience**:
- Confirmation dialog prevents accidental deletion
- Loading state during deletion
- Toast notification on success/error
- Automatic redirect to dashboard

#### 2.4 Post Listing (Dashboard)

**Location**: `app/protected/page.tsx`

**Features**:
- Server Component for initial data fetch
- Lists all user's posts (published and drafts)
- Status badges (Published/Draft)
- Category display
- Post actions (edit/delete) per row
- Table layout with sorting

---

### 3. Homepage & Post Display

#### 3.1 Homepage with Pagination

**Location**: `app/page.tsx`

**Technologies**:
- Apollo Client `useQuery`
- GraphQL queries
- Client-side data enrichment
- URL-based pagination

**GraphQL Queries**:
- `GET_PAGINATED_POSTS`: All published posts
- `GET_PAGINATED_POSTS_BY_CATEGORY`: Filtered by category
- `GET_CATEGORIES`: All categories
- `GET_CATEGORY_BY_SLUG`: Category lookup

**Pagination Implementation**:
```typescript
const POSTS_PER_PAGE = 5
const page = parseInt(searchParams.get("page") || "1", 10)
const offset = (page - 1) * POSTS_PER_PAGE

useQuery(GET_PAGINATED_POSTS, {
  variables: { limit: POSTS_PER_PAGE, offset },
})
```

**Data Enrichment**:
Since Supabase GraphQL doesn't support nested relationships directly, we:
1. Fetch posts with `category_id` and `author_id`
2. Fetch categories separately
3. Fetch profiles separately
4. Map them together on the client

**Features**:
- 5 posts per page
- Previous/Next navigation
- Category filtering
- Author name display with fallback
- Excerpt truncation (200 characters)
- Cover image display
- Published date formatting

#### 3.2 Post Detail Page

**Location**: `app/blog/[slug]/page.tsx`

**Implementation**:
- GraphQL query: `GET_POST_BY_SLUG`
- Fetches full post content
- Enriches with category and profile data
- Displays author actions if user is author

**Features**:
- Full post content (HTML rendering)
- Author information
- Category badge
- Published date
- Cover image
- Edit/Delete actions (author only)

---

### 4. Category System

#### 4.1 Category Listing

**Location**: `app/categories/page.tsx`

**Features**:
- Lists all categories
- Post count per category
- Links to category detail pages
- Server Component for SEO

#### 4.2 Category Detail Page

**Location**: `app/categories/[slug]/page.tsx`

**Implementation**:
- Server Component
- Fetches category by slug
- Fetches posts in category
- Fallback mechanism for relationship queries

**Relationship Query Fallback**:
```typescript
// Try with relationship syntax first
const { data: posts } = await supabase
  .from("posts")
  .select(`
    *,
    profiles:author_id(full_name),
    categories:category_id(name, slug)
  `)

// If that fails, fetch separately and combine
if (postsError) {
  // Fetch posts, profiles, categories separately
  // Map them together
}
```

**Features**:
- Category name and description
- Filtered post listing
- Author names
- Published dates
- Breadcrumb navigation

---

### 5. User Settings

#### 5.1 Settings Page

**Location**: `app/protected/settings/page.tsx`

**Technologies**:
- React Hook Form
- Zod validation
- Radix UI Tabs
- Supabase Auth (OTP)
- Toast notifications

**Tab Structure**:
1. **Profile Tab**: Update full name
2. **Password Tab**: Change password
3. **Email Tab**: Change email address

#### 5.2 Profile Update

**Implementation**:
- Simple form with full name field
- Updates `profiles` table
- Creates profile if doesn't exist
- Real-time validation

#### 5.3 Password Change

**Validation Schema**:
```typescript
export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(6)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  confirmPassword: z.string(),
  otp: z.string().optional(), // Optional for password changes
}).refine((data) => data.newPassword === data.confirmPassword)
```

**Security Flow**:
1. Verify current password
2. Optional OTP verification (for extra security)
3. Update password via Supabase Auth
4. Success notification

#### 5.4 Email Change

**Validation Schema**:
```typescript
export const updateEmailSchema = z.object({
  newEmail: z.string().email(),
  currentPassword: z.string().min(1),
  otp: z.string().min(6).max(6), // Required for email changes
})
```

**OTP Flow**:
1. User requests OTP
2. Supabase sends OTP to current email
3. User enters 6-digit code
4. Verify OTP
5. Update email address
6. Re-authenticate if needed

**Implementation**:
```typescript
// Request OTP
await supabase.auth.resend({
  type: 'email',
  email: user.email,
})

// Verify OTP
const { error } = await supabase.auth.verifyOtp({
  email: user.email,
  token: otp,
  type: 'email',
})
```

---

### 6. User Interface Components

#### 6.1 User Menu

**Location**: `components/user-menu.tsx`

**Features**:
- Avatar with user initials
- Dropdown menu (Radix UI)
- User name and email display
- Settings link
- Logout button

**Implementation**:
- Fetches user profile
- Generates initials from name or email
- Handles logout with redirect

#### 6.2 Post Actions

**Location**: `components/post-actions.tsx`

**Features**:
- Dropdown menu (MoreHorizontal icon)
- Edit option (navigates to edit page)
- Delete option (opens confirmation dialog)
- Permission checks

**AlertDialog Implementation**:
- Prevents accidental deletion
- Loading state during deletion
- Error handling

#### 6.3 Form Components

**Location**: `components/ui/form.tsx`

**Architecture**:
- Wraps React Hook Form
- Integrates with Radix UI Label
- Provides FormField, FormItem, FormLabel, FormControl, FormMessage
- Type-safe with TypeScript

**Usage Pattern**:
```typescript
<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

---

## Technology Deep Dives

### Apollo Client Configuration

**Location**: `lib/apollo/client.ts`

**Setup**:
```typescript
const httpLink = new HttpLink({
  uri: `${supabaseUrl}/graphql/v1`,
})

const authLink = setContext(async (_, { headers }) => {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    headers: {
      ...headers,
      "apikey": supabaseAnonKey,
      "Authorization": session 
        ? `Bearer ${session.access_token}` 
        : `Bearer ${supabaseAnonKey}`,
    },
  }
})

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
})
```

**Features**:
- Automatic JWT token injection
- Error handling link
- In-memory caching
- Network error handling

### Supabase Client Setup

#### Browser Client
**Location**: `lib/supabase/client.ts`

```typescript
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### Server Client
**Location**: `lib/supabase/server.ts`

```typescript
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

**Key Differences**:
- Browser client: Uses browser storage for sessions
- Server client: Uses Next.js cookies for SSR
- Both handle session refresh automatically

### Row Level Security (RLS)

**Database Policies**:

**Profiles**:
```sql
-- Public read access
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true)

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
```

**Posts**:
```sql
-- Published posts: public read
CREATE POLICY "Published posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (is_published = true)

-- Authors can view their own unpublished posts
CREATE POLICY "Users can view their own unpublished posts"
  ON public.posts FOR SELECT
  USING (auth.uid() = author_id)

-- Authors can only create/update/delete their own posts
CREATE POLICY "Users can update their own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = author_id)
```

**Benefits**:
- Database-level security
- Prevents unauthorized access
- Works with both REST and GraphQL APIs
- No application-level permission checks needed

### GraphQL Query Patterns

#### Pagination Query
```graphql
query GetPaginatedPosts($limit: Int!, $offset: Int!) {
  postsCollection(
    first: $limit
    offset: $offset
    orderBy: { published_at: DescNullsLast }
    filter: { is_published: { eq: true } }
  ) {
    edges {
      node {
        id
        title
        slug
        excerpt
        published_at
        category_id
        author_id
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
    }
  }
}
```

#### Filtered Query
```graphql
query GetPaginatedPostsByCategory(
  $limit: Int!
  $offset: Int!
  $categoryId: UUID!
) {
  postsCollection(
    first: $limit
    offset: $offset
    filter: {
      is_published: { eq: true }
      category_id: { eq: $categoryId }
    }
  ) { ... }
}
```

#### Mutation
```graphql
mutation CreatePost($input: PostsInsertInput!) {
  insertIntopostsCollection(objects: [$input]) {
    records {
      id
      title
      slug
    }
  }
}
```

### Form Validation with Zod

**Schema Definition**:
```typescript
const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(6, "Too short")
    .regex(/pattern/, "Must match pattern"),
})
```

**Integration with React Hook Form**:
```typescript
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { email: "", password: "" },
})
```

**Benefits**:
- Type-safe validation
- Automatic TypeScript types
- Runtime validation
- Reusable schemas

---

## Code Patterns & Best Practices

### 1. Component Patterns

#### Server Components (Default)
- Used for initial data fetching
- SEO-friendly
- No client-side JavaScript
- Direct database access

#### Client Components (`"use client"`)
- Used for interactivity
- Form handling
- State management
- Apollo Client hooks

### 2. Error Handling

**GraphQL Errors**:
```typescript
const { data, error } = useQuery(QUERY)
if (error) {
  console.error("GraphQL error:", error)
  toast.error("Failed to load data")
}
```

**Mutation Errors**:
```typescript
const [mutation, { error }] = useMutation(MUTATION, {
  onError: (error) => {
    toast.error(error.message)
  },
})
```

### 3. Loading States

**Pattern**:
```typescript
const { data, loading } = useQuery(QUERY)

if (loading) {
  return <Loader2 className="animate-spin" />
}
```

### 4. Type Safety

**Interface Definitions**:
```typescript
interface Post {
  id: string
  title: string
  slug: string
  content: string
  author_id: string
  category_id: string | null
}
```

**Type Inference from Zod**:
```typescript
type LoginFormData = z.infer<typeof loginSchema>
```

### 5. Data Fetching Strategies

**Client-Side**:
- Apollo Client `useQuery` for GraphQL
- React state for local data
- `useEffect` for side effects

**Server-Side**:
- Direct Supabase queries
- Server Components
- No client-side JavaScript

### 6. Authentication Patterns

**Check Authentication**:
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  redirect("/auth/login")
}
```

**Include in GraphQL Headers**:
- Automatic via Apollo Client auth link
- JWT token from Supabase session
- Fallback to anon key

### 7. URL-Based State

**Pagination**:
```typescript
const searchParams = useSearchParams()
const page = parseInt(searchParams.get("page") || "1", 10)
```

**Category Filtering**:
```typescript
const categorySlug = searchParams.get("category")
```

### 8. Toast Notifications

**Success**:
```typescript
toast.success("Post created successfully!")
```

**Error**:
```typescript
toast.error(error.message || "Something went wrong")
```

### 9. Author Name Fallback

**Pattern**:
```typescript
const authorName = 
  profile?.full_name || 
  profile?.username || 
  user?.email?.split('@')[0] || 
  "Anonymous"
```

### 10. Slug Generation

**Implementation**:
```typescript
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
```

---

## Summary

This blog project demonstrates:

1. **Modern Full-Stack Architecture**: Next.js App Router with Server and Client Components
2. **GraphQL Integration**: Apollo Client with Supabase GraphQL API
3. **Type Safety**: TypeScript + Zod for end-to-end type safety
4. **Form Management**: React Hook Form with Zod validation
5. **Authentication**: Supabase Auth with JWT tokens
6. **Database Security**: Row Level Security policies
7. **UI Components**: Radix UI with Tailwind CSS
8. **User Experience**: Toast notifications, loading states, error handling
9. **Code Organization**: Clear separation of concerns, reusable components
10. **Best Practices**: Server-side rendering, client-side interactivity, proper error handling

The implementation follows React and Next.js best practices, ensuring maintainability, scalability, and excellent user experience.

