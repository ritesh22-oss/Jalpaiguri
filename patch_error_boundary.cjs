const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const errorBoundaryCode = `
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
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
        <div style={{ padding: '20px', color: 'red', backgroundColor: 'white', zIndex: 9999, position: 'absolute', inset: 0 }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.message}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
`;

if (!code.includes('class ErrorBoundary')) {
  code = code.replace("import React from 'react';", "import React from 'react';\n" + errorBoundaryCode);
  
  // Wrap AppContent inside App
  code = code.replace("<AppContent />", "<ErrorBoundary><AppContent /></ErrorBoundary>");
  
  fs.writeFileSync('src/App.tsx', code);
}
