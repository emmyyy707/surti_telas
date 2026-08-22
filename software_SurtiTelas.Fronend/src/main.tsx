import React from "react";
import ReactDOM from "react-dom/client";
import App from "./presentation/pages/App";
import "./index.css";
import "./styles/variables.css";
import "./styles/design-system.css";
import "./presentation/pages/styles/App.css";

import { AppProviders } from "@/app/providers/AppProviders";

if (import.meta.env.DEV) {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Download the React DevTools")) {
      return;
    }
    originalError.apply(console, args);
  };
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});
  });
}

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);