'use client';

import React, { Component, ErrorInfo } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Props {
    children: React.ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Auth Error Boundary caught error:', {
            error,
            name: error.name,
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack
        });
        this.props.onError?.(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-100">
                    <div className="p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
                        <p className="text-gray-600 mb-4">
                            {this.state.error?.message || 'An error occurred during authentication.'}
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={() => this.setState({ hasError: false, error: null })}
                                className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Refresh Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export function AuthErrorBoundary({ children }: Props) {
    const { toast } = useToast();

    const handleError = (error: Error, errorInfo: ErrorInfo) => {
        console.error('Auth Error:', {
            error,
            info: errorInfo,
            time: new Date().toISOString()
        });

        let errorMessage = 'An error occurred during authentication';
        if (error.message.includes('auth/popup-blocked')) {
            errorMessage = 'Sign-in popup was blocked. Please allow popups and try again.';
        } else if (error.message.includes('auth/popup-closed-by-user')) {
            errorMessage = 'Sign-in was cancelled. Please try again.';
        } else if (error.message) {
            errorMessage = error.message;
        }

        toast({
            title: 'Authentication Error',
            description: errorMessage,
            variant: 'destructive',
        });
    };

    return (
        <ErrorBoundary onError={handleError}>
            {children}
        </ErrorBoundary>
    );
}