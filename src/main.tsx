import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './lib/i18n.tsx';

// Setup highly visible on-screen crash reporting for debugging
const showOnScreenCrash = (title: string, message: string, stack?: string) => {
  console.error(`[NOMI CRASH] ${title}: ${message}`, stack);
  try {
    const errorDiv = document.createElement("div");
    errorDiv.style.position = "fixed";
    errorDiv.style.top = "0";
    errorDiv.style.left = "0";
    errorDiv.style.width = "100%";
    errorDiv.style.height = "100%";
    errorDiv.style.backgroundColor = "#991b1b"; // Dark red
    errorDiv.style.color = "#ffffff";
    errorDiv.style.padding = "24px";
    errorDiv.style.fontFamily = "monospace";
    errorDiv.style.fontSize = "14px";
    errorDiv.style.zIndex = "999999";
    errorDiv.style.overflowY = "auto";
    errorDiv.style.boxSizing = "border-box";
    
    errorDiv.innerHTML = `
      <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 12px; border-bottom: 1px solid #fca5a5; padding-bottom: 8px;">
        🚨 Nomi App Launch Crash: ${title}
      </h1>
      <p style="font-weight: bold; font-size: 16px; margin-bottom: 16px;">
        ${message}
      </p>
      ${stack ? `
        <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 8px; color: #fca5a5;">Stack Trace:</h2>
        <pre style="background-color: #7f1d1d; padding: 12px; border-radius: 6px; overflow-x: auto; white-space: pre-wrap; font-size: 12px;">${stack}</pre>
      ` : ""}
      <p style="margin-top: 24px; font-size: 11px; color: #fca5a5;">
        Please screenshot this screen to help the developer fix the issue.
      </p>
    `;
    document.body.appendChild(errorDiv);
  } catch (err) {
    console.error("Failed to inject error overlay", err);
  }
};

window.onerror = function (message, source, lineno, colno, error) {
  showOnScreenCrash(
    "Uncaught Runtime Error",
    String(message),
    error ? error.stack : `at ${source}:${lineno}:${colno}`
  );
  return false;
};

window.addEventListener("unhandledrejection", function (event) {
  showOnScreenCrash(
    "Unhandled Promise Rejection",
    String(event.reason?.message || event.reason),
    event.reason?.stack
  );
});

console.log("[NOMI ROOT] Starting main.tsx rendering flow...");

const rootEl = document.getElementById('root');
if (!rootEl) {
  showOnScreenCrash("Critical Root Element Missing", "Could not find element with id 'root' in index.html");
} else {
  console.log("[NOMI ROOT] Found root element. Mounting React application...");
  try {
    createRoot(rootEl).render(
      <StrictMode>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </StrictMode>,
    );
    console.log("[NOMI ROOT] main.tsx render initiated successfully.");
  } catch (e: any) {
    showOnScreenCrash("React Mounting Exception", e.message, e.stack);
  }
}

