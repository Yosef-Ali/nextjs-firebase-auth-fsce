# Authentication Architecture

## Overview

The authentication system implements a clean, centralized architecture using Firebase Authentication with Next.js 13+ App Router. This document reflects the latest implementation with clear separation of concerns and unified state management.

## Core Components

### 1. AuthContext (`app/context/AuthContext.tsx`)
- Focused solely on auth state management
- Clear separation between Firebase auth and user data
- Granular loading states for better UX
- Type-safe context implementation
- Error boundary integration
- User data refresh capability

```typescript
interface AuthContextType {
    firebaseUser: FirebaseUser | null;    // Firebase auth state
    userData: UserData | null;           // User profile data
    isAuthLoading: boolean;              // Firebase auth loading
    isUserLoading: boolean;              // User data loading
    isLoading: boolean;                  // Combined loading state
    authError: Error | null;             // Auth-related errors
    userError: Error | null;             // User data errors
    refreshUserData: () => Promise<void>; // User data refresh
}
```

### 2. Route Protection (`app/lib/withAuth.tsx`)
- Higher-order component for route protection
- Centralized role-based access control
- Unified loading and error handling
- Clean redirect management
- Type-safe implementation

```typescript
export function withAuth(
    WrappedComponent: React.ComponentType,
    requiredRole: UserRole = UserRole.USER
) {
    return function ProtectedRoute(props: any) {
        const { firebaseUser, userData, isLoading } = useAuth();
        // Role verification and route protection logic
    };
}
```

### 3. Authorization Singleton (`app/lib/authorization.ts`)
The Authorization singleton provides centralized role-based access control:

```typescript
class Authorization {
    private static instance: Authorization;

    private constructor() {}

    public static getInstance(): Authorization {
        if (!Authorization.instance) {
            Authorization.instance = new Authorization();
        }
        return Authorization.instance;
    }

    public hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
        const roleHierarchy = {
            [UserRole.SUPER_ADMIN]: 4,
            [UserRole.ADMIN]: 3,
            [UserRole.EDITOR]: 2,
            [UserRole.USER]: 1,
            [UserRole.GUEST]: 0
        };

        return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
    }
}
```

### 4. Error Boundary (`app/components/error-boundary/AuthErrorBoundary.tsx`)
- Centralized error handling
- Graceful error fallback UI
- Error logging and reporting
- Retry mechanism

```typescript
export class AuthErrorBoundary extends React.Component<Props, State> {
    // Error boundary implementation
}

export const AuthErrorFallback: React.FC<{ error: Error | null }> = ({ error }) => {
    // Error fallback UI
};
```

### 5. Loading Screen (`app/components/loading-screen/AuthLoadingScreen.tsx`)
- Consistent loading experience
- Reusable component
- Customizable loading states
- Type-safe implementation

```typescript
export const AuthLoadingScreen: React.FC = () => {
    // Loading screen implementation
};
```

## Authentication Flow

1. **Initial Load**
   - AuthProvider initializes at app root
   - Firebase auth state listener activated
   - Loading states managed granularly
   - Error boundary wraps the context

2. **Auth State Changes**
   - Firebase auth state updates
   - User data fetched automatically
   - Loading states updated accordingly
   - Components re-render with new auth state

3. **Protected Routes**
   - withAuth HOC checks authentication
   - Role verification via Authorization singleton
   - Appropriate redirects handled automatically
   - Loading states shown during transitions

## State Management

### Loading States
The system implements granular loading state management:
- `isAuthLoading`: Firebase authentication state
- `isUserLoading`: User profile data loading
- `isLoading`: Combined loading state

### Error Handling
Two distinct error states with error boundary:
- `authError`: Firebase authentication errors
- `userError`: User data fetch errors

## Security Best Practices

1. **Authentication**
   - Single source of truth via AuthContext
   - Clear separation of concerns
   - Type-safe implementation
   - Proper error boundaries

2. **Authorization**
   - Centralized role verification
   - Singleton pattern for consistency
   - Clear role hierarchy
   - Protected route HOC

3. **State Management**
   - Granular loading states
   - Clear error handling
   - Type-safe interfaces
   - Consistent data flow

## Common Usage Patterns

### 1. Protected Component
```typescript
const AdminDashboard = withAuth(BaseComponent, UserRole.ADMIN);
```

### 2. Using Auth Context
```typescript
function UserProfile() {
    const { userData, isLoading, userError } = useAuth();
    
    if (isLoading) return <AuthLoadingScreen />;
    if (userError) return <AuthErrorFallback error={userError} />;
    if (!userData) return null;
    
    return <div>{userData.name}</div>;
}
```

### 3. Authorization Check
```typescript
const auth = Authorization.getInstance();
const canAccess = auth.hasMinimumRole(userData.role, UserRole.ADMIN);
```

## Testing Strategy

1. **Unit Tests**
   - Auth context behavior
   - Authorization singleton logic
   - Protected route HOC
   - Error boundary handling

2. **Integration Tests**
   - Complete auth flow
   - Role-based access
   - Loading state transitions
   - Error scenarios

3. **Error Scenarios**
   - Auth failures
   - Network issues
   - Invalid roles
   - Error boundary recovery

## Maintenance Guidelines

1. **Code Updates**
   - Maintain type safety
   - Follow separation of concerns
   - Document state changes
   - Test thoroughly

2. **Security Reviews**
   - Regular auth flow audits
   - Role permission reviews
   - Error handling validation

3. **Performance**
   - Monitor re-render frequency
   - Optimize data fetching
   - Review loading strategies