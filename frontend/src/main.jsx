/* Coded by Lucky */
/* SphereWalk Campus Explorer | v2.0 | Green Node Team */
import React, { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#060810', color: '#f1f5ff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ color: '#ef4444', fontSize: '2rem', marginBottom: '12px' }}>Application Error</h1>
          <p style={{ color: '#94a3b8' }}>The application encountered a fatal error and could not render.</p>
          <hr style={{ borderColor: '#1d2640', margin: '20px 0' }} />
          <h2 style={{ color: '#f87171', fontSize: '1rem' }}>{this.state.error && this.state.error.toString()}</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#94a3b8', background: '#111627', padding: '16px', borderRadius: '8px', marginTop: '12px', fontSize: '0.8rem' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );

    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
