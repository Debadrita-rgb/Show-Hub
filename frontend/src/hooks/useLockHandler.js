import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import BASE_URL from "../../config";

export default function useLockHandler() {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  const isBookingFlow = (path) => {
    return (
      path.includes("/seat-arrangement") ||
      path === "/food-beverage" ||
      path === "/payment"
    );
  };

  // Handle tab close / refresh
  useEffect(() => {
    const handleLeave = () => {
      const lockId = localStorage.getItem("lockId");

      if (lockId && isBookingFlow(window.location.pathname)) {
        navigator.sendBeacon(
          `${BASE_URL}/user/release-lock`,
          JSON.stringify({ lockId }),
        );
      }
    };

    window.addEventListener("beforeunload", handleLeave);

    return () => {
      window.removeEventListener("beforeunload", handleLeave);
    };
  }, []);

  // Handle route change (MAIN FIX)
useEffect(() => {
  const prevPath = prevPathRef.current;
  const currentPath = location.pathname;

  const wasInBooking = isBookingFlow(prevPath);
  const nowInBooking = isBookingFlow(currentPath);

  // Leaving booking flow → release lock
  if (wasInBooking && !nowInBooking) {
    const lockId = localStorage.getItem("lockId");

    if (lockId) {
      navigator.sendBeacon(
        `${BASE_URL}/user/release-lock`,
        JSON.stringify({ lockId }),
      );

      localStorage.removeItem("lockId");
      localStorage.removeItem("lockExpiry");
    }
  }

  prevPathRef.current = currentPath;
}, [location.pathname]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        const lockId = localStorage.getItem("lockId");

        if (lockId && isBookingFlow(window.location.pathname)) {
          navigator.sendBeacon(
            `${BASE_URL}/user/release-lock`,
            JSON.stringify({ lockId }),
          );
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);
}
