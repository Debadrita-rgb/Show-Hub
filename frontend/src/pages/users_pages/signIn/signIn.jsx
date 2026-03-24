import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../../context/AuthContext";

import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export default function SignIn() {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    cpassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password, cpassword } = formData;

    if (password !== cpassword) {
      toast.error("Password and Confirm Password do not match");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/user/login", {
        email,
        password,
      });
      if (response.data.success) {
        // console.log(response.data)
        const role = "USER";
        const userRole = role.toLowerCase();

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userName", response.data.name);
        localStorage.setItem("role", userRole);

        try {
          login(response.data.token, userRole);
        } catch (loginError) {
          console.error("Login function error:", loginError);
        }

        toast.success("Login Successful!");
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 2000);
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Something went wrong";
      console.error("Error during login:", errorMessage);
      toast.error(errorMessage);
    }
  };

      const handleGoogleLogin = async (userData) => {
        try {
          const email = userData.email;
  
          const res = await axios.post("http://localhost:5000/user/send-otp", {
            email: userData.email,
            name: userData.name, // ✅ send name
            password: "google_user", // optional
          });
  
          toast.success("OTP sent to your email!");
  
          // navigate to OTP page
          navigate("/verify-otp", { state: { email } });
        } catch (err) {
          toast.error("Failed to send OTP");
        }
      };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="rounded-3xl bg-white/10 shadow-2xl backdrop-blur-md border border-white/20 p-10 w-full max-w-md bg-gradient-to-br ">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Sign In</h2>
          </div>
          <div className="space-y-4 mb-6">
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  const decoded = jwtDecode(credentialResponse.credential);
                  // console.log(decoded); // contains email, name, picture

                  handleGoogleLogin(decoded);
                }}
                onError={() => {
                  console.log("Login Failed");
                }}
              />
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-2 block w-full rounded-md bg-white/20 px-3 py-2 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-2 block w-full rounded-md bg-white/20 px-3 py-2 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label htmlFor="cpassword" className="block text-sm font-medium">
                Confirm Password
              </label>
              <input
                id="cpassword"
                name="cpassword"
                type="password"
                value={formData.cpassword}
                onChange={handleChange}
                required
                className="mt-2 block w-full rounded-md bg-white/20 px-3 py-2 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-2 font-semibold text-white hover:from-indigo-600 hover:to-purple-600 transition duration-300 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm">
            Not a member?{" "}
            <Link
              to="/signup"
              className="font-semibold text-indigo-300 hover:text-indigo-100"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
