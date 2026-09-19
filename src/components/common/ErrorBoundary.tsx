import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[300px] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-[10px] bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-[#C25B5B]" />
          </div>
          <h3 className="text-base font-semibold text-ink">Something went wrong</h3>
          <p className="text-xs text-ink-muted mt-1 max-w-sm">
            An unexpected error occurred in this view.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="btn-secondary mt-4 flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
