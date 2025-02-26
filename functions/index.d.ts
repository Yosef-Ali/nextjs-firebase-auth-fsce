// Type definitions for Cloud Functions
declare module 'functions/*' {
    import * as functions from 'firebase-functions';

    export interface FirebaseFunctionConfig {
        region?: functions.SupportedRegion;
        memory?: '128MB' | '256MB' | '512MB' | '1GB' | '2GB';
        timeoutSeconds?: number;
        retry?: boolean;
    }

    export interface HttpHandlerContext {
        auth?: {
            uid: string;
            email: string;
        };
        ip: string;
        userAgent: string;
    }

    export interface ScheduledFunctionPayload {
        timestamp: string;
        interval: string;
    }
}
