import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="grid min-h-screen place-items-center bg-panel p-6 text-ink">
          <div className="max-w-lg rounded-lg border border-red-200 bg-white p-5 shadow-sm">
            <h1 className="text-lg font-semibold text-red-700">Frontend render error</h1>
            <p className="mt-2 text-sm text-slate-600">Refresh the page after restarting the frontend. If this repeats, check the browser console for details.</p>
            <pre className="mt-4 max-h-52 overflow-auto rounded-md bg-red-50 p-3 text-xs text-red-800">{this.state.error.message}</pre>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
