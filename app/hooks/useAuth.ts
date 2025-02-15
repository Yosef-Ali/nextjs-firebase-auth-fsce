// Re-export types and hook from the new location
export * from './use-auth';

// Import and re-export the hook as default for backward compatibility
import { useAuth as useAuthHook } from './use-auth';
export default useAuthHook;
