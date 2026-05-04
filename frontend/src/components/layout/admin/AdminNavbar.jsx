import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa"; // Sidebar toggle icons
import { MdArrowDropDown } from "react-icons/md"; // Dropdown Arrow Icon
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import logo from "../../../assets/logo.png";

const AdminNavbar = ({ toggleSidebar, isSidebarOpen }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [admin, setAdmin] = useState({
    name: "Admin",
    role: "Admin",
    profilePic: "",
  });
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const closeDropdown = (event) => {
      if (!event.target.closest(".dropdown")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  const getPageTitle = () => {
    
    if (location.pathname.startsWith("/admin/editMovie/")) {
      return "Edit Movie";
    }
    
    if (location.pathname.startsWith("/admin/edit-user/")) {
      return "Edit User";
    }
    if (location.pathname.startsWith("/admin/edit-gallery/")) {
      return "Edit Gallery";
    }
    if (location.pathname.startsWith("/admin/edit-category/")) {
      return "Edit Category";
    }
    if (location.pathname.startsWith("/admin/edit-movie-selection/")) {
      return "Edit Location WIse Movie Selection";
    }
    if (location.pathname.startsWith("/admin/edit-language/")) {
      return "Edit Language";
    }
    if (location.pathname.startsWith("/admin/edit-banner/")) {
      return "Edit banner";
    }
    if (location.pathname.startsWith("/admin/view-contact-details/")) {
      return "View Contact Details";
    }

    if (location.pathname.startsWith("/admin/view-feedback-details/")) {
      return "View Feedback Details";
    }
    if (location.pathname.startsWith("/admin/view-single-user/")) {
      return "View User Details";
    }
    if (location.pathname.startsWith("/admin/view-booked-single-user/")) {
      return "View User Booking Details";
    }
    if (location.pathname.startsWith("/admin/edit-theater/")) {
      return "Edit Theater";
    }
    if (location.pathname.startsWith("/admin/edit-show/")) {
      return "Edit Shows";
    }
    switch (location.pathname) {
      case "/admin/view-all-user":
        return "View User";
      case "/admin/add-user":
        return "Add User";
      case "/admin/view-all-category":
        return "View Category";
      case "/admin/add-category":
        return "Add Category";
      case "/admin/view-all-language":
        return "View Language";
      case "/admin/add-language":
        return "Add Language";
      case "/admin/view-all-movie-selection":
        return "View Location Wise Movie Selection";
      case "/admin/add-movie-selection":
        return "Add Location Wise Movie Selection";

      case "/admin/view-all-banner":
        return "View Banner";
      case "/admin/add-banner":
        return "Add Banner";

      case "/admin/view-contact":
        return "View Contact";
      case "/admin/view-feedback":
        return "View Feedback";
      case "/admin/view-gallery":
        return "View Gallery";
      case "/admin/add-gallery":
        return "Add Gallery";
      case "/admin/viewMovie":
        return "View Movie";
      case "/admin/addMovie":
        return "Add Movie";
      case "/admin/view-all-theater":
        return "View Theater";
      case "/admin/add-theater":
        return "Add Theater";
      case "/admin/view-all-shows":
        return "View Shows";
      case "/admin/add-show":
        return "Add Shows";
      case "/admin/view-all-booking":
        return "View Booking";
      case "/admin/view-cancel-booking":
        return "View Cancel Booking";
      default:
        return "Admin Dashboard";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("showWelcomeToast"); // Clear the toast flag
    toast.success("Logged out successfully!");
    navigate("/backend/login");
  };
  return (
    <nav
      className="fixed top-0 left-0 w-full bg-gradient-to-r from-black/80 via-purple-900/70 to-black/80 backdrop-blur-md 
 text-white p-4 shadow-md flex items-center justify-between z-50 "
    >
      <div className="flex items-center space-x-4">
        <button className=" text-white" onClick={toggleSidebar}>
          {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
        <img
          src={logo}
          alt="Logo"
          className="h-15 w-auto sm:inline hidden rounded-4xl ms-5"
        />
      </div>

      <h4 className="text-lg font-semibold text-center md:text-left text-white justify-between items-center">
        {getPageTitle()}
      </h4>

      <div className="relative dropdown">
        <button
          className="flex items-center space-x-2 focus:outline-none"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <img
            src={
              admin.profilePic ||
              "https://cdn.pixabay.com/photo/2015/04/13/12/07/business-720429_1280.jpg"
            }
            className="rounded-full w-10 h-10 border-2 border-white object-cover"
            alt="admin"
          />
          <div className="flex flex-col text-left">
            <p className="font-semibold text-white">{admin.name}</p>
            <p className="text-sm text-white">Admin</p>
          </div>
          <MdArrowDropDown size={24} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-4 w-56 bg-gray-200 text-black shadow-xl rounded-md py-2 top-16 p-4 z-50">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 hover:bg-gray-300 cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;
