import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "./context/AuthContext.jsx";
import { LocationProvider } from "./context/LocationContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider
      clientId="1077320505306-6dat37p4i3e4qlblg625e5aovle939qm.apps.googleusercontent.com"
    >
      <AuthProvider>
        <LocationProvider>
          <App />
        </LocationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
// main.jsx
// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App.jsx";

// // Import your contexts
// import { AuthProvider } from "./context/AuthContext.jsx";
// import { LocationProvider } from "./context/LocationContext.jsx";

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <AuthProvider>
//       <LocationProvider>
//         <App />
//       </LocationProvider>
//     </AuthProvider>
//   </React.StrictMode>
// );