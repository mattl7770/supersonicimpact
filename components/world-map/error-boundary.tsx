"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type Props = {
  children: ReactNode;
  /** Bump this to clear an existing error state without remounting the tree. */
  resetKey?: string | number;
};
type State = { error: Error | null };

export class MapErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prevProps: Props) {
    if (
      this.state.error &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error) {
    if (typeof window !== "undefined") {
      console.error("[supersonicimpact] map error:", error);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full min-h-[420px] w-full items-center justify-center rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-8 text-center">
          <div className="max-w-sm space-y-2">
            <AlertTriangle
              className="mx-auto h-6 w-6 text-foreground/40"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-foreground/80">
              Map didn&rsquo;t load
            </p>
            <p className="text-xs text-foreground/55">
              Your browser may not support WebGL, or a privacy extension is
              blocking it. The Route Comparator below still works.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
