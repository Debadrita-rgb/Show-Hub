import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import { useState } from "react";
import { Outlet } from "react-router-dom";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div
        className={`flex-1 min-h-screen transition-all duration-300 
        ${sidebarOpen ? "ml-0 md:ml-64 lg:ml-64" : "ml-0 md:ml-64"}`}
      >
        <AdminNavbar
          toggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />

        <main className="mt-20 p-5"><Outlet/></main>
      </div>
    </div>
  );
}
