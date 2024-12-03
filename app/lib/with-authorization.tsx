'use client';

import React, { ComponentType, useState } from 'react';
import { Authorization, UserRole, AuthorizationContext } from './authorization';
import { useAuth } from '@/app/providers/AuthProvider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WithAuthorizationProps {
  requiredRole?: UserRole;
  resourceOwnerId?: string;
}

export function withAuthorization<P extends object>(
  WrappedComponent: ComponentType<P>, 
  options: WithAuthorizationProps = {}
) {
  return function AuthorizedComponent(props: P) {
    const { 
      requiredRole = UserRole.USER, 
      resourceOwnerId 
    } = options;

    const { user, loading: authLoading } = useAuth();
    const [authError, setAuthError] = useState<string | null>(null);

    // Create authorization context
    const authContext: AuthorizationContext = {
      user,
      resourceOwnerId
    };

    // Handle loading state
    if (authLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    // Check authorization
    const isAuthorized = Authorization.canAccess(authContext, requiredRole);

    // If not authorized, render access denied view
    if (!isAuthorized) {
      return (
        <div className="space-y-6 max-w-xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Restricted</AlertTitle>
            <AlertDescription>
              {Authorization.isAdmin(user) 
                ? 'Unable to verify admin credentials.' 
                : 'You do not have permission to access this section.'}
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              {resourceOwnerId 
                ? 'You can only view or modify your own resources.' 
                : 'This section requires specific access privileges.'}
            </p>

            <Button 
              variant="outline" 
              disabled 
              className="w-full"
            >
              Access Denied
            </Button>
          </div>
        </div>
      );
    }

    // Render the wrapped component if authorized
    return <WrappedComponent {...props} />;
  };
}

// Utility hook for inline authorization checks
export function useAuthorization(options: WithAuthorizationProps = {}) {
  const { 
    requiredRole = UserRole.USER, 
    resourceOwnerId 
  } = options;

  const { user } = useAuth();
  const authContext: AuthorizationContext = { user, resourceOwnerId };

  return {
    isAuthorized: Authorization.canAccess(authContext, requiredRole),
    isAdmin: Authorization.isAdmin(user),
    user
  };
}
