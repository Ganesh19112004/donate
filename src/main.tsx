import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

// 🔥 IMPORTANT: Handle OAuth redirect BEFORE rendering app
(async () => {
  if (window.location.hash.includes("access_token")) {
    await supabase.auth.getSession(); 
  }

  createRoot(rootElement).render(<App />);
})();