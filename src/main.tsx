import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './lib/i18n.tsx';

console.log("[NOMI ROOT] Starting main.tsx rendering flow...");

const rootEl = document.getElementById('root');
if (!rootEl) {
  console.error("Critical Root Element Missing: Could not find element with id 'root' in index.html");
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
    console.error("React Mounting Exception:", e);
    window.dispatchEvent(new ErrorEvent('error', { error: e, message: e.message }));
  }
}
