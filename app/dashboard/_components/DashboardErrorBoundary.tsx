'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class DashboardErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            const isAuthError = this.state.error?.message.toLowerCase().includes('unauthorized') ||
                this.state.error?.message.toLowerCase().includes('permission');

            return (
                <div className="flex items-center justify-center min-h-[400px] p-6">
                    <Alert variant="destructive" className="max-w-lg">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{isAuthError ? 'Access Denied' : 'Something went wrong'}</AlertTitle>
                        <AlertDescription className="mt-2">
                            {isAuthError
                                ? 'You do not have permission to access this content. Please contact an administrator if you believe this is an error.'
                                : 'An unexpected error occurred while loading this component. Please try refreshing the page.'}
                        </AlertDescription>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => window.location.reload()}
                        >
                            Refresh Page
                        </Button>
                    </Alert>
                </div>
            );
        }

        return this.props.children;
    }
}