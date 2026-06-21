import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "@fontsource-variable/inter";
import "@/shared/ui/tokens.css";
import "@/shared/ui/ui.css";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
