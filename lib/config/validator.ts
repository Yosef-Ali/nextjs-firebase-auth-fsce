type ConfigValidation = {
    isValid: boolean;
    missingVars: string[];
    message?: string;
};

class ConfigValidator {
    private static requiredVars = [
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
        'NEXT_PUBLIC_FIREBASE_APP_ID'
    ] as const;

    private static optionalVars = [
        'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
        'NEXT_PUBLIC_FIREBASE_DEBUG',
        'NEXT_PUBLIC_USE_FIREBASE_EMULATOR',
        'NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION'
    ] as const;

    static validateConfig(): ConfigValidation {
        const missingVars = this.requiredVars.filter(
            varName => !process.env[varName]
        );

        if (missingVars.length > 0) {
            return {
                isValid: false,
                missingVars,
                message: `Missing required environment variables: ${missingVars.join(', ')}`
            };
        }

        // Check for empty strings
        const emptyVars = this.requiredVars.filter(
            varName => process.env[varName] === ''
        );

        if (emptyVars.length > 0) {
            return {
                isValid: false,
                missingVars: emptyVars,
                message: `Required environment variables cannot be empty: ${emptyVars.join(', ')}`
            };
        }

        return {
            isValid: true,
            missingVars: []
        };
    }

    static getFirebaseConfig() {
        const validation = this.validateConfig();
        if (!validation.isValid) {
            throw new Error(validation.message);
        }

        return {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
        };
    }

    static isDebugMode(): boolean {
        return process.env.NEXT_PUBLIC_FIREBASE_DEBUG === 'true';
    }

    static isEmulatorEnabled(): boolean {
        return process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';
    }

    static requireEmailVerification(): boolean {
        return process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION === 'true';
    }
}