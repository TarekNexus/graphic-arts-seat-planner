"use client";

import { useStore } from "@/lib/store";

export function LoadingGate({ children }: { children: React.ReactNode }) {
  const { loading, dbError } = useStore();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="relative size-14">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">Loading…</p>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-6">
        <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center mb-1">
          <svg className="size-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
          </svg>
        </div>
        <p className="font-semibold text-destructive">Database connection failed</p>
        <p className="text-sm text-muted-foreground max-w-sm">{dbError}</p>
      </div>
    );
  }

  return <>{children}</>;
}
