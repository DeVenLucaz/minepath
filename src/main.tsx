import { createRoot } from "react-dom/client";
import "./index.css";
// @ts-ignore
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// Global error handler for non-React crashes (module init, etc)
window.onerror = function(message, source, lineno, colno, error) {
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="padding:20px; background:#000; color:#ff4444; height:100vh; font-family:monospace;">
        <h1 style="font-size:20px;">🚨 SYSTEM FATAL 🚨</h1>
        <p style="color:#fff;">${message}</p>
        <p style="color:#aaa; font-size:12px;">${source}:${lineno}:${colno}</p>
        <button onclick="window.location.reload()" style="padding:10px; background:#FFD700; border:none; margin-top:20px;">RELOAD</button>
      </div>
    `;
  }
  return false;
};

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
