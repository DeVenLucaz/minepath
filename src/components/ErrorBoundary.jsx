import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          background: '#000',
          color: '#ff4444',
          height: '100vh',
          width: '100vw',
          overflow: 'auto',
          fontFamily: 'monospace',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ff4444' }}>
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            CHICKEN CRASH
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ff4444' }}>
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </h1>
          <p style={{ color: '#fff', marginBottom: '20px' }}>Something went wrong with the path...</p>
          <div style={{
            background: '#222',
            padding: '10px',
            borderRadius: '8px',
            textAlign: 'left',
            maxWidth: '100%',
            fontSize: '12px',
            color: '#aaa',
            marginBottom: '20px'
          }}>
            {this.state.error && this.state.error.toString()}
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#FFD700',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            RETRY FLIGHT
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
