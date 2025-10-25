import React, { ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon } from './icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State;

  constructor(props: Props) {
    super(props);
    // FIX: Initializing state in the constructor instead of using a class field
    // resolves issues where the component's `this` context was not correctly established,
    // which caused errors when accessing `this.setState` and `this.props`.
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  resetBoundary = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-white">Something Went Wrong</h2>
            <p className="mb-6 text-red-200">An unexpected error occurred in this part of the application.</p>
            <button
              onClick={this.resetBoundary}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors"
            >
              Try Again
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
