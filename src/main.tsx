import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { InventoryProvider } from "./contexts/InventoryContext.tsx";

createRoot(document.getElementById("root")!).render(
  <InventoryProvider>
    <App />
  </InventoryProvider>
);
