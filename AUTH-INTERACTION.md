# Firebase Authentication Interaction Overview

## Core Dependencies
```json
{
  "dependencies": {
    "firebase": "^10.7.0",
    "firebase-admin": "^11.11.1",
    "@firebase/app": "^0.9.25",
    "@firebase/auth": "^1.5.0",
    "@firebase/firestore": "^4.4.0",
    "firebase-functions": "^4.5.0"
  }
}
```

## Authentication Components

### 1. Firebase Context (`lib/firebase/context.tsx`)
```typescript
interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: Error | null;
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
```

### 2. Protected Routes
```typescript
// Using the withAuth HOC
const ProtectedPage = withAuth(BaseComponent, UserRole.ADMIN);

// Direct usage in components
function ProtectedComponent() {
  const { user, userData, loading } = useAuthContext();
  
  if (loading) return <LoadingScreen />;
  if (!user) return <UnauthorizedPage />;
  
  return <Component />;
}
```

## Authentication Flow

### 1. Application Initialization
```typescript
// Root layout wrapping
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

### 2. User Authentication
- Single source of truth via AuthContext
- Real-time auth state updates
- Consistent loading states
- Type-safe user data

### 3. Route Protection
- Centralized withAuth HOC
- Role-based access control
- Unified unauthorized handling
- Loading state management

## Security Implementation

### 1. Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
  }
}
```

### 2. Role Management
```typescript
const ROLE_HIERARCHY = {
  [UserRole.SUPER_ADMIN]: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AUTHOR, UserRole.EDITOR, UserRole.USER],
  [UserRole.ADMIN]: [UserRole.ADMIN, UserRole.AUTHOR, UserRole.EDITOR, UserRole.USER],
  [UserRole.AUTHOR]: [UserRole.AUTHOR, UserRole.EDITOR, UserRole.USER],
  [UserRole.EDITOR]: [UserRole.EDITOR, UserRole.USER],
  [UserRole.USER]: [UserRole.USER],
  [UserRole.GUEST]: [UserRole.GUEST]
};
```

## Error Handling

### 1. Authentication Errors
```typescript
try {
  await authOperation();
} catch (error) {
  // Typed error handling
  if (error instanceof AuthError) {
    handleAuthError(error);
  }
}
```

### 2. Route Protection Errors
- Unauthorized access redirects
- Role-based access denials
- Loading state handling

## Best Practices

### 1. State Management
- Use useAuthContext hook
- Handle loading states
- Type-safe operations
- Error boundaries

### 2. Component Structure
- Clean separation of concerns
- Consistent loading UI
- Error handling patterns
- Type-safe props

### 3. Security
- Role-based access
- Real-time auth state
- Secure routes
- Clean error handling

## Testing Considerations

### 1. Unit Tests
- Auth context behavior
- Protected route logic
- Role management
- Error scenarios

### 2. Integration Tests
- Full auth flows
- Route protection
- User permissions
- Loading states

### 3. E2E Testing
- Authentication flow
- Protected routes
- Error handling
- User experience

## Development Guidelines

### 1. Code Organization
- Centralized auth logic
- Clean file structure
- Clear responsibilities
- Consistent patterns

### 2. Error Management
- Proper error types
- User-friendly messages
- Error recovery
- Logging strategy

### 3. Performance
- Optimized auth checks
- Efficient role management
- Clean re-renders
- State caching

## Environment Setup
Required in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_ADMIN_EMAIL=
