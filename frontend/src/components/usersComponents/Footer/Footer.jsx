import React from "react";
import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <div>
      <footer className="mt-12 bg-[#002a47] py-4 text-center text-sm text-gray-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-5">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ABOUT</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="hover:none">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:none">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="hover:none">
                  Feedback
                </Link>
              </li>
              <li>
                <Link to="/testimonial" className="hover:none">
                  Testimonial
                </Link>
              </li>
            </ul>
          </div>

          {/* Services Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">SERVICES</h3>
            <ul className="space-y-2 text-sm">
              {/* <li>
                <Link to="/services/catering" className="hover:none">
                  Catering
                </Link>
              </li>
              <li>
                <Link
                  to="/services/facilities/salonCategory"
                  className="hover:none"
                >
                  Salon
                </Link>
              </li>
              <li>
                <Link to="/services/stationary" className="hover:none">
                  Stationary
                </Link>
              </li>*/}

              <li>
                <Link to="/show-all-movies" className="hover:none">
                  Movie
                </Link>
              </li>

              {/* <li>
                <Link to="/services/facilities/fitness" className="hover:none">
                  Fitness Centre
                </Link>
              </li>
              <li>
                <Link
                  to="/services/facilities/partyhall"
                  className="hover:none"
                >
                  Party Hall
                </Link>
              </li> */}
            </ul>
          </div>

          {/* Social Media Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">FOLLOW US</h3>
            <div className="flex space-x-4 ms-35">
              <Link
                to="https://www.facebook.com/"
                aria-label="Facebook"
                className="hover:opacity-75"
                target="_blank"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png"
                  alt="Facebook"
                  className="w-6 h-6"
                />
              </Link>
              <Link
                to="https://www.instagram.com/"
                aria-label="Instagram"
                className="hover:opacity-75"
                target="_blank"
              >
                <img
                  src="https://cdn-icons-png.freepik.com/256/15707/15707869.png?semt=ais_hybrid"
                  alt="Instagram"
                  className="w-6 h-6"
                />
              </Link>
              <Link
                to="https://in.linkedin.com/"
                aria-label="LinkedIn"
                className="hover:opacity-75"
                target="_blank"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/LinkedIn_icon.svg/2048px-LinkedIn_icon.svg.png"
                  alt="LinkedIn"
                  className="w-6 h-6"
                />
              </Link>
            </div>
          </div>
        </div>
        © 2026 ShowHub Inc. All rights reserved.
      </footer>
    </div>
  );
};

export default Footer;
