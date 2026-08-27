import { Outlet, ScrollRestoration } from "react-router";
import { useEffect, lazy } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

// Local Imports
import { useAuthContext } from "@/app/contexts/auth/context";
import { SplashScreen } from "@/components/template/SplashScreen";
import { Loadable } from "@/components/shared/Loadable";
import { Progress } from "@/components/template/Progress";

const Toaster = Loadable(lazy(() => import("@/components/template/Toaster")));
const Tooltip = Loadable(lazy(() => import("@/components/template/Tooltip")));

function Root() {
  const { isInitialized } = useAuthContext();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return; // ← skip on web, only run in app

    const listener = CapacitorApp.addListener("backButton", () => {
      const isHome =
        window.location.pathname === "/" ||
        window.location.pathname === "/dashboards/dashboard";

      if (isHome) {
        CapacitorApp.exitApp(); // ← exit instead of getting stuck
      } else {
        window.history.back();
      }
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, []);

  if (!isInitialized) {
    return <SplashScreen />;
  }

  return (
    <>
      <Progress />
      <ScrollRestoration />
      <Outlet />
      <Tooltip />
      <Toaster />
    </>
  );
}

export default Root;