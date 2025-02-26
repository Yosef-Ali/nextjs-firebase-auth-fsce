// Type definitions for public assets
declare module 'public/*' {
    interface ImageMetadata {
        width: number;
        height: number;
        format: 'png' | 'svg' | 'jpeg' | 'gif';
    }

    interface CustomAssetConfig {
        mimeType?: string;
        cacheControl?: string;
        contentEncoding?: string;
    }

    // Image declarations
    const value: string;
    export default value;

    declare module '*.png' {
        const value: string;
        export default value;
    }

    declare module '*.svg' {
        const value: string;
        export default value;
    }

    declare module '*.jpeg' {
        const value: string & ImageMetadata;
        export default value;
    }

    declare module '*.gif' {
        const value: string;
        export default value;
    }

    // Font declarations
    declare module '*.woff';
    declare module '*.woff2';
    declare module '*.ttf';
    declare module '*.otf';

    // Generic file declarations
    declare module '*.pdf';
    declare module '*.md';
    declare module '*.txt';
}
