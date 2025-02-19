export const checkBrowserSupport = async () => {
    try {
        // Check if cookies are enabled
        if (!navigator.cookieEnabled) {
            throw new Error('Cookies must be enabled for authentication to work');
        }

        // Check if localStorage is available
        if (!window.localStorage) {
            throw new Error('Local storage must be available for authentication to work');
        }

        // Test localStorage
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
        } catch (e) {
            throw new Error('Local storage access is blocked. Please enable it in your browser settings');
        }

        // Check if running in a secure context
        if (window.isSecureContext === false) {
            console.warn('Application is not running in a secure context, some features may be limited');
        }

        return true;
    } catch (error: any) {
        console.error('Browser support check failed:', error);
        throw error;
    }
};

export const checkPopupBlocker = async (): Promise<boolean> => {
    try {
        const popup = window.open('about:blank', '_blank', 'width=1,height=1');
        if (!popup || popup.closed) {
            throw new Error('Popup windows are blocked. Please allow popups for this site to use Google Sign-In');
        }
        popup.close();
        return true;
    } catch (error) {
        console.error('Popup blocker check failed:', error);
        throw error;
    }
};