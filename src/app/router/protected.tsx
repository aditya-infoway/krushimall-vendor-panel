import { Navigate, RouteObject } from "react-router";

import AuthGuard from "@/middleware/AuthGuard";
import { DynamicLayout } from "../layouts/DynamicLayout";
// import { AppLayout } from "../layouts/AppLayout";

/**
 * Protected routes configuration
 * These routes require authentication to access
 * Uses AuthGuard middleware to verify user authentication
 */
const protectedRoutes: RouteObject = {
  id: "protected",
  Component: AuthGuard,
  children: [
    // Separate page
    {
      path: "select-company",
      lazy: async () => ({
        Component: (await import("@/app/pages/Auth/Selectecompany")).default,
      }),
    },

    // Dashboard pages only
    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboards/dashboard" replace />,
        },
        {
          path: "dashboards",
          children: [
            {
              index: true,
              element: <Navigate to="dashboard" replace />,
            },

            {
              path: "dashboard",
              lazy: async () => ({
                Component: (await import("@/app/pages/dashboards/dashboard"))
                  .default,
              }),
            },
            {
              path: "inventory",
              lazy: async () => ({
                Component: (await import("@/app/pages/dashboards/inventory"))
                  .default,
              }),
            },
          ],
        },
        {
          path: "master",
          children: [
            {
              path: "category",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/category"))
                  .default,
              }),
            },

            {
              path: "brand",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/brand")).default,
              }),
            },

            {
              path: "subcategory",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/subcategory"))
                  .default,
              }),
            },
            {
              path: "sub-subcategory",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/sub-subcategory"))
                  .default,
              }),
            },

            {
              path: "year",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/modelyear"))
                  .default,
              }),
            },

            {
              path: "color",
              lazy: async () => ({
                Component: (await import("@/app/pages/master/colour")).default,
              }),
            },

            {
              path: "variant",
              children: [
                {
                  index: true,
                  element: <Navigate to="create" replace />,
                },

                {
                  path: "create",
                  lazy: async () => ({
                    Component: (
                      await import("@/app/pages/master/variant/createvariant")
                    ).default,
                  }),
                },
                {
                  path: "website",
                  children: [
                    {
                      index: true,
                      lazy: async () => ({
                        Component: (
                          await import("@/app/pages/master/variant/websitevariantList")
                        ).default,
                      }),
                    },

                    {
                      path: "create",
                      lazy: async () => ({
                        Component: (
                          await import("@/app/pages/master/variant/WebsiteVariant")
                        ).default,
                      }),
                    },
                  ],
                },

                {
                  path: "showroom",
                  lazy: async () => ({
                    Component: (
                      await import("@/app/pages/master/variant/showroomvariant")
                    ).default,
                  }),
                },
              ],
            }, //   {
            //   path: "showroomvariant",
            //   lazy: async () => ({
            //     Component: (
            //       await import("@/app/pages/master/variant/showroomvariant")
            //     ).default,
            //   }),
            // },
          ],
        },
        {
          path: "productmaster",
          children: [
            {
              path: "product",
              lazy: async () => ({
                Component: (await import("@/app/pages/productmaster/product"))
                  .default,
              }),
            },
            {
              path: "add-product",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/productmaster/createproduct")
                ).default,
              }),
            },
            {
              path: "edit-product/:id",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/productmaster/createproduct")
                ).default,
              }),
            },
            // {
            //   path: "product/:id",
            //   lazy: async () => ({
            //     Component: (await import("@/app/pages/productmaster/viewproduct")).default,
            //   }),
            // },
          ],
        },
        {
          path: "order",
          children: [
            {
              path: "order",
              lazy: async () => ({
                Component: (await import("@/app/pages/order/order")).default,
              }),
            },
          ],
        },
        {
          path: "settings",
          lazy: async () => ({
            Component: (await import("@/app/pages/settings/Layout")).default,
          }),
          children: [
            {
              index: true,
              element: <Navigate to="general" replace />,
            },
            {
              path: "general",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/settings/sections/General")
                ).default,
              }),
            },
            {
              path: "appearance",
              lazy: async () => ({
                Component: (
                  await import("@/app/pages/settings/sections/Appearance")
                ).default,
              }),
            },
          ],
        },
      ],
    },
  ],
};

export { protectedRoutes };
