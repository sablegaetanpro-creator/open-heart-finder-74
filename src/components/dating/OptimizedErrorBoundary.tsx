import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorScreen from '@/components/common/ErrorScreen';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorInfo?: ErrorInfo;
}

class OptimizedErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorScreen
          type="generic"
          title="Quelque chose s'est mal passé"
          message="Une erreur inattendue s'est produite. Veuillez réessayer."
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

export default OptimizedErrorBoundary;