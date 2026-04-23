import React, { useState } from "react";
// import CustomInput from "../../components/adminComponents/forms/CustomInput";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../../assets/admin_login_logo.png";
import admin_image from "../../assets/admin_image.png"
import BASE_URL from "../../../config";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/common/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // Check if request is successful
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Only runs if login is successful
      toast.success("🎉 Login successful!", {
        autoClose: 3000,
        pauseOnFocusLoss: false,
      });

      const userRole = data.role?.toLowerCase();
      login(data.token, userRole);

      setTimeout(() => {
        if (userRole === "admin") navigate("/admin/dashboard");
      }, 1000);
    } catch (error) {
      // Show backend error message
      const errorMessage = error.message || "Login failed";
      toast.error(errorMessage);
      setErrors({ server: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
      />
      <section className="min-h-screen flex items-center justify-center  border-red-500 ">
        <div className="bg-white p-5 rounded-2xl shadow-lg max-w-5xl w-full flex flex-col">
          {/* Centered Logo at the Top */}
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Company Logo" className="h-30 rounded-4xl" />
          </div>

          {/* Two-column layout: Form & Image */}
          <div className="flex flex-col md:flex-row w-full">
            {/* Form Section */}
            <div className="md:w-1/2 px-5">
              <h2 className="text-2xl font-bold text-[#03033D] text-center">
                Admin Login
              </h2>

              <form className="mt-6" method="POST" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-gray-700 mt-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg text-black bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
                    autoComplete="true"
                    required
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="Enter Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-black bg-gray-200 mt-2 border focus:border-blue-500 focus:bg-white focus:outline-none"
                      required
                    />
                    <span
                      className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-black"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-lg px-4 py-3 mt-6 cursor-pointer"
                >
                  Log In
                </button>
              </form>
            </div>

            {/* Image Section */}
            <div className="md:w-1/2 flex items-center justify-center mt-6 md:mt-0">
              <img
                src={admin_image}
                className="rounded-2xl max-h-[400px] object-cover"
                alt="page img"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminLogin;
