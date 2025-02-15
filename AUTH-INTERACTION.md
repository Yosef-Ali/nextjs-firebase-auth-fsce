# Firebase Authentication Interaction Overview

## Core Structure

### Key Files
- `/lib/context/auth-context.tsx` - Auth context provider
- `/app/hooks/use-auth.ts` - Core auth hook implementation
- `/app/services/users/core.ts` - User service core functionality
- `/app/services/client/users.ts` - Client-side user service
- `/app/lib/withAuth.tsx` - Auth HOC protection
- `/app/lib/withRoleProtection.tsx` - Role-based protection
- `/app/types/user.ts` - Core user types and enums
- `/app/types/auth-types.ts` - Auth-specific types
- `/app/utils/user-utils.ts` - User data conversion utilities

## 1. Authentication Flow

### Sign-Up Process
1. User submits registration form
2. Firebase creates authentication record
3. Client user service creates Firestore user document
4. User metadata is initialized with default role
5. Role-based redirects are handled

### Sign-In Process
1. User provides credentials (email/password or Google)
2. Firebase validates authentication
3. Client service loads/updates user data
4. Auth context updates with user state
5. Role-based access control is applied

### Session Management
- Firebase handles persistent sessions
- Automatic token refresh
- Real-time auth state monitoring
- Role-based session validation

## 2. User Management

### Core User Service Features
```typescript
class UserCoreService {
  // Create/update user document with role inheritance
  async createUserIfNotExists(firebaseUser: FirebaseUser): Promise<User | null>;
  
  // Get user data with full metadata
  async getUser(uid: string): Promise<User | null>;
  
  // Get all users (admin only)
  async getAllUsers(): Promise<User[]>;
  
  // Role management with validation
  async updateUserRole(uid: string, role: UserRole): Promise<{ 
    success: boolean; 
    error?: string; 
    details?: any; 
  }>;
  
  // User deletion with cleanup
  async deleteUser(uid: string): Promise<{ 
    success: boolean; 
    error?: string; 
    details?: any; 
  }>;
}
```

### User Types
```typescript
enum UserRole {
  SUPER_ADMIN = 'super_admin',  // Has full system access
  ADMIN = 'admin',              // Has administrative access
  AUTHOR = 'author',            // Can manage content
  EDITOR = 'editor',            // Can edit content
  USER = 'user',                // Basic authenticated user
  GUEST = 'guest'              // Unauthenticated user
}

enum UserStatus {
  ACTIVE = 'active',           // User is active
  INACTIVE = 'inactive',       // Account disabled
  PENDING = 'pending',         // Awaiting verification
  BLOCKED = 'blocked'          // Access revoked
}

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: number;
  updatedAt: number;
  invitedBy: string | null;
  invitationToken: string | null;
  emailVerified: boolean;
  metadata: {
    lastLogin: number;
    createdAt: number;
  };
}
```

## 3. Security Implementation

### Role-Based Access Control
```typescript
// Role hierarchy definition
const ROLE_HIERARCHY = {
  [UserRole.SUPER_ADMIN]: [SUPER_ADMIN, ADMIN, AUTHER, USER],
  [UserRole.ADMIN]: [ADMIN, AUTHER, USER],
  [UserRole.AUTHER]: [AUTHER, USER],
  [UserRole.USER]: [USER]
};

// Using withRoleProtection HOC with hierarchy
export function AdminPage() {
  return withRoleProtection(PageComponent, UserRole.ADMIN);
}

// Using withAuth HOC for basic protection
export function ProtectedPage() {
  return withAuth(PageComponent);
}
```

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions for role checking
    function isSignedIn() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function hasRole(role) {
      let userData = getUserData();
      return userData != null && userData.role == role;
    }
    
    function isAdmin() {
      let userData = getUserData();
      return userData != null && 
        (userData.role == 'admin' || userData.role == 'super_admin');
    }
    
    // User collection rules
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() && 
        (request.auth.uid == userId || isAdmin());
    }
  }
}
```

## 4. Authentication Context Usage

```typescript
function ProtectedComponent() {
  const { 
    user,           // Firebase user with extended properties
    userData,       // Additional user metadata
    loading,        // Auth state loading indicator
    error          // Auth error state
  } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (!user || error) return <SignInPrompt />;
  if (user.status !== UserStatus.ACTIVE) return <PendingApproval />;
  
  return <AuthenticatedContent />;
}
```

## 5. Environment Configuration

Required in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_ADMIN_EMAIL=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

## 6. Error Handling

### Auth Error Types
```typescript
type AuthErrorCodes =
  | 'auth/invalid-email'
  | 'auth/user-disabled'
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/email-already-in-use'
  | 'auth/weak-password'
  | 'auth/operation-not-allowed'
  | 'auth/popup-closed-by-user'
  | 'auth/cancelled-popup-request'
  | 'auth/popup-blocked';
```

## 7. Best Practices

1. Security
   - Use role hierarchy for permissions
   - Implement proper type inheritance
   - Keep sensitive operations server-side
   - Validate all user input
   - Use custom claims for role management

2. Performance
   - Use real-time listeners efficiently
   - Implement proper user data caching
   - Batch Firestore operations
   - Minimize auth state changes

3. User Experience
   - Handle all auth states appropriately
   - Implement role-based redirects
   - Show clear error messages
   - Maintain proper loading states
   - Support multiple auth providers

4. Code Organization
   - Centralize type definitions
   - Use proper type inheritance
   - Implement consistent error handling
   - Maintain clear separation of concerns
   - Document security implementations

5. Maintenance
   - Keep dependencies updated
   - Monitor auth state changes
   - Log important auth events
   - Regular security audits
   - Document all role changes
