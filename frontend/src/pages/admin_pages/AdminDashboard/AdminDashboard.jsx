import { MdEdit } from "react-icons/md";
import React, { useState, useEffect } from "react";
import { FiBriefcase, FiClock, FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../../../config";
import { BarChart, Bar } from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  const [activeTab, setActiveTab] = useState("Daily");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);

  const [startDate, endDate] = dateRange;
  const [dashboardData, setDashboardData] = useState({
    nUser: 0,
    movieCount: 0,
    showCount: 0,
  });
  const [analytics, setAnalytics] = useState({
    revenue: [],
    movies: [],
    theaters: [],
    hours: [],
    cancelRate: 0,
  });

  const getMonthDates = (month, year) => {
    const daysInMonth = new Date(year, month, 0).getDate();

    const dates = [];

    for (let i = 1; i <= daysInMonth; i++) {
      dates.push({
        key: `${year}-${month}-${i}`,
        label: `${i}`,
      });
    }

    return dates;
  };

  const movieData = analytics.movies.map((m) => ({
    name: m.movie.title,
    bookings: m.totalBookings,
  }));

  const hourData = analytics.hours.map((h) => ({
    hour: `${h._id}:00`,
    bookings: h.bookings,
  }));

  const theaterChartData = analytics.theaters.map((t) => ({
    name: t.hallName
      ? `${t.theaterName} - ${t.hallName}`
      : `${t.theaterName} (${t.locationName})`,
    bookings: t.seatsBooked,
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
        const [movies, theaters, hours, cancelRate] = await Promise.all([
          axios.get(`${BASE_URL}/admin/dashboard-popular-movies`, config),
          axios.get(`${BASE_URL}/admin/dashboard-busiest-theaters`, config),
          axios.get(`${BASE_URL}/admin/dashboard-peak-hours`, config),
          axios.get(`${BASE_URL}/admin/dashboard-cancellation-rate`, config),
        ]);

        setAnalytics((prev) => ({
          ...prev,
          movies: movies.data.data,
          theaters: theaters.data.data,
          hours: hours.data.data,
          cancelRate: cancelRate.data.rate,
        }));
 
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const fetchRevenue = async () => {
    const token = localStorage.getItem("token");

    let params = {};

    if (startDate && endDate) {
      params.startDate = startDate.toISOString();
      params.endDate = endDate.toISOString();
      params.type = "custom";
    } else if (activeTab === "Monthly") {
      params.type = "monthly";
      params.month = selectedMonth || new Date().getMonth() + 1;
    } else if (activeTab === "Weekly") {
      params.type = "weekly";
    } else if (activeTab === "Daily") {
      params.type = "daily";
      if (selectedDate) {
        params.date = selectedDate.toISOString();
      }
    }

    try {
      const res = await axios.get(`${BASE_URL}/admin/dashboard-revenue`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      setAnalytics((prev) => ({
        ...prev,
        revenue: res.data.revenue,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [activeTab, selectedDate, selectedMonth, startDate, endDate]);

  const getWeekDates = () => {
    const today = new Date();
    const day = today.getDay(); 

    const diff = day >= 5 ? day - 5 : 7 - (5 - day); 
    const friday = new Date(today);
    friday.setDate(today.getDate() - diff);

    const dates = [];

    for (let i = 0; i <= diff; i++) {
      const d = new Date(friday);
      d.setDate(friday.getDate() + i);

      dates.push({
        key: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
        label:
          d.toLocaleDateString("en-IN", {
            weekday: "short",
          }) + ` (${d.getDate()}/${d.getMonth() + 1})`,
      });
    }

    return dates;
  };

  let revenueData = [];

  if (activeTab === "Monthly") {
    const today = new Date();
    const year = today.getFullYear();

    const monthToUse = selectedMonth || today.getMonth() + 1;

    const fullMonth = getMonthDates(monthToUse, year);

    const revenueMap = {};

    analytics.revenue.forEach((r) => {
      const key = `${r._id.year}-${r._id.month}-${r._id.day}`;
      revenueMap[key] = Number(r.totalRevenue).toFixed(2);
    });

    const formattedMonth = String(monthToUse).padStart(2, "0");

    revenueData = fullMonth.map((d) => {
      const day = String(d.label).padStart(2, "0");

      return {
        date: `${day}/${formattedMonth}`,
        revenue: revenueMap[d.key] || 0,
      };
    });
  } else if (activeTab === "Weekly") {
    const fullWeek = getWeekDates();

    const revenueMap = {};

    analytics.revenue.forEach((r) => {
      const key = `${r._id.year}-${r._id.month}-${r._id.day}`;
      revenueMap[key] = Number(r.totalRevenue).toFixed(2);
    });

    revenueData = fullWeek.map((d) => ({
      date: d.label,
      revenue: revenueMap[d.key] || 0,
    }));
  } else {
    revenueData = (analytics.revenue || []).map((r) => {
      if (r._id.day) {
        return {
          date: `${r._id.day}/${r._id.month}`,
          revenue: Number(r.totalRevenue).toFixed(2),
        };
      }

      if (r._id.range) {
        return {
          date: r._id.range,
          revenue: Number(r.totalRevenue).toFixed(2),
        };
      }

      if (r._id.month && r._id.year) {
        return {
          date: `${r._id.month}/${r._id.year}`,
          revenue: Number(r.totalRevenue).toFixed(2),
        };
      }

      return {
        date: "N/A", 
        revenue: Number(r.totalRevenue).toFixed(2) || 0,
      };
    });
  }

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
  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("default", { month: "short" }),
  );
  const revenueMap = {};

  analytics.revenue.forEach((r) => {
    const key = `${r._id.year}-${r._id.month}-${r._id.day}`;
    revenueMap[key] = Number(r.totalRevenue).toFixed(2);
  });

  return (
    <main className="p-6 min-h-screen">
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

      <div className="mt-8 grid grid-cols-1 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h2 className="text-lg font-semibold text-black">
              📈 Revenue Trend
            </h2>

            <div className="relative flex bg-gray-800 rounded-full p-1 w-full sm:w-auto sm:min-w-[260px]">
              <div
                className={`absolute top-1 bottom-1 w-1/3 rounded-full transition-all duration-300
              ${
                activeTab === "Daily"
                  ? "left-1 bg-blue-500"
                  : activeTab === "Weekly"
                    ? "left-1/3 bg-purple-500"
                    : "left-2/3 bg-pink-500"
              }`}
              ></div>

              {["Daily", "Weekly", "Monthly"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSelectedDate(new Date());
                    setSelectedMonth("");
                    setDateRange([null, null]);
                  }}
                  className="relative z-10 w-1/3 py-2 text-xs sm:text-sm font-semibold text-white"
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col relative">
              <label className="text-xs font-semibold text-gray-600 mb-1">
                Select Date
              </label>

              <DatePicker
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setSelectedMonth("");
                  setDateRange([null, null]);
                  setActiveTab("Daily");
                }}
                dateFormat="yyyy-MM-dd"
                className="text-black px-3 py-2 pr-8 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />

              {selectedDate && (
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="absolute right-2 top-8 text-gray-800 hover:text-red-500 text-sm"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-col relative">
              <label className="text-xs font-semibold text-gray-600 mb-1">
                Select Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  const monthValue = Number(e.target.value);

                  setSelectedMonth(monthValue);
                  setActiveTab("Monthly");
                  setSelectedDate(null);
                  setDateRange([null, null]);
                }}
                className="text-black px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="">All</option>
                {months.map((month, i) => (
                  <option key={i} value={i + 1}>
                    {month}
                  </option>
                ))}
              </select>

              {selectedMonth && (
                <button
                  onClick={() => setSelectedMonth("")}
                  className="absolute right-2 top-8 text-gray-800 hover:text-red-500 text-sm"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-col relative">
              <label className="text-xs font-semibold text-gray-600 mb-1">
                Date Range
              </label>
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                  setDateRange(update);
                  if (update[0] && update[1]) {
                    setSelectedDate(null);
                    setSelectedMonth("");
                    setActiveTab("Custom");
                  }
                }}
                isClearable
                placeholderText="From - To"
                className="text-black px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              {activeTab === "Daily" ||
              (activeTab === "Daily" && selectedDate) ? (
                <BarChart data={revenueData} barSize={25} barCategoryGap="40%">
                  {" "}
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis />
                  <Tooltip formatter={(v) => `₹ ${Number(v).toFixed(2)}`} />
                  <Bar
                    dataKey="revenue"
                    fill="#a855f7"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              ) : (
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis />
                  <Tooltip formatter={(v) => `₹ ${Number(v).toFixed(2)}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#7c3aed" />
                </LineChart>
              )}
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center">No revenue data</p>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4 text-black">
            🎬 Busiest Theaters
          </h2>

          {analytics.theaters.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={theaterChartData}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }} 
                  interval={0} 
                  angle={-5} 
                  textAnchor="end"
                />{" "}
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">No movie data</p>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl shadow flex flex-col justify-center items-center relative">
          <h2 className="text-lg font-semibold mb-4 text-black">
            ❌ Cancellation Rate
          </h2>

          <div className="text-5xl font-bold text-red-500">
            {analytics.cancelRate ? analytics.cancelRate.toFixed(2) : 0}%
          </div>

          <p className="text-gray-500 mt-2">Based on total bookings</p>
          <p className="absolute bottom-3 right-4 text-sm text-blue-600 hover:underline">
            <Link to="/admin/view-cancel-booking">View Cancel Booking</Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
