import { NavigationTree } from "@/@types/navigation";

export const dashboards: NavigationTree = {
  id: "dashboards",
  type: "root",
  title: "Dashboards",
  icon: "dashboards",
  childs: [
    {
      id: "dashboard",
      type: "item",
      title: "Dashboard",
      path: "/dashboards/dashboard",
    },
    {
      id: "inventory",
      type: "item",
      title: "Inventory",
      path: "/dashboards/inventory",
    },
  ],
};