import React from 'react';

export const AuthLoadingScreen: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 border-t-4 border-b-4 rounded-full border-primary animate-spin"></div>
                <p className="text-lg font-medium text-gray-600">Loading authentication...</p>
            </div>
        </div>
    );
};