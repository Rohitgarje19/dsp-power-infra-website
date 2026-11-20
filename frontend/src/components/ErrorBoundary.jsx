import { Component } from "react";

/**
 * Catches render/lifecycle errors in the tree below so one broken component
 * shows a friendly recovery screen instead of a blank page. Data fetching is
 * already guarded in the pages; this is the last line of defence.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
    this.handleReload = this.handleReload.bind(this);
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    // Keep the technical detail in the console for debugging; visitors only
    // see the plain-language fallback below.
    console.error("The page hit an unexpected error.", error, info?.componentStack);
  }

  handleReload() {
    this.setState({ failed: false });
    if (typeof window !== "undefined") window.location.reload();
  }

  render() {
    if (!this.state.failed) {
      return this.props.children;
    }
    return (
      <div className="app-error" role="alert">
        <p className="app-error-eyebrow">Something went wrong</p>
        <h1>We couldn&apos;t load this page.</h1>
        <p>
          This is a display problem on our side. Reload the page, or go back to the home page and
          try again.
        </p>
        <div className="app-error-actions">
          <button type="button" className="button" onClick={this.handleReload}>
            Reload the page
          </button>
          <a className="app-error-home" href="/">
            Go to the home page
          </a>
        </div>
      </div>
    );
  }
}
