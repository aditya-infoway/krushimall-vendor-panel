// Import Dependencies
import { Navigate, useOutlet } from "react-router";

// Local Imports
import { useAuthContext } from "@/app/contexts/auth/context";
// import { HOME_PATH, REDIRECT_URL_KEY } from "@/constants/app";

// ----------------------------------------------------------------------


export default function GhostGuard() {
  const outlet = useOutlet();
  const { isAuthenticated } = useAuthContext();

 

  if (isAuthenticated) {
  
    return <Navigate to="/select-company" replace />;
  }

  return <>{outlet}</>;
}
