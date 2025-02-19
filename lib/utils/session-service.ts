import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { authLogger } from './auth-logger';

interface SessionState {
    isAuthenticated: boolean;
    lastChecked: number;
    lastActivity: number;
}

class SessionService {
    private static instance: SessionService;
    private sessionState: SessionState = {
        isAuthenticated: false,
        lastChecked: 0,
        lastActivity: 0
    };

    private readonly SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
    private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

    private constructor() {
        if (typeof window !== 'undefined') {
            // Update last activity on user interaction
            ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
                window.addEventListener(event, () => this.updateLastActivity());
            });
        }
    }

    static getInstance(): SessionService {
        if (!SessionService.instance) {
            SessionService.instance = new SessionService();
        }
        return SessionService.instance;
    }

    private updateLastActivity(): void {
        this.sessionState.lastActivity = Date.now();
    }

    async validateSession(): Promise<boolean> {
        const now = Date.now();

        // Only check if enough time has passed since last check
        if (now - this.sessionState.lastChecked < this.SESSION_CHECK_INTERVAL) {
            return this.sessionState.isAuthenticated;
        }

        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                this.sessionState.isAuthenticated = false;
                return false;
            }

            // Check session timeout
            if (now - this.sessionState.lastActivity > this.SESSION_TIMEOUT) {
                authLogger.info('Session timed out due to inactivity');
                await auth.signOut();
                this.sessionState.isAuthenticated = false;
                return false;
            }

            // Force token refresh if needed
            if (currentUser.auth.currentUser) {
                await currentUser.getIdToken(true);
            }

            this.sessionState.isAuthenticated = true;
            this.sessionState.lastChecked = now;
            return true;
        } catch (error) {
            authLogger.error('Session validation error:', error);
            this.sessionState.isAuthenticated = false;
            return false;
        }
    }

    async refreshSession(user: User): Promise<void> {
        try {
            await user.getIdToken(true);
            this.sessionState.lastChecked = Date.now();
            this.sessionState.isAuthenticated = true;
            this.updateLastActivity();
        } catch (error) {
            authLogger.error('Session refresh error:', error);
            throw error;
        }
    }

    clearSession(): void {
        this.sessionState = {
            isAuthenticated: false,
            lastChecked: 0,
            lastActivity: 0
        };
    }
}