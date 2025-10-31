import { createRoot } from "react-dom/client";
import App from "./App.tsx";
// Tailwind / project styles
import "./index.css";
// Bootstrap CSS and JS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

createRoot(document.getElementById("root")!).render(<App />);
