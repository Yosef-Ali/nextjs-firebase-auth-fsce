// Type definitions for Temporary Updates
declare module 'temp-update/*' {
    interface TemporaryMigrationContext {
        migrationId: string;
        startedAt: Date;
        completedSteps: number;
        lastError?: Error;
        rollbackData: Record<string, any>;
    }

    // Configuration type overrides
    declare module 'temp-update/eslint.config' {
        export interface ESLintConfig {
            experimentalFeatures: boolean;
            legacySupport: boolean;
        }
    }

    declare module 'temp-update/next.config' {
        import { NextConfig } from 'next';
        export default function nextConfig(): NextConfig;
    }

    declare module 'temp-update/postcss.config' {
        export interface PostCSSConfig {
            useNesting: boolean;
            futureFeatures: boolean;
        }
    }

    declare module 'temp-update/tailwind.config' {
        import { Config } from 'tailwindcss';
        export default function tailwindConfig(): Config;
    }

    declare module 'temp-update/tsconfig' {
        import { CompilerOptions } from 'typescript';
        export interface TsConfig {
            compilerOptions: CompilerOptions & {
                experimentalDecorators: boolean;
                legacyModuleResolution: boolean;
            };
            include: string[];
            exclude: string[];
        }
    }
}
