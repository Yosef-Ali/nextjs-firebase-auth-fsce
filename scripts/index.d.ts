// Type definitions for Script Utilities
declare module 'scripts/*' {
    interface ScriptResult {
        success: boolean;
        duration: number;
        affectedRecords: number;
        error?: Error;
        metadata: Record<string, any>;
    }

    interface ScriptConfig {
        dryRun: boolean;
        batchSize: number;
        validateOnly: boolean;
        logLevel: 'verbose' | 'info' | 'warn' | 'error';
    }

    interface SeedParams {
        clearExisting: boolean;
        sampleSize: number;
        randomize: boolean;
    }
}
