import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function AuthHandler({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    const publicRoutes = [
      "/verify-booking",
      "/signin",
      "/signup",
      "/verify-otp",
    ];

    const fullPath = location.pathname + location.hash;

    const isPublicRoute = publicRoutes.some((route) =>
      fullPath.includes(route),
    );

    if (!token && !isPublicRoute) {
      navigate("/signin");
    }
  }, [location, navigate]);

  return children;
}
