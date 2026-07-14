// SPDX-License-Identifier: MIT

import * as React from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App";

const container = document.getElementById("root");
if (container === null) {
  throw new Error("Commons playground: #root container is missing.");
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
