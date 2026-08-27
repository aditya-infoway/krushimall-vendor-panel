// Import Dependencies
// import { LogOut } from "lucide-react";
// import { useNavigate } from "react-router";
import { clsx } from "clsx";

// Local Imports
import { useThemeContext } from "@/app/contexts/theme/context";
import { useAuthContext } from "@/app/contexts/auth/context";
// ----------------------------------------------------------------------
import {  Button } from "@/components/ui";
import {
  ArrowLeftStartOnRectangleIcon,
 
} from "@heroicons/react/24/outline";
export function LogoutButton() {
//   const navigate = useNavigate();
  const { cardSkin } = useThemeContext();
  const { logout } = useAuthContext();
//   const handleLogout = () => {
//     // apna actual auth clear logic yaha daalo
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");

//     navigate("/login");
//   };

  return (
    <div
      className={clsx(
        "shrink-0 border-t p-3",
        cardSkin === "shadow"
          ? "border-gray-200 dark:border-dark-600"
          : "border-gray-200 dark:border-dark-600/80",
      )}
    >
      <Button className="w-full gap-2" onClick={() => logout()}>
                    <ArrowLeftStartOnRectangleIcon className="size-4.5" />
                    <span>Logout</span>
                  </Button>
    </div>
  );
}