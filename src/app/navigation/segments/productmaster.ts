import { NavigationTree } from "@/@types/navigation";

export const productmaster: NavigationTree = {
  id: "productmaster",
  type: "root",
  title: "Product master",
  icon: "master",
  childs: [
    {
      id: "product",
      type: "item",
      title: "Product",
      path: "/productmaster/product",
   
    },
    //  {
    //   id: "subcategory",
    //   type: "item",
    //   title: "Sub Category",
    //   path: "/master/subcategory",
   
    // },
    //  {
    //   id: "sub-subcategory",
    //   type: "item",
    //   title: "Sub-Subcategory",
    //   path: "/master/sub-subcategory",
   
    // },
    // {
    //   id: "brand",
    //   type: "item",
    //   title: "Brand",
    //   path: "/master/brand",
   
    // },
   
    // {
    //   id: "year",
    //   type: "item",
    //   title: "Year",
    //   path: "/master/year",
  
    // },
    //  {
    //   id: "color",
    //   type: "item",
    //   title: "Colour",
    //   path: "/master/color",
  
    // },

    // Dropdown
    // {
    //   id: "variant",
    //   type: "collapse",
    //   title: "Variant",
    //     path: "/master/variant", 
    //   icon: "variant",
    //   childs: [
    //     {
    //       id: "createvariant",
    //       type: "item",
    //       title: "Create Variant",
    //       path: "/master/variant/create",
    //     },
    //     {
    //       id: "websitevariant",
    //       type: "item",
    //       title: "Website Variant",
    //       path: "/master/variant/website",
    //     },
    //     {
    //       id: "showroomvariant",
    //       type: "item",
    //       title: "Showroom Variant",
    //       path: "/master/variant/showroom",
    //     },
    //   ],
    // },
  ],
};