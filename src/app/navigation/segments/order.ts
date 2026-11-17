import { NavigationTree } from "@/@types/navigation";

export const order: NavigationTree = {
  id: "order",
  type: "root",
  title: "order",
  icon: "follow",
     path: "/order",
  childs: [
   
    {
      id: "order",
      type: "item",
      title: "Order",
      path: "/order/order",
    },
  ],
};