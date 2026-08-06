import React, { Component, ReactNode } from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onReset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

export function RouteErrorElement() {
  const error = useRouteError();
  let errorMessage = 'An unexpected error occurred.';

  if (isRouteErrorResponse(error)) {
    errorMessage = `${error.status} ${error.statusText} - ${error.data || 'Page error'}`;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return <ErrorFallback error={new Error(errorMessage)} onReset={() => (window.location.href = '/dashboard')} />;
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
          {error?.message || 'An unexpected error occurred. Please try reloading.'}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => {
              onReset();
              window.location.reload();
            }}
            variant="default"
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Reload Page
          </Button>
          <Button
            onClick={() => (window.location.href = '/dashboard')}
            variant="outline"
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
