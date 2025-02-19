const DEBUG = process.env.NEXT_PUBLIC_FIREBASE_DEBUG === 'true';

export const authLogger = {
    info: (message: string, ...args: any[]) => {
        if (DEBUG) {
            console.log(`[Auth] ${message}`, ...args);
        }
    },
    error: (message: string, error: any) => {
        if (DEBUG) {
            console.error(`[Auth Error] ${message}`, error);
            console.error('Stack trace:', error?.stack);
        }
    }
};

export default authLogger;