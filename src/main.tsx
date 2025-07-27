import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initSentry } from './lib/sentry'

// Sentry 초기화
initSentry();

createRoot(document.getElementById("root")!).render(<App />);
