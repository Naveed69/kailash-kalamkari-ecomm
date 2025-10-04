import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ProductsProvider } from "./contexts/ProductContext.tsx";

createRoot(document.getElementById("root")!).render(
  <ProductsProvider>
    <App />
  </ProductsProvider>
);
