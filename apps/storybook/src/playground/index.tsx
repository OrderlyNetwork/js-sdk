import React from "react";
import ReactDOM from "react-dom/client";
// import reportWebVitals from "./reportWebVitals";
import AppRoute from "./routes";
import "./styles/index.css";

const root = ReactDOM.createRoot(document.querySelector<HTMLElement>("#root")!);

root.render(
  // <React.StrictMode>
  <AppRoute />,
  // </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
