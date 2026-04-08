import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function AuthHandler({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    const publicRoutes = ["/verify-booking", "/signin", "/signup", "/verify-otp", "/admin"];

    const isPublicRoute = publicRoutes.some((route) =>
      location.pathname.startsWith(route),
    );

    if (!token && !isPublicRoute) {
      navigate("/");
    }
  }, [location, navigate]);

  return children;
}
