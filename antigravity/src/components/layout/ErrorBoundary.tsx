"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-black/90 text-white font-mono border border-red-900/50 rounded-lg p-8 text-center">
          <AlertTriangle className="text-red-500 mb-6" size={48} />
          <h2 className="text-2xl font-bold text-red-500 mb-2">SYSTEM FAILURE</h2>
          <p className="text-slate-400 mb-8 max-w-md">
            The telemetry stream encountered a critical rendering exception. Mission Control UI has safely isolated the fault.
          </p>
          <div className="bg-red-950/30 text-red-400 text-xs p-4 rounded text-left mb-8 max-w-lg overflow-auto border border-red-900/50">
            {this.state.error?.message || 'Unknown exception in visualizer subsystem.'}
          </div>
          <button
            className="flex items-center gap-2 bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 px-6 py-3 rounded transition-colors"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            <RefreshCw size={16} /> RESTART SUBSYSTEM
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
