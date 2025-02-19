import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { authLogger } from './auth-logger';
import { securityUtils } from './security';

class SessionMonitor {
    private static instance: SessionMonitor;
    private checkInterval: NodeJS.Timeout | null = null;
    private readonly INTERVAL_TIME = 60000; // Check every minute

    private constructor() {
        // Private constructor for singleton
    }

    static getInstance(): SessionMonitor {
        if (!this.instance) {
            this.instance = new SessionMonitor();
        }
        return this.instance;
    }

    startMonitoring() {
        if (this.checkInterval) {
            return; // Already monitoring
        }

        this.checkInterval = setInterval(async () => {
            await this.checkSession();
        }, this.INTERVAL_TIME);

        // Add visibility change listener
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', this.handleVisibilityChange);
        }
    }

    stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }

        if (typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        }
    }

    private handleVisibilityChange = async () => {
        if (document.visibilityState === 'visible') {
            await this.checkSession();
        }
    };

    private async checkSession() {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            const [tokenValid, stateValid] = await Promise.all([
                securityUtils.validateTokenClaims(currentUser),
                securityUtils.validateAuthState(currentUser)
            ]);

            if (!tokenValid.isValid || !stateValid.isValid) {
                authLogger.error('Session validation failed:', { tokenValid, stateValid });
                this.handleSessionError();
                return;
            }

            // Refresh token if needed
            await securityUtils.refreshUserSession();
        } catch (error) {
            authLogger.error('Session check failed:', error);
            this.handleSessionError();
        }
    }

    private handleSessionError() {
        // Dispatch session error event
        const event = new CustomEvent('auth-session-error', {
            detail: { timestamp: Date.now() }
        });
        window.dispatchEvent(event);

        // Stop monitoring after error
        this.stopMonitoring();
    }
}

export const sessionMonitor = SessionMonitor.getInstance();