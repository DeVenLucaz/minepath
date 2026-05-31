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
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️ CHICKEN CRASH ⚠️</h1>
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
