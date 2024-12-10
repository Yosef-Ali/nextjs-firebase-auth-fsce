# FSCE 2024 - Next.js Firebase Auth App

This document provides instructions for setting up, developing, and deploying the FSCE 2024 web application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Installation](#installation)
- [Development](#development)
- [Firebase Setup](#firebase-setup)
- [Project Structure](#project-structure)
- [URL Structure](#url-structure)
- [Available Scripts](#available-scripts)
- [Common Tasks](#common-tasks)
- [UI Components (shadcn/ui)](#ui-components-shadcnui)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Deployment](#deployment)
- [Security Considerations](#security-considerations)
- [Updates and Maintenance](#updates-and-maintenance)
- [Need Help?](#need-help)
- [Authentication & User Management](#authentication--user-management)
- [Posts Management](#posts-management)
- [Query Strategy](#query-strategy)
- [Firebase Authentication Setup](#firebase-authentication-setup)

## Prerequisites

Before you begin, ensure you have the following installed:

- [Bun](https://bun.sh/) (Latest version)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)

## Environment Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/nextjs-firebase-auth-app.git
cd nextjs-firebase-auth-app
```

2. Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

3. Update the `.env.local` file with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Installation

Install dependencies using Bun:

```bash
bun install
```

## Development

Start the development server:

```bash
bun dev
```

The application will be available at `http://localhost:3000`

## Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication methods:
   - Email/Password
   - Google (optional)
3. Create Firestore Database:

   - Start in production mode
   - Choose a location closest to your users

4. Set up Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Project Structure

```
nextjs-firebase-auth-app/
├── app/
│   ├── (auth)/            # Authentication routes
│   │   └── (routes)/
│   │       ├── sign-in/   # Sign in page
│   │       └── sign-up/   # Sign up page
│   ├── (dashboard)/       # Protected dashboard routes
│   │   └── (routes)/
│   │       ├── posts/     # Posts management
│   │       └── settings/  # User settings
│   └── (marketing)/       # Public pages
│       └── (routes)/
│           ├── what-we-do/             # What We Do section
│           │   ├── [category]/         # Dynamic category pages
│           │   │   └── [slug]/         # Dynamic program pages
│           │   └── page.tsx            # Main What We Do page
│           ├── where-we-work/          # Where We Work section
│           │   ├── [region]/           # Dynamic region pages
│           │   │   └── [slug]/         # Dynamic office pages
│           │   └── page.tsx            # Main Where We Work page
│           └── who-we-are/             # Who We Are section
│               ├── [section]/          # Dynamic section pages
│               │   └── [slug]/         # Dynamic content pages
│               └── page.tsx            # Main Who We Are page
├── components/            # Reusable components
├── lib/                  # Utility functions and configurations
├── public/              # Static assets
└── styles/             # Global styles
```

### URL Structure

The application follows a consistent URL structure for all sections:

1. What We Do Section:

   - Main page: `/what-we-do`
   - Category page: `/what-we-do/[category]` (e.g., `/what-we-do/prevention-promotion`)
   - Program page: `/what-we-do/[category]/[slug]` (e.g., `/what-we-do/prevention-promotion/early-childhood-education`)

2. Where We Work Section:

   - Main page: `/where-we-work`
   - Region page: `/where-we-work/[region]` (e.g., `/where-we-work/addis-ababa`)
   - Office page: `/where-we-work/[region]/[slug]` (e.g., `/where-we-work/addis-ababa/head-office`)

3. Who We Are Section:
   - Main page: `/who-we-are`
   - Section page: `/who-we-are/[section]` (e.g., `/who-we-are/partners`)
   - Content page: `/who-we-are/[section]/[slug]` (e.g., `/who-we-are/partners/unicef`)

This consistent structure makes the application:

- Easy to navigate
- SEO-friendly
- Maintainable and scalable

## Available Scripts

```bash
# Start development server
bun dev

# Build for production
bun run build

# Start production server
bun start

# Run type checking
bun run typecheck

# Run linting
bun run lint
```

## Common Tasks

### Adding a New Page

1. Create a new directory under `app/` for your page
2. Add your page component in a `page.tsx` file
3. Update navigation if needed in `app/components/Navigation.tsx`

### Managing Posts

- Create: Navigate to Dashboard > Posts > New Post
- Edit: Click the edit icon on any post in the posts table
- Delete: Use the delete action in the posts table
- View: Click on the post title to view details

## UI Components (shadcn/ui)

To add new shadcn components, use:

```bash
bunx --bun shadcn@latest add [component-name]
```

Common components:

- Button: `bunx --bun shadcn@latest add button`
- Dialog: `bunx --bun shadcn@latest add dialog`
- Table: `bunx --bun shadcn@latest add table`

## Troubleshooting

### Common Issues

1. **Firebase Connection Issues**

   - Verify your `.env.local` configuration
   - Check Firebase Console for service status
   - Ensure correct Firebase project is selected

2. **Build Errors**
   - Run `bun install` to update dependencies
   - Clear `.next` cache: `rm -rf .next`
   - Verify TypeScript types: `bun run typecheck`

### Need Help?

If you encounter any issues:

1. Check the [GitHub Issues](https://github.com/yourusername/nextjs-firebase-auth-app/issues)
2. Review Firebase documentation
3. Contact the development team on Slack

## Authentication & User Management

### User Creation

- Users are automatically created in Firestore when they sign in
- Basic user information is stored:
  - Email
  - Display name
  - Profile photo URL
  - Creation timestamp
  - Last update timestamp

### User Permissions

- All authenticated users have equal access to posts
- No role-based restrictions
- Simple permission model:
  - Must be signed in to access dashboard
  - Can view all posts
  - Can create new posts
  - Can edit any existing post
  - Can delete any post

## Posts Management

### Post Categories

All content types (news, events, programs, etc.) are managed through a single `posts` collection with different categories:

- `news`: News articles and updates
- `events`: Upcoming and past events
- `programs`: Program information and details
- `who-we-are`: Organization information
- `what-we-do`: Activity descriptions

### Query Strategy

We use a simplified query approach to minimize Firestore index requirements and improve maintainability:

1. Simple Queries

   - Basic collection queries without complex conditions
   - Client-side filtering by category and status
   - In-memory sorting by date

2. Example Usage:

```typescript
// Get all programs
const programs = await postsService.getPrograms();

// Get latest news
const news = await postsService.getLatestNews(5);

// Get upcoming events
const events = await postsService.getUpcomingEvents();
```

### Benefits

- No complex Firestore indexes required
- Easier to maintain and modify
- Better performance for small to medium datasets
- Simpler debugging and testing

### Considerations

- Best for collections with < 1000 documents
- May need pagination for larger datasets
- Monitor client-side performance

## Query Strategy

We use a simplified query approach to minimize Firestore index requirements and improve maintainability:

### Core Principles

1. Simple Queries

   - Use basic queries without complex compound conditions
   - Avoid using multiple `where` clauses that would require composite indexes
   - Prefer client-side filtering over complex database queries

2. In-Memory Processing
   - Filtering: Apply additional filters in memory (e.g., published status, dates)
   - Sorting: Sort data in memory using JavaScript's native sort methods
   - Pagination: Use array slicing for limiting results

### Implementation Example

```typescript
// Instead of this complex query:
const q = query(
  collection(db, "posts"),
  where("category", "==", "events"),
  where("published", "==", true),
  where("date", ">=", today),
  orderBy("date", "asc"),
  limit(5)
);

// Use this simple query and filter in memory:
const q = query(collection(db, "posts"));
const posts = await getDocs(q);

return posts
  .filter(
    (post) =>
      post.category === "events" &&
      post.published &&
      new Date(post.date) >= today
  )
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .slice(0, 5);
```

### Benefits

1. No complex Firestore indexes required
2. Easier to maintain and modify filters
3. Better performance for small to medium datasets
4. More predictable query behavior
5. Simpler debugging and testing

### Considerations

- Best suited for collections with < 1000 documents
- May need pagination for larger datasets
- Monitor client-side performance with large result sets
- Consider implementing server-side filtering for sensitive data

### Services Using This Pattern

- Posts Service (`app/services/posts.ts`)
- Events Service (`app/services/events.ts`)
- News Service (`app/services/news.ts`)
- What We Do Service (`app/services/what-we-do.ts`)

## Firebase Authentication Setup

The application uses Firebase Authentication for user management. Here's how it's organized and how to use it:

### File Structure

```
/app/lib/firebase/
├── auth.ts              # Core authentication methods
├── auth-hooks.ts        # React hooks for auth
├── auth-context.tsx     # Authentication context provider
├── firebase-config.ts   # Firebase initialization
├── firebase-admin.ts    # Admin SDK setup
├── firestore-hooks.ts   # Firestore hooks
├── user-service.ts      # User management
└── firebase.d.ts        # Type definitions
```

### Authentication Methods

The `auth.ts` file provides these core authentication methods:

```typescript
import { auth, signInWithGoogle, signInWithEmail, signUpWithEmail, signOutUser } from '@/app/lib/firebase/auth';

// Google Sign-in
await signInWithGoogle();

// Email/Password Sign-in
await signInWithEmail(email, password);

// Email/Password Sign-up
await signUpWithEmail(email, password, displayName);

// Sign-out
await signOutUser();
```

### Using Authentication Context

For components that need authentication, use the `useAuth` hook:

```typescript
import { useAuth } from '@/app/lib/firebase/auth-context';

function MyComponent() {
  const { user, userData, loading, signInWithGoogle } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;

  return <div>Welcome {user.displayName}!</div>;
}
```

### Protected Routes

To protect routes, wrap them with the authentication check:

```typescript
'use client';

import { useAuth } from '@/app/lib/firebase/auth-context';
import { LoadingScreen } from '@/components/loading-screen';

export default function ProtectedPage() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) {
    // Redirect to sign-in or show unauthorized message
    return <div>Unauthorized</div>;
  }

  return <div>Protected Content</div>;
}
```

### User Roles and Permissions

The application supports different user roles:
- `user`: Basic access
- `admin`: Full access to dashboard
- `editor`: Can edit content

User roles are stored in Firestore and can be accessed through `userData.role`.

### Environment Variables

Required Firebase environment variables in `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Security Rules

Firestore security rules are defined in `firestore.rules`. Make sure to:
1. Only allow authenticated users to read/write their own data
2. Implement role-based access control
3. Validate data structure and content

### Best Practices

1. **Error Handling**
   - Always wrap authentication calls in try-catch blocks
   - Provide user-friendly error messages
   - Log errors for debugging

2. **State Management**
   - Use the auth context for global auth state
   - Avoid storing sensitive information in local storage
   - Clear user data on logout

3. **Security**
   - Never expose Firebase credentials in client-side code
   - Implement proper session management
   - Use appropriate security rules in Firestore

4. **Performance**
   - Implement lazy loading for protected routes
   - Use appropriate Firebase SDK imports
   - Cache user data when appropriate

### Common Issues and Solutions

1. **Google Sign-in Popup Blocked**
   - Ensure sign-in is triggered by user interaction
   - Check browser popup settings
   - Use redirect method as fallback

2. **Authentication State Persistence**
   - Configure persistence in `firebase-config.ts`
   - Handle page refreshes properly
   - Manage token expiration

3. **Protected Route Flashing**
   - Show loading state while checking auth
   - Implement proper route guards
   - Use SSR when appropriate

## UI Components (shadcn/ui)

This project uses [shadcn/ui](https://ui.shadcn.com/) for its UI components. These components are built on top of Radix UI and styled with Tailwind CSS.

### Installing Components

Install shadcn/ui components using Bun:

```bash
bunx --bun shadcn@latest add <component-name>
```

Example installations:

```bash
# Install button component
bunx --bun shadcn@latest add button

# Install form components
bunx --bun shadcn@latest add form
bunx --bun shadcn@latest add input
bunx --bun shadcn@latest add select

# Install dialog/modal
bunx --bun shadcn@latest add dialog

# Install data table components
bunx --bun shadcn@latest add table
bunx --bun shadcn@latest add dropdown-menu
```

### Common Components Usage

#### Button Component

```tsx
import { Button } from "@/components/ui/button"

// Primary button
<Button>Click me</Button>

// Secondary button
<Button variant="secondary">Secondary</Button>

// Destructive button
<Button variant="destructive">Delete</Button>

// Button with icon
<Button>
  <PlusIcon className="mr-2 h-4 w-4" />
  Add New
</Button>
```

#### Form Components

```tsx
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

// Basic form field
<FormField
  control={form.control}
  name="title"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Title</FormLabel>
      <FormControl>
        <Input placeholder="Enter title" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

// Select field
<FormField
  control={form.control}
  name="category"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Category</FormLabel>
      <FormControl>
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="who-we-are">Who We Are</SelectItem>
            <SelectItem value="what-we-do">What We Do</SelectItem>
          </SelectContent>
        </Select>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### Table Component

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Title</TableHead>
      <TableHead>Category</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {posts.map((post) => (
      <TableRow key={post.id}>
        <TableCell>{post.title}</TableCell>
        <TableCell>{post.category}</TableCell>
        <TableCell>
          <Badge variant={post.published ? "default" : "secondary"}>
            {post.published ? "Published" : "Draft"}
          </Badge>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>;
```

#### Dialog/Modal

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Modal Title</DialogTitle>
      <DialogDescription>
        Modal description or content goes here.
      </DialogDescription>
    </DialogHeader>
    {/* Modal content */}
  </DialogContent>
</Dialog>;
```

### Styling Components

All components can be customized using Tailwind CSS classes:

```tsx
// Adding custom styles
<Button className="bg-custom-color hover:bg-custom-hover">
  Custom Button
</Button>

// Custom container styles
<Card className="p-4 shadow-lg hover:shadow-xl transition-shadow">
  Card Content
</Card>
```

### Best Practices

1. **Component Organization**

   - Keep reusable component configurations in separate files
   - Use composition for complex components
   - Create wrapper components for commonly used configurations

2. **Form Handling**

   - Use with react-hook-form for form state management
   - Implement proper validation using zod
   - Handle loading and error states appropriately

3. **Responsive Design**

   - Use Tailwind's responsive modifiers
   - Test components across different screen sizes
   - Implement mobile-first design principles

4. **Accessibility**
   - Maintain ARIA labels and roles
   - Ensure keyboard navigation works
   - Test with screen readers

## Contributing

1. Create a new branch for your feature:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit:

```bash
git add .
git commit -m "feat: your feature description"
```

3. Push your changes:

```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request on GitHub

## Deployment

1. Build the application:

```bash
bun run build
```

2. Test the production build locally:

```bash
bun start
```

3. Deploy to your hosting platform of choice (Vercel recommended)

## Security Considerations

- Keep `.env.local` file secure and never commit it
- Regularly update dependencies: `bun update`
- Follow Firebase security best practices
- Implement proper user authentication checks
- Use appropriate Firestore security rules

## Updates and Maintenance

1. Update dependencies:

```bash
bun update
```

2. Check for security vulnerabilities:

```bash
bun audit
```

3. Keep Firebase SDK up to date
4. Regularly review and update security rules
5. Monitor Firebase usage and quotas

## Need Help?

- Check the [Next.js Documentation](https://nextjs.org/docs)
- Visit [Firebase Documentation](https://firebase.google.com/docs)
- Review [Project Issues](https://github.com/yourusername/nextjs-firebase-auth-app/issues)
