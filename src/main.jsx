import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

class ErrorBoundary extends React.Component {
  state = { e: null }
  static getDerivedStateFromError(e) {
    return { e }
  }
  render() {
    if (!this.state.e) return this.props.children
    return (
      <div style={{ padding: 40, fontFamily: 'Archivo, sans-serif' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif' }}>Something went wrong</h1>
        <p>Reload the page to continue reviewing. If this keeps happening, let the project team know.</p>
        <details style={{ marginTop: 12 }}>
          <summary>Technical details</summary>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.e.stack || this.state.e)}</pre>
        </details>
      </div>
    )
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
