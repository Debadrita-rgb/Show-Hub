import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../../config";

import { useAuth } from "../../../context/AuthContext";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const email = location.state?.email;

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${BASE_URL}/user/verify-otp`, {
        email,
        otp,
      });

      if (res.data.success) {
        const role = res.data.user.role || "USER";
        const userRole = role.toLowerCase();

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userName", res.data.user.name);
        localStorage.setItem("role", userRole);

        try {
          login(res.data.token, userRole);
        } catch (loginError) {
          console.error("Login function error:", loginError);
        }

        toast.success("Login Successful!", {
          autoClose: 1500,
        });
        setTimeout(() => {
          toast.dismiss();
          navigate("/");
          window.location.reload();
        }, 1500);
      } else {
        toast.error(res.data.message || "OTP verification failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-purple-900 to-black text-white">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md border border-white/20">
          <h2 className="text-2xl font-bold text-center mb-4">Verify OTP</h2>

          <p className="text-center text-sm mb-6 text-gray-300">
            OTP sent to <span className="font-semibold">{email}</span>
          </p>

          <form onSubmit={handleVerify} className="space-y-6">
            <input
              type="text"
              maxLength="6"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full text-center tracking-widest text-xl px-4 py-3 rounded-lg bg-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />

            <button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 py-3 rounded-lg font-semibold transition"
            >
              Verify OTP
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default VerifyOtp;
