"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export default class AdminErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100dvh",
            background: "#070708",
            color: "#f5f5f7",
            padding: 32,
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          <h1 style={{ fontSize: 22, margin: "0 0 12px" }}>Admin se srušio</h1>
          <p style={{ color: "#a1a1a6", margin: "0 0 16px" }}>{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => location.reload()}
            style={{
              height: 44,
              padding: "0 18px",
              border: "none",
              borderRadius: 12,
              background: "#0a84ff",
              color: "#fff",
              fontWeight: 650,
              cursor: "pointer",
            }}
          >
            Osvježi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
