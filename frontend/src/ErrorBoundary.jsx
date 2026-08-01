import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red', background: '#1e1e2f', height: '100vh', boxSizing: 'border-box' }}>
          <h2>Oops, something went wrong in the React App.</h2>
          <details style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', background: '#000', padding: '1rem', marginTop: '1rem' }}>
            <summary>Click to view error details (please share this with the AI)</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
