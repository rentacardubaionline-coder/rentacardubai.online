"use client";

import { Component, Suspense, type ErrorInfo, type ReactNode } from "react";

interface Props {
  fallback: ReactNode;
  /** Optional: shown if the inner component throws. Defaults to nothing
   *  (graceful degradation — the section just disappears). */
  errorFallback?: ReactNode;
  children: ReactNode;
}

class ErrorBoundary extends Component<
  { errorFallback?: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // We deliberately swallow the error visually (the wrapped section is
    // non-critical chrome) but keep a console log for ops to spot.
    console.error("[SuspenseBoundary] caught", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.errorFallback ?? null;
    }
    return this.props.children;
  }
}

/**
 * Non-critical async sections (featured rows, similar listings, related
 * articles) should use this wrapper instead of a bare `<Suspense>`. If the
 * inner data fetch errors, the boundary catches it and renders the
 * `errorFallback` (or nothing) — instead of forever-spinning the skeleton or
 * crashing the whole page.
 */
export function SuspenseBoundary({
  fallback,
  errorFallback,
  children,
}: Props) {
  return (
    <ErrorBoundary errorFallback={errorFallback}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}
