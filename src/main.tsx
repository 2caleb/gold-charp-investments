
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <div className="w-full overflow-x-hidden">
    <App />
  </div>
);
