import { MdEdit } from "react-icons/md"
import React, { useState, useEffect } from 'react';
import { FiBriefcase, FiClock, FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../../../config";
import { BarChart, Bar } from "recharts";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const AdminDashboard = () => {

  const [dashboardData, setDashboardData] = useState({
    nUser: 0,
    movieCount: 0,
    showCount: 0,
    // recentInternships: [],
  }); 
const [analytics, setAnalytics] = useState({
  revenue: [],
  movies: [],
  theaters: [],
  hours: [],
  cancelRate: 0,
});

const revenueData = analytics.revenue.map((r) => ({
  date: `${r._id.day}/${r._id.month}`,
  revenue: r.totalRevenue,
}));

const movieData = analytics.movies.map((m) => ({
  name: m.movie.title,
  bookings: m.totalBookings,
}));

const hourData = analytics.hours.map((h) => ({
  hour: `${h._id}:00`,
  bookings: h.bookings,
}));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/admin/dashboardData`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (response.data.success) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

useEffect(() => {
  const fetchData = async () => {
    const token = localStorage.getItem("token");

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    try {
      const [revenue, movies, theaters, hours, cancelRate] = await Promise.all([
        axios.get(`${BASE_URL}/admin/dashboard-revenue`, config),
        axios.get(`${BASE_URL}/admin/dashboard-popular-movies`, config),
        axios.get(`${BASE_URL}/admin/dashboard-busiest-theaters`, config),
        axios.get(`${BASE_URL}/admin/dashboard-peak-hours`, config),
        axios.get(`${BASE_URL}/admin/dashboard-cancellation-rate`, config),
      ]);

      setAnalytics({
        revenue: revenue.data.revenue,
        movies: movies.data.data,
        theaters: theaters.data.data,
        hours: hours.data.data,
        cancelRate: cancelRate.data.rate,
      });
      console.log({
        revenue: revenue.data,
        movies: movies.data,
        theaters: theaters.data,
        hours: hours.data,
        cancelRate: cancelRate.data,
      });
    } catch (err) {
      console.error(err);
    }
  };

  fetchData();
}, []);

  const cardsValue = [
    {
      title: "Total User",
      value: dashboardData.nUser,
      color: "text-green-500",
    },
    {
      title: "Total Movies",
      value: dashboardData.movieCount,
      color: "text-green-500",
    },
    {
      title: "Total Shows",
      value: dashboardData.showCount,
      color: "text-green-500",
    },
    
  ];

  return (
    <main className="p-6 min-h-screen">
      {/* ===== TOP STATS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardsValue.map((card, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition"
          >
            <h3 className="text-sm text-gray-500">{card.title}</h3>
            <p className={`text-3xl font-bold mt-2 ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* ===== CHARTS SECTION ===== */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-5 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4 text-black">
            📈 Revenue Trend
          </h2>

          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#7c3aed" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">No revenue data</p>
          )}
        </div>

        {/* Popular Movies */}
        <div className="bg-white p-5 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4 text-black">
            🎬 Popular Movies
          </h2>

          {movieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={movieData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">No movie data</p>
          )}
        </div>
      </div>

      {/* ===== SECOND ROW ===== */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <div className="bg-white p-5 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4 text-black">
            ⏰ Peak Booking Hours
          </h2>

          {hourData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourData}>
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">No data</p>
          )}
        </div>

        {/* Cancellation Rate */}
        <div className="bg-white p-5 rounded-2xl shadow flex flex-col justify-center items-center">
          <h2 className="text-lg font-semibold mb-4 text-black">❌ Cancellation Rate</h2>

          <div className="text-5xl font-bold text-red-500">
            {analytics.cancelRate ? analytics.cancelRate.toFixed(2) : 0}%
          </div>

          <p className="text-gray-500 mt-2">Based on total bookings</p>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
