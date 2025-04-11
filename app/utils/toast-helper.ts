/**
 * Utility functions for safely showing toast notifications
 */

type ToastConfig = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
};

type ToastFunction = (config: ToastConfig) => void;

/**
 * Safely show a toast notification with error handling
 */
export function safeToast(toast: ToastFunction, config: ToastConfig): void {
  try {
    toast(config);
  } catch (error) {
    console.error('Error showing toast notification:', error);
  }
}
