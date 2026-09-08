import { App } from "@/app";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { MainErrorFallback } from "@/components/errors";
import { StrictMode } from "react";
// Use a stripped copy of @hotosm/ui/dist/style.css that excludes the
// `@layer wa-native` global HTML reset (which conflicts with Tailwind).
// Only CSS variable/token layers needed by hotosm web components are kept.
// See src/styles/hotosm-vars.css header comment for full details.
import "@/styles/hotosm-vars.css";
import "@hotosm/ui/dist/webawesome-all.js";
import "@/styles/hot-font-face.css";
import "@/styles/hot-sl.css";
import "@/styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={MainErrorFallback}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
