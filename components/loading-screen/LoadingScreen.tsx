import { Spinner } from "@/components/ui/spinner";

export function LoadingScreen() {
  return (
    <div 
      className="h-screen w-screen flex items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <Spinner className="h-8 w-8" aria-hidden="true" />
    </div>
  );
}
