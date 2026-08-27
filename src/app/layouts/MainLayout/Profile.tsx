// Import Dependencies
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import {
  ArrowLeftStartOnRectangleIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { TbCoins, TbUser, TbUsersGroup } from "react-icons/tb";
import { Link } from "react-router";

// Local Imports
import { Avatar, AvatarDot, Button } from "@/components/ui";
import { ColorType } from "@/constants/app";
import { useEffect, useState } from "react";
import apiHelper from "@/utils/apiHelper";
// Define Link Types
interface LinkItem {
  id: string;
  title: string;
  description: string;
  to: string;
  Icon: React.ElementType;
  color: ColorType;
}

const links: LinkItem[] = [
  {
    id: "1",
    title: "Profile",
    description: "Your profile Setting",
    to: "/settings/general",
    Icon: TbUser,
    color: "warning",
  },
  {
    id: "2",
    title: "Messages",
    description: "Your messages and tasks",
    to: "/apps/chat",
    Icon: ChatBubbleLeftIcon,
    color: "info",
  },
  {
    id: "3",
    title: "Team",
    description: "Your team members",
    to: "#",
    Icon: TbUsersGroup,
    color: "secondary",
  },
  {
    id: "4",
    title: "Billing",
    description: "Your billing information",
    to: "/settings/billing",
    Icon: TbCoins,
    color: "error",
  },
  {
    id: "5",
    title: "Settings",
    description: "Webapp settings",
    to: "/settings/appearance",
    Icon: Cog6ToothIcon,
    color: "success",
  },
];

// ----------------------------------------------------------------------

export function Profile() {
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
  try {
    const response = await apiHelper.get("/company");
    // Handle different response structures
    const companyData = response?.data?.data?.[0] || response?.data?.[0] || response;
    setCompany(companyData);
  } catch (error) {
    console.error("Failed to fetch company:", error);
  }
};

const getCompanyLogo = () => {
  if (!company?.logo) return "/images/avatar/avatar-12.jpg";
  return apiHelper.getImageUrl(company.logo);
};

  return (
    <Popover className="relative">
      <PopoverButton
        as={Avatar}
        size={12}
        role="button"
      src={getCompanyLogo()}
        alt="Profile"
        indicator={
          <AvatarDot color="success" className="ltr:right-0 rtl:left-0" />
        }
        className="cursor-pointer"
      />
      <Transition
        enter="duration-200 ease-out"
        enterFrom="translate-x-2 opacity-0"
        enterTo="translate-x-0 opacity-100"
        leave="duration-200 ease-out"
        leaveFrom="translate-x-0 opacity-100"
        leaveTo="translate-x-2 opacity-0"
      >
        <PopoverPanel
          anchor={{ to: "right end", gap: 12 }}
          className="border-gray-150 shadow-soft dark:border-dark-600 dark:bg-dark-700 z-70 flex w-64 flex-col rounded-lg border bg-white transition dark:shadow-none"
        >
          {({ close }) => (
            <>
              {/* User Info */}
              <div className="dark:bg-dark-800 flex items-center gap-4 rounded-t-lg bg-gray-100 px-4 py-5">
               <Avatar
  size={14}
  src={getCompanyLogo()}
/>
                <div>
                  <Link
                    className="hover:text-primary-600 focus:text-primary-600 dark:text-dark-100 dark:hover:text-primary-400 dark:focus:text-primary-400 text-base font-medium text-gray-700"
                    to="/settings/general"
                  >
                    {company?.companyName || "Company Name"}
                  </Link>
                  {/* <p className="mt-0.5 text-xs text-gray-400 dark:text-dark-300">
                    Product Designer
                  </p> */}
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col pt-2 pb-5">
                {links.map((link) => (
                  <Link
                    key={link.id}
                    to={link.to}
                    onClick={() => close()}
                    className="group dark:hover:bg-dark-600 dark:focus:bg-dark-600 flex items-center gap-3 px-4 py-2 tracking-wide outline-hidden transition-all hover:bg-gray-100 focus:bg-gray-100"
                  >
                    <Avatar
                      size={8}
                      initialColor={link.color}
                      classNames={{ display: "rounded-lg" }}
                    >
                      <link.Icon className="size-4.5" />
                    </Avatar>
                    <div>
                      <h2 className="group-hover:text-primary-600 group-focus:text-primary-600 dark:text-dark-100 dark:group-hover:text-primary-400 dark:group-focus:text-primary-400 font-medium text-gray-800 transition-colors">
                        {link.title}
                      </h2>
                      <div className="dark:text-dark-300 truncate text-xs text-gray-400">
                        {link.description}
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Logout Button */}
                <div className="px-4 pt-4">
                  <Button className="w-full gap-2">
                    <ArrowLeftStartOnRectangleIcon className="size-4.5" />
                    <span>Logout</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}
