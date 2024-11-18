import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AnnotationsContextProvider } from "./context/AnnotationsContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AnnotationsContextProvider>
      <App />
    </AnnotationsContextProvider>
  </StrictMode>
);
