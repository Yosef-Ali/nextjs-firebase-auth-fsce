'use client';

export default function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
        <span className="text-primary-foreground font-bold">A</span>
      </div>
      <span className="text-xl font-bold text-foreground">Auth App</span>
    </div>
  );
}
