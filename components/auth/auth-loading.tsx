import React from 'react';

interface AuthLoadingProps {
    message?: string;
}

export function AuthLoading({ message = 'Loading...' }: AuthLoadingProps) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
                <p className="mt-4">{message}</p>
            </div>
        </div>
    );
}