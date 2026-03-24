import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../../components/usersComponents/Navbar/Navbar"; 
import Footer from "../../../components/usersComponents/Footer/Footer"; 

const VoyageLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default VoyageLayout;
