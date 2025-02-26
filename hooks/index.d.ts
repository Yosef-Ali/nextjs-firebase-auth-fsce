// Type definitions for custom hooks
declare module 'hooks/*' {
    import { Dispatch, SetStateAction } from 'react';

    interface ToastConfig {
        id?: string;
        title: string;
        description?: string;
        duration?: number;
        variant?: 'default' | 'destructive';
        type?: 'foreground' | 'background';
        action?: {
            label: string;
            onClick: () => void;
        };
    }

    interface ToastContextValue {
        toasts: ToastConfig[];
        addToast: (config: ToastConfig) => void;
        removeToast: (index: number) => void;
        toast: (config: ToastConfig) => void;
    }

    interface UserContextValue {
        user: User | null;
        loading: boolean;
        role: 'user' | 'admin' | 'guest';
        setUser: Dispatch<SetStateAction<User | null>>;
    }

    interface UsePaginationOptions<T> {
        initialPage?: number;
        pageSize?: number;
        initialData?: T[];
    }

    interface PaginationResult<T> {
        currentData: T[];
        currentPage: number;
        totalPages: number;
        goToPage: (page: number) => void;
        nextPage: () => void;
        prevPage: () => void;
    }

    declare module 'hooks/use-toast' {
        export const useToast: () => ToastContextValue;
    }

    declare module 'hooks/use-user' {
    }

    declare module 'hooks/use-pagination' {
        export function usePagination<T>(options: UsePaginationOptions<T>): PaginationResult<T>;
    }
}
