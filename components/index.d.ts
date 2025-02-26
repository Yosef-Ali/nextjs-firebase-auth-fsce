// Type definitions for component library
declare module 'components/*' {
    import { ReactElement } from 'react';

    interface AuthComponentProps {
        variant: 'signin' | 'signup' | 'reset';
        onSuccess?: () => void;
        onError?: (error: Error) => void;
    }

    interface CarouselItem {
        id: string;
        content: ReactElement;
        caption?: string;
    }

    interface CarouselProps {
        items: CarouselItem[];
        autoPlay?: boolean;
        loop?: boolean;
        interval?: number;
    }

    interface EthiopianMapProps {
        onClickRegion?: (regionId: string) => void;
        highlightedRegions?: string[];
        className?: string;
    }

    interface FileUploadProps {
        accept?: string;
        multiple?: boolean;
        onUpload: (files: File[]) => void;
        maxSizeMB?: number;
    }

    interface AuthContextValue {
        user: User | null;
        loading: boolean;
        signIn: (email: string, password: string) => Promise<void>;
        signOut: () => void;
    }

    // Common UI component types
    type ButtonVariant = 'default' | 'primary' | 'destructive' | 'outline' | 'ghost';
    type IconSize = 'sm' | 'md' | 'lg' | 'xl';

    declare module 'components/Auth' {
        export const AuthComponent: React.FC<AuthComponentProps>;
    }

    declare module 'components/carousel' {
        export const Carousel: React.FC<CarouselProps>;
    }

    declare module 'components/ethiopian-map' {
        export const EthiopianMap: React.FC<EthiopianMapProps>;
    }

    declare module 'components/image-upload' {
    }
}
