import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../../config";

const signUp = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
      name: "",
      email: "",
      password: "",
    });

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        const res = await axios.post(
          `${BASE_URL}/user/signup`,
          formData
        );
        toast.success(res.data.message || "Signup successful!");
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Something went wrong. Try again."
        );
      }
    };
    


  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="rounded-3xl bg-white/10 shadow-2xl backdrop-blur-md border border-white/20 p-10 w-full max-w-md">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Sign Up</h2>
          </div>
          

          <form
            onSubmit={handleSubmit}
            method="POST"
            className="space-y-6"
            autoComplete="off"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-2 block w-full rounded-md bg-white/20 px-3 py-2 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
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
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-2 block w-full rounded-md bg-white/20 px-3 py-2 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-2 font-semibold text-white hover:from-indigo-600 hover:to-purple-600 transition duration-300 cursor-pointer"
              >
                Sign up
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm">
            Have an account?{" "}
            <Link
              to="/signin"
              className="font-semibold text-indigo-300 hover:text-indigo-100"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default signUp
