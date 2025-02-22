import React from 'react';

interface Props {
    children: React.ReactNode;
    fallback: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class AuthErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Auth Error:', error);
        console.error('Error Info:', errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }

        return this.props.children;
    }
}

export const AuthErrorFallback: React.FC<{ error: Error | null }> = ({ error }) => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-sm p-6 bg-white rounded-lg shadow-md">
                <h2 className="mb-4 text-xl font-bold text-red-600">Authentication Error</h2>
                <p className="mb-4 text-gray-700">
                    {error?.message || 'An error occurred during authentication'}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        </div>
    );
};