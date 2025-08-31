import { PropsWithChildren, Suspense } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { LoadingSpinner } from "./LoadingSpinner";

interface CustomSuspenseProps extends PropsWithChildren {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export function CustomSuspense({
  children,
  fallback = <LoadingSpinner />,
  errorFallback,
}: CustomSuspenseProps) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}
