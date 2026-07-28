import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvidor } from "./context/AuthContext.jsx";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvidor>
      <App />
    </AuthProvidor>
  </StrictMode>,
);
