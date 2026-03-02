import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ensureDeviceToken } from "@/lib/device";

// Initialize device token before rendering so all Supabase requests include it
ensureDeviceToken().catch((e) => console.warn("Device token init failed:", e));

createRoot(document.getElementById("root")!).render(<App />);
