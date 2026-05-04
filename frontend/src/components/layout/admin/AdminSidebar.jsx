import React, { useState } from "react";
import { FiHome } from "react-icons/fi";
import { Link } from "react-router-dom";
import { GrUserManager } from "react-icons/gr";
import { BiCategory } from "react-icons/bi";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { RiGalleryView } from "react-icons/ri";
import { BsFillPersonLinesFill } from "react-icons/bs";
import { BiCommentDetail } from "react-icons/bi";
import {
  FaFilm,
  FaTheaterMasks,
  FaTicketAlt,
  FaLanguage,
  FaUser,
  FaQuoteRight,
  FaCalendarCheck,
} from "react-icons/fa";
import { MdCategory, MdFeedback, MdLocationOn, MdPhotoLibrary, MdCollections, MdContactPhone } from "react-icons/md";

export default function AdminSidebar({ isOpen, toggleSidebar }) {
  const [miscOpen, setMiscOpen] = useState(false);
  const [movieOpen, setMovieOpen] = useState(false);
  const [showOpen, setShowOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <>
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden
  bg-white/10 shadow-2xl backdrop-blur-md border border-white/20 p-6
  transition-transform duration-300
  ${isOpen ? "translate-x-0" : "-translate-x-64"}
  md:translate-x-0 md:w-64 lg:w-64 z-50`}
      >
        <nav className="mt-5 space-y-4">
          <Link
            to="/admin/dashboard"
            className="flex items-center space-x-2 p-4 rounded transition duration-200 text-white hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
          >
            <FiHome /> <span>Dashboard</span>
          </Link>
          <Link
            to="/admin/view-all-category"
            className="block items-center p-2 ps-3 rounded transition duration-200 text-white hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
          >
            <MdCategory size={10} className="inline-block mr-2" />
            Category
          </Link>

          <div>
            <button
              onClick={() => setMovieOpen(!movieOpen)}
              className="flex items-center justify-between w-full p-4 rounded transition duration-200 text-white hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
            >
              <div className="flex items-center space-x-2">
                <BiCategory />
                <span>Movies Section</span>
              </div>
              {movieOpen ? <BsChevronUp /> : <BsChevronDown />}
            </button>

            {movieOpen && (
              <div className="ml-6 space-y-2 mt-2">
                <Link
                  to="/admin/viewMovie"
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-white hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <FaFilm size={10} className="inline-block mr-2" />
                  View Movie
                </Link>

                <Link
                  to="/admin/view-all-theater"
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-white hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <FaTheaterMasks size={10} className="inline-block mr-2" />
                  View Theater
                </Link>
                <Link
                  to="/admin/view-all-movie-selection"
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-white hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <MdLocationOn size={10} className="inline-block mr-2" />
                  Location Wise Movie Selection{" "}
                </Link>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setShowOpen(!showOpen)}
              className="flex items-center justify-between w-full p-4 rounded transition duration-200 text-white hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
            >
              <div className="flex items-center space-x-2">
                <BiCategory />
                <span>Shows Section</span>
              </div>
              {showOpen ? <BsChevronUp /> : <BsChevronDown />}
            </button>

            {showOpen && (
              <div className="ml-6 space-y-2 mt-2">
                <Link
                  to="/admin/view-all-shows"
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-white hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <FaTicketAlt size={10} className="inline-block mr-2" />
                  Show Events
                </Link>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setBookingOpen(!bookingOpen)}
              className="flex items-center justify-between w-full p-4 rounded transition duration-200 text-white hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
            >
              <div className="flex items-center space-x-2">
                <FaCalendarCheck />
                <span>Booking Section</span>
              </div>
              {bookingOpen ? <BsChevronUp /> : <BsChevronDown />}
            </button>

            {bookingOpen && (
              <div className="ml-6 space-y-2 mt-2">
                <Link
                  to="/admin/view-all-booking"
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-white hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <FaCalendarCheck size={10} className="inline-block mr-2" />
                  View Booking
                </Link>

                <Link
                  to="/admin/view-cancel-booking"
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-white hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <FaCalendarCheck size={10} className="inline-block mr-2" />
                  View Cancel Booking
                </Link>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setMiscOpen(!miscOpen)}
              className="flex items-center justify-between w-full p-4 rounded transition duration-200 text-white hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
            >
              <div className="flex items-center space-x-2">
                <BiCategory />
                <span>Miscellaneous</span>
              </div>
              {miscOpen ? <BsChevronUp /> : <BsChevronDown />}
            </button>

            {miscOpen && (
              <div className="ml-6 space-y-2 mt-2">
                <Link
                  to="/admin/view-all-banner"
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-white hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <MdPhotoLibrary size={10} className="inline-block mr-2" />
                  View Banner
                </Link>
                <Link
                  to="/admin/view-all-language"
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-white hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <FaLanguage size={10} className="inline-block mr-2" />
                  View Language
                </Link>

                <Link
                  to="/admin/view-contact"
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-white hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <MdContactPhone size={10} className="inline-block mr-2" />
                  View Contact
                </Link>
                <Link
                  to="/admin/view-all-user"
                  className="flex items-center space-x-2 p-4 rounded transition duration-200 text-white hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <FaUser size={10} className="inline-block mr-2" />
                  View User
                </Link>
                <Link
                  to="/admin/view-feedback"
                  className="block items-center p-2 ps-3 rounded transition duration-200 text-white hover:text-[#1b4c6d] hover:bg-gray-100 hover:rounded-2xl"
                >
                  <MdFeedback size={10} className="inline-block mr-2" />
                  View Feedback
                </Link>
                
              </div>
            )}
          </div>
        </nav>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}
