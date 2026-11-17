import { NavigationTree } from "@/@types/navigation";

export const coupan: NavigationTree = {
  id: "coupan",
  type: "root",
  title: "coupan",
  icon: "item",
     path: "/coupan",
  childs: [
   
    {
      id: "coupan",
      type: "item",
      title: "Add coupan",
      path: "/coupan/coupan",
    },
  ],
};