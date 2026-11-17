import { NavigationTree } from "@/@types/navigation";

export const vendor: NavigationTree = {
  id: "vendor",
  type: "root",
  title: "vendor",
  icon: "follow", 
    path: "/vendor",
  childs: [
   
    {
      id: "vendor",
      type: "item",
      title: "vendor",
      path: "/vendor/vendor",
    },
  ],
};