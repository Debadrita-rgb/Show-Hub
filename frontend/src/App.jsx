import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Layout
import UserLayout from "./pages/users_pages/layouts/UsersLayout.jsx";

//users routes
import UserHomePage from "./pages/users_pages/Index/Index";
import SignUp from "./pages/users_pages/signUp/signUp";
import VerifyOtp from "./pages/users_pages/signUp/VerifyOtp.jsx";
import SignIn from "./pages/users_pages/signIn/signIn";
import About from "./pages/users_pages/about/about";
import Contact from "./pages/users_pages/contact/contact";
import SeatArrangementPage from "./components/usersComponents/booking/Movie/SeatArrangementPage.jsx";
import SingleMovie from "./components/usersComponents/MovieGallery/SingleMovie";
import ShowAllReview from "./components/usersComponents/Review/ShowAllReview";
import ShowTrailerVideo from "./components/usersComponents/MovieGallery/ShowTrailerVideo.jsx";
import AllMovie from "./pages/users_pages/Movie/AllMovie.jsx";
import Faq from "./pages/users_pages/faq/faq";
import MyBooking from "./pages/users_pages/Booking/Booking.jsx";
import VerifyBooking from "./pages/users_pages/Booking/VerifyBooking.jsx";
import MyBookingMovies from "./pages/users_pages/MovieBooking/Movie.jsx";
import FoodBeverage from "./pages/users_pages/MovieBooking/foodBeverage.jsx";
import Payment from "./pages/users_pages/MovieBooking/Payment.jsx";
import ShowPayment from "./pages/users_pages/ShowBooking/ShowPayment.jsx";
import MyProfile from "./pages/users_pages/Profile/Profile.jsx";
import AllShows from "./pages/users_pages/LifeEvents/AllLifeEvents.jsx";
import SingleShow from "./components/usersComponents/LifeEvents/SingleShow.jsx";

//admin routes
import AdminLayout from "./components/layout/admin/AdminLayout";
import AdminDashboard from "./pages/admin_pages/AdminDashboard/AdminDashboard.jsx";
// import Facilities from "./pages/admin_pages/facilities/facilities.jsx";

// Movie
import ViewMovie from "./pages/admin_pages/Movie/viewMovie.jsx";
import AdminaddMovie from "./pages/admin_pages/Movie/addMovie.jsx";
import AdmineditMovie from "./pages/admin_pages/Movie/editMovie.jsx";

//User
import AdminUser from "./pages/admin_pages/User/viewUser.jsx";
import AdminAddUser from "./pages/admin_pages/User/addUser.jsx";
import AdmineditUser from "./pages/admin_pages/User/editUser.jsx";

//Category
import AdminCategory from "./pages/admin_pages/Category/viewCategory.jsx";
import AdminAddCategory from "./pages/admin_pages/Category/addCategory.jsx";
import AdmineditCategory from "./pages/admin_pages/Category/editCategory.jsx";

//show
import AdminShow from "./pages/admin_pages/Show/viewShow.jsx";
import AdminAddShow from "./pages/admin_pages/Show/addShow.jsx";
import AdminEditShow from "./pages/admin_pages/Show/editShow.jsx";

//LocationWiseMovie
import AdminViewdLocationWiseMovie from "./pages/admin_pages/LocationWiseMovie/ViewLocationWiseMovie.jsx";
import AdminAddLocationWiseMovie from "./pages/admin_pages/LocationWiseMovie/AddLocationWiseMovie.jsx";
import AdmineditLocationWiseMovie from "./pages/admin_pages/LocationWiseMovie/editLocationWiseMovie.jsx";

//Language
import AdminLanguage from "./pages/admin_pages/common/Language/viewLanguage.jsx";
import AdminAddLanguage from "./pages/admin_pages/common/Language/addLanguage.jsx";
import AdmineditLanguage from "./pages/admin_pages/common/Language/editLanguage.jsx";

//Banner
import AdminBanner from "./pages/admin_pages/common/Banner/viewBanner.jsx";
import AdminAddBanner from "./pages/admin_pages/common/Banner/addBanner.jsx";
import AdmineditBanner from "./pages/admin_pages/common/Banner/editBanner.jsx";

//Theater
import AdminTheater from "./pages/admin_pages/Theater/viewTheater.jsx";
import AdminAddTheater from "./pages/admin_pages/Theater/addTheater.jsx";
import AdmineditTheater from "./pages/admin_pages/Theater/editTheater.jsx";

//Gallery
import AdminviewGallery from "./pages/admin_pages/common/Gallery/viewGallery.jsx";
import AdminaddGallery from "./pages/admin_pages/common/Gallery/addGallery.jsx";

// Admin conatct
import AdminContact from "./pages/admin_pages/common/Contact/contact.jsx";
import AdminViewContactDetails from "./pages/admin_pages/common/Contact/ViewContactDetails.jsx";

// Admin conatct
import AdminFeedback from "./pages/admin_pages/common/Feedback/Feedback.jsx";
import AdminViewFeedbackDetails from "./pages/admin_pages/common/Feedback/Viewfeedbackdetails.jsx";

// Admin conatct
import AdminTestimonial from "./pages/admin_pages/common/Testimonial/Testimonial.jsx";
import AdminViewTestimonialDetails from "./pages/admin_pages/common/Testimonial/Viewtestimonialdetails.jsx";

//admin view booking
import AdminviewBooking from "./pages/admin_pages/Booking/viewBooking.jsx";

//user testimonial
import UserTestimonial from "./pages/users_pages/Testimonial/Testimonial.jsx";
// user feedback
import UserFeedback from "./pages/users_pages/Feedback/Feedback.jsx";

// Login Page of Admin,Manager,Head Cook,Supervisor
import LoginPage from "./pages/LoginPage/LoginPage";

const App = () => {
  // const { role } = useAuth();
  // const role = localStorage.getItem("role");
  // const isAuthenticated = !!role;
  const { loading, isAuthenticated, role } = useAuth();
  if (loading) return <div>Loading...</div>;

  // console.log("Auth check:", isAuthenticated, "Role:", role);
  return (
    <div className="min-h-screen bg-transparent">
      {/* <ToastContainer position="top-right" autoClose={2000} /> */}

      <HashRouter>
        <Routes>
          {/* User */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<UserHomePage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/testimonial" element={<UserTestimonial />} />
            <Route path="/feedback" element={<UserFeedback />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/user-profile" element={<MyProfile />} />
            <Route
              path="movie/:slug/:id/book-movie"
              element={<MyBookingMovies />}
            />
            {/* <Route
              path="services/facilities/movies/book-movie/:movieId"
              element={<BookMovieForm />}
            /> */}
            <Route
              path="/movie/:slug/:id/book-movie/seat-arrangement"
              element={<SeatArrangementPage />}
            />
            <Route path="movie/:slug/:id" element={<SingleMovie />} />
            <Route path="single-show/:id" element={<SingleShow />} />

            <Route path="/food-beverage" element={<FoodBeverage />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/show-payment" element={<ShowPayment />} />

            <Route
              path="/:type/:slug/:id/user-reviews"
              element={<ShowAllReview />}
            />
            <Route
              path="/movie/:slug/:id/videos"
              element={<ShowTrailerVideo />}
            />
            <Route path="/show-all-movies" element={<AllMovie />} />
            <Route path="/shows/:slug/:id" element={<AllShows />} />
            <Route path="/user-bookings" element={<MyBooking />} />
            <Route path="/verify-booking/:id" element={<VerifyBooking />} />
          </Route>

          {/* Common Login Page */}
          <Route path="/backend/login" element={<LoginPage />} />

          {/* Admin Routes */}
          {isAuthenticated && role === "admin" && (
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              {/* <Route path="facilities" element={<Facilities />} /> */}
              {/*  Movie  */}
              <Route path="viewMovie" element={<ViewMovie />} />
              <Route path="addMovie" element={<AdminaddMovie />} />
              <Route path="editMovie/:id" element={<AdmineditMovie />} />
              {/* User */}
              <Route path="view-all-user" element={<AdminUser />} />
              <Route path="add-user" element={<AdminAddUser />} />
              <Route path="edit-user/:id" element={<AdmineditUser />} />
              {/* Gallery */}
              <Route path="view-gallery" element={<AdminviewGallery />} />
              <Route path="add-gallery" element={<AdminaddGallery />} />

              {/* Category */}
              <Route path="view-all-category" element={<AdminCategory />} />
              <Route path="add-category" element={<AdminAddCategory />} />
              <Route path="edit-category/:id" element={<AdmineditCategory />} />

              {/* LocationWise Movie */}
              <Route
                path="view-all-movie-selection"
                element={<AdminViewdLocationWiseMovie />}
              />
              <Route
                path="add-movie-selection"
                element={<AdminAddLocationWiseMovie />}
              />
              <Route
                path="edit-movie-selection/:id"
                element={<AdmineditLocationWiseMovie />}
              />

              {/* Language */}
              <Route path="view-all-language" element={<AdminLanguage />} />
              <Route path="add-language" element={<AdminAddLanguage />} />
              <Route path="edit-language/:id" element={<AdmineditLanguage />} />

              {/* Banner */}
              <Route path="view-all-banner" element={<AdminBanner />} />
              <Route path="add-banner" element={<AdminAddBanner />} />
              <Route path="edit-banner/:id" element={<AdmineditBanner />} />

              {/* Theater */}
              <Route path="view-all-theater" element={<AdminTheater />} />
              <Route path="add-theater" element={<AdminAddTheater />} />
              <Route path="edit-theater/:id" element={<AdmineditTheater />} />

              {/* Show */}
              <Route path="view-all-shows" element={<AdminShow />} />
              <Route path="add-show" element={<AdminAddShow />} />
              <Route path="edit-show/:id" element={<AdminEditShow />} />

              {/* Booking  */}
              <Route path="view-all-booking" element={<AdminviewBooking />} />

              {/* AdminContact */}
              <Route path="view-contact" element={<AdminContact />} />
              <Route
                path="view-contact-details/:id"
                element={<AdminViewContactDetails />}
              />
              {/* AdminFeedback */}
              <Route path="view-feedback" element={<AdminFeedback />} />
              <Route
                path="view-feedback-details/:id"
                element={<AdminViewFeedbackDetails />}
              />
              {/* AdminTestimonial */}
              <Route path="view-testimonial" element={<AdminTestimonial />} />
              <Route
                path="view-testimonial-details/:id"
                element={<AdminViewTestimonialDetails />}
              />
            </Route>
          )}

          {/* Redirect unknown routes */}
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </HashRouter>
    </div>
  );
};

export default App;
