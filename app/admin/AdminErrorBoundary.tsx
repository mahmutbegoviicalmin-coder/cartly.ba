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
            background: "#F5F5F7",
            color: "#1D1D1F",
            padding: 32,
            fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          <h1 style={{ fontSize: 22, margin: "0 0 12px" }}>Admin se srušio</h1>
          <p style={{ color: "#6E6E73", margin: "0 0 16px" }}>{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => location.reload()}
            style={{
              height: 44,
              padding: "0 18px",
              border: "none",
              borderRadius: 12,
              background: "#F45B39",
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
