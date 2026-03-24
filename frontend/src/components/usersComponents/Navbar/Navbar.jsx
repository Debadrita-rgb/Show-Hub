import { useState, useEffect, useRef } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import logo from "../../../assets/logo.png";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./Navbar.css";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useLocationcity } from "../../../context/LocationContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../../config";


export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const { role } = useAuth();

  // const [city, setCity] = useState("Detecting...");
  const { city, setCity } = useLocationcity();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [filteredShows, setFilteredShows] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [locationsearch, setLocationSearch] = useState("");
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNameDropdown(false);
        setIsLocationOpen(false);
        setIsSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const cities = [
    {
      name: "Mumbai",
      img: "https://assets-in.bmscdn.com/m6/images/common-modules/regions/mumbai.png",
    },
    {
      name: "Delhi",
      img: "https://assets-in.bmscdn.com/m6/images/common-modules/regions/ncr.png",
    },
    {
      name: "Bangalore",
      img: "https://assets-in.bmscdn.com/m6/images/common-modules/regions/bang.png",
    },
    {
      name: "Hyderabad",
      img: "https://assets-in.bmscdn.com/m6/images/common-modules/regions/hyd.png",
    },
    {
      name: "Kolkata",
      img: "https://assets-in.bmscdn.com/m6/images/common-modules/regions/kolk.png",
    },
    {
      name: "Ahmedabad",
      img: "https://assets-in.bmscdn.com/m6/images/common-modules/regions/ahd.png",
    },
    {
      name: "Pune",
      img: "https://assets-in.bmscdn.com/m6/images/common-modules/regions/pune.png",
    },
    {
      name: "Chennai",
      img: "https://assets-in.bmscdn.com/m6/images/common-modules/regions/chen.png",
    },
  ];

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(locationsearch.toLowerCase()),
  );

  const detectLocation = async () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        );

        const data = await response.json();

        const detectedCity =
          data.address.city ||
          data.address.county?.replace(" City", "") ||
          data.address.state_district?.replace(" District", "") ||
          data.address.town ||
          data.address.village ||
          data.address.state;

        setCity(detectedCity);
        setIsLocationOpen(false);
      } catch (error) {
        console.error("Error detecting city:", error);
      }
    });
  };

  useEffect(() => {
    detectLocation();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedName = localStorage.getItem("userName");

    if (token && storedName) {
      setIsLoggedIn(true);
      setUserName(storedName);
    } else {
      setIsLoggedIn(false);
      setUserName("Guest");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("showWelcomeToast");
    localStorage.removeItem("userName");

    // Update local state
    setIsLoggedIn(false);
    setUserName("Guest");

    toast.success("🎉 Logged out successfully!", {
      autoClose: 3000,
      pauseOnFocusLoss: false,
    });

    navigate("/signin");
  };

  // Fetch movies once on mount

  useEffect(() => {
    // Movies
    fetch(`${BASE_URL}/user/get-recommended-movies`)
      .then((res) => res.json())
      .then((data) => {
        setMovies(data.data);
        setFilteredMovies(data.data);
      })
      .catch((err) => console.error(err));

    // Shows
    fetch(`${BASE_URL}/user/get-recommended-shows`)
      .then((res) => res.json())
      .then((data) => {
        setShows(data.data);
        setFilteredShows(data.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Filter whenever query changes
  useEffect(() => {
    const movieResults = movies.filter((movie) =>
      movie.title.toLowerCase().includes(query.toLowerCase()),
    );

    const showResults = shows.filter((show) =>
      show.showName.toLowerCase().includes(query.toLowerCase()),
    );

    setFilteredMovies(movieResults);
    setFilteredShows(showResults);
  }, [query, movies, shows]);

  // Click handler: close modal and navigate
  const handleMovieClick = (movie) => {
    setIsSearchOpen(false);
    navigate(`/movie/${movie.slug}/${movie._id}`);
  };

  const handleShowClick = (show) => {
    setIsSearchOpen(false);
    navigate(`/single-show/${show._id}`);
  };

  // const filteredNavigation = isLoggedIn
  //   ? navigation.filter(
  //       (item) => item.name !== "SignIn" && item.name !== "SignUp",
  //     )
  //   : navigation;

  return (
    <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-black/80 via-purple-900/70 to-black/80 backdrop-blur-md text-white shadow-lg">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* TOP NAVBAR */}
      <div className="flex items-center justify-between px-6 py-3">
        {/* LEFT (LOGO) */}
        <div className="flex items-center flex-shrink-0">
          {" "}
          <Link to="/">
            <img
              src={logo}
              alt="logo"
              // className="h-10 cursor-pointer hover:scale-105 transition"
              className="cursor-pointer hover:scale-105 transition 
                 h-10 sm:h-11 md:h-12 lg:h-16
                 w-auto object-contain ml-2 sm:ml-5"
            />
          </Link>
        </div>

        {/* Search Bar   */}

        <div className="hidden md:flex justify-center w-full">
          <div className="w-full max-w-[520px]">
            <div className="flex items-center w-full bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-red-400 transition">
              <MagnifyingGlassIcon className="h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search for Movies, Events, Plays, Sports and Activities"
                className="ml-3 bg-transparent outline-none w-full text-sm text-black"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
              />
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center justify-end gap-4 flex-1">
          {" "}
          {/* LOCATION */}
          <div
            className="flex items-center gap-2 font-medium transition cursor-pointer"
            onClick={() => setIsLocationOpen(true)}
          >
            <MapPinIcon className="h-5 text-red-500" />
            {city}
          </div>
          {/* SMALL SIGN IN */}
          <div className="relative z-50" ref={dropdownRef}>
            {isLoggedIn ? (
              <div>
                {/* Username */}
                <button
                  onClick={() => setShowNameDropdown(!showNameDropdown)}
                  className="bg-purple-900 hover:bg-purple-800 text-white px-4 py-1.5 rounded-md text-sm"
                >
                  Hi{" "}
                  {userName
                    ? `${userName.slice(0, 10)}${userName.length > 10 ? "..." : ""}`
                    : "Guest"}
                </button>

                {/* Dropdown */}
                {showNameDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-black/80 backdrop-blur-md border border-purple-800 rounded-md shadow-lg z-[100]">
                    <Link to="/user-profile">
                      <div className="px-4 py-2 hover:bg-purple-900 cursor-pointer">
                        My Profile
                      </div>
                    </Link>
                    <Link to="/user-bookings">
                      <div className="px-4 py-2 hover:bg-purple-900 cursor-pointer">
                        My Bookings
                      </div>
                    </Link>

                    <div
                      className="px-4 py-2 hover:bg-red-600 cursor-pointer"
                      onClick={handleLogout}
                    >
                      Logout
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/signin">
                <button className="cursor-pointer bg-red-500 hover:bg-purple-950 text-white px-3 py-1 md:px-3 md:py-1 lg:px-4 lg:py-1.5 text-xs md:text-sm rounded-md shadow-sm transition hidden md:block whitespace-nowrap">
                  Sign In
                </button>
              </Link>
            )}
          </div>
          {/* MOBILE MENU */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6 text-black" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* DESKTOP SECOND NAVBAR */}
      <div className="hidden md:flex justify-between px-10 py-2 border-t bg-white/60 backdrop-blur">
        <div className="flex gap-8 text-gray-700 text-sm font-medium">
          <Link
            to="show-all-movies"
            className="hover:text-purple-950 cursor-pointer text-black"
          >
            Movies
          </Link>
          <Link className="hover:text-purple-950 cursor-pointer text-black">
            Stream
          </Link>
          <Link className="hover:text-purple-950 cursor-pointer text-black">
            Events
          </Link>
          <Link className="hover:text-purple-950 cursor-pointer text-black">
            Plays
          </Link>
          <Link className="hover:text-purple-950 cursor-pointer text-black">
            Sports
          </Link>
          <Link className="hover:text-purple-950 cursor-pointer text-black">
            Activities
          </Link>
        </div>

        {/* <div className="flex gap-6 text-gray-600 text-sm">
          <Link className="hover:text-purple-950 cursor-pointer">
            ListYourShow
          </Link>
          <Link className="hover:text-purple-950 cursor-pointer">Corporates</Link>
          <Link className="hover:text-purple-950 cursor-pointer">Offers</Link>
          <Link className="hover:text-purple-950 cursor-pointer">Gift Cards</Link>
        </div> */}
      </div>

      {/* MOBILE SEARCH */}
      <div className="px-4 pb-3 md:hidden">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
          <MagnifyingGlassIcon className="h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search for Movies, Events, Plays, Sports and Activities"
            className="ml-3 bg-transparent outline-none w-full text-sm text-black"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
          />
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white px-6 py-4 space-y-4 shadow-lg">
          <Link
            to="show-all-movies"
            href="show-all-movies"
            className="block hover:text-purple-950 cursor-pointer text-black"
          >
            Movies
          </Link>
          {/* <Link className="block hover:text-purple-950 cursor-pointer text-black">
            Stream
          </Link>
          <Link className="block hover:text-purple-950 cursor-pointer text-black">
            Events
          </Link>
          <Link className="block hover:text-purple-950 cursor-pointer text-black">
            Plays
          </Link>
          <Link className="block hover:text-purple-950 cursor-pointer text-black">
            Sports
          </Link>
          <Link className="block hover:text-purple-950 cursor-pointer text-black">
            Activities
          </Link> */}

          <button className="bg-purple-950 text-white w-full py-2 rounded-md mt-4">
            Sign In
          </button>
        </div>
      )}

      {isLocationOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-start pt-24 z-50 px-4"
          ref={dropdownRef}
        >
          {/* <div className="fixed inset-0 bg-black/40 flex justify-center items-start pt-24 z-50"> */}

          {/* MODAL */}
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-fadeIn relative">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Select Your City
              </h2>

              <button
                onClick={() => setIsLocationOpen(false)}
                className="text-gray-600 hover:text-black text-xl"
              >
                ✕
              </button>
            </div>

            {/* SEARCH */}
            <div className="px-6 pt-4">
              <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-red-400 border-gray-500">
                <MagnifyingGlassIcon className="h-5 text-black" />

                <input
                  type="text"
                  value={locationsearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Search for your city"
                  className="ml-2 w-full outline-none text-sm text-black"
                />
              </div>
            </div>

            {/* POPULAR CITIES */}
            <div className="px-6 mt-6">
              <p className="text-sm text-gray-500 mb-4">Popular Cities</p>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-6 text-center">
                {filteredCities.map((c) => (
                  <div
                    key={c.name}
                    onClick={() => {
                      setCity(c.name);
                      setIsLocationOpen(false);
                    }}
                    className="cursor-pointer group"
                  >
                    {/* <div className="text-3xl transition-transform group-hover:scale-110">
                      🏙️
                    </div> */}
                    <img
                      src={c.img}
                      alt={c.name}
                      className="w-14 h-14 mx-auto object-cover group-hover:scale-110 transition"
                    />

                    <p className="text-sm mt-2 text-gray-700 group-hover:text-purple-950">
                      {c.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER */}
            <div className="border-t mt-6 px-6 py-3 text-center"></div>
          </div>
        </div>
      )}

      {/* Search Modal Open  */}

      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 bg-opacity-50 flex justify-center items-start pt-32 px-4 md:pt-20"
          ref={dropdownRef}
        >
          {" "}
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-4 relative">
            {/* Close Button */}
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold text-xl"
            >
              ×
            </button>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-black">
                  Movies
                </h3>

                {filteredMovies.length > 0 ? (
                  filteredMovies.map((movie) => (
                    <div
                      key={movie._id}
                      onClick={() => handleMovieClick(movie)}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                    >
                      <img
                        src={movie.movieimage}
                        alt={movie.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <span className="text-black">{movie.title}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No movies found</p>
                )}
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2 text-black">Shows</h3>
                {filteredShows.length > 0 ? (
                  filteredShows.slice(0, 5).map((show) => (
                    <div
                      key={show._id}
                      onClick={() => handleShowClick(show)}
                      className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                    >
                      <img
                        src={show.showImage}
                        alt={show.showName}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <span className="text-black"> {show.showName}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No shows found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
