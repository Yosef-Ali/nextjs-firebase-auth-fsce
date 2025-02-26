// Central type definitions for the application
declare module 'app/*' {
    interface ApiResponse<T> {
        data: T
        error?: string
        success: boolean
    }

    interface AppConfig {
        env: 'development' | 'production'
        apiBaseUrl: string
        firebase: FirebaseConfig
    }

    interface FirebaseConfig {
        apiKey: string
        authDomain: string
        projectId: string
        storageBucket: string
        messagingSenderId: string
        appId: string
    }

    interface AuthContextValue {
        user: User | null
        loading: boolean
        signIn: (email: string, password: string) => Promise<void>
        signOut: () => void
    }

    interface User {
        uid: string
        email: string
        displayName?: string
        role: 'user' | 'admin'
    }

    declare module 'app/next.config' {
        import { NextConfig } from 'next'
        export default function nextConfig(): NextConfig & {
            experimental: {
                appDir: boolean
                serverComponentsExternalPackages: string[]
            }
        }
    }

    declare module 'app/lib/firebase-admin' {
        import { App } from 'firebase-admin/app'
        export function getFirebaseAdminApp(): App
    }
}
