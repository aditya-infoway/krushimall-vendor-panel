import { Outlet } from "react-router";
import { Card } from "@/components/ui";

export default function Settings() {
  return (
    <main className="flex-1 p-6">
      <Card className="p-4 sm:px-5">
        <Outlet />
      </Card>
    </main>
  );
}