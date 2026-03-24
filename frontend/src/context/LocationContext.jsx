// contexts/LocationContext.jsx
import { createContext, useContext, useState } from "react";

// Create the context
const LocationContext = createContext();

// Create the provider
export const LocationProvider = ({ children }) => {
  // State to hold the current city
  const [city, setCity] = useState("Detecting..."); // initialize with default

  return (
    <LocationContext.Provider value={{ city, setCity }}>
      {children}
    </LocationContext.Provider>
  );
};

// Custom hook for easier usage
export const useLocationcity = () => useContext(LocationContext);
