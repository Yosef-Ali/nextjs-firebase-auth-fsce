import React from 'react';
import { toast } from '@/hooks/use-toast';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
}

export class AuthErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error) {
        console.error('Auth Error caught:', error);
        toast({
            title: 'Authentication Error',
            description: 'There was a problem with authentication. Please try again.',
            variant: 'destructive',
        });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 text-center">
                    <h2 className="text-lg font-semibold text-red-600">Authentication Error</h2>
                    <p className="mt-2 text-gray-600">Please try signing in again</p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}