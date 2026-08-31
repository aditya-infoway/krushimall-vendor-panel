// Import Dependencies
import { Navigate, useOutlet } from "react-router";

// Local Imports
import { useAuthContext } from "@/app/contexts/auth/context";
// import { HOME_PATH, REDIRECT_URL_KEY } from "@/constants/app";

// ----------------------------------------------------------------------

export default function GhostGuard() {
  const outlet = useOutlet();
  const { isAuthenticated, isInitialized } = useAuthContext();

  // Jab tak AuthProvider apna token-check (init) complete nahi kar leta,
  // tab tak login form render hi mat karo — warna ek pal ke liye
  // form flash hoga chahe user already authenticated ho.
  if (!isInitialized) {
    return null; // yahan chaho to apna loader/spinner laga sakte ho
  }

  if (isAuthenticated) {
    return <Navigate to="/select-company" replace />;
  }

  return <>{outlet}</>;
}