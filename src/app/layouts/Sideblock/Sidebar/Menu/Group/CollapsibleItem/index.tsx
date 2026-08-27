// Import Dependencies
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useState } from "react";

// Local Imports
import { MenuItem } from "./MenuItem";
import { type NavigationTree } from "@/@types/navigation";
import { navigationIcons } from "@/app/navigation/icons";

// ----------------------------------------------------------------------

export function CollapsibleItem({ data }: { data: NavigationTree }) {
  const { id, path, transKey, icon, childs, title } = data;
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Check if icon exists
  let Icon = null;
  if (icon && navigationIcons[icon]) {
    Icon = navigationIcons[icon];
  }

  // If no children, don't render
  if (!childs || childs.length === 0) {
    return null;
  }

  const label = transKey ? t(transKey) : title;

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="relative flex flex-1 flex-col px-3 w-full">
      <button
        onClick={toggleOpen}
        className={clsx(
          "group flex flex-1 cursor-pointer items-center justify-between rounded-lg px-3 py-2 font-medium outline-hidden transition-colors duration-300 ease-in-out w-full",
          isOpen
            ? "dark:text-dark-50 text-gray-800" // ← CHANGED FROM text-gray-800 TO text-gray-900
            : clsx(
                "dark:text-dark-200 dark:hover:bg-dark-300/10 dark:hover:text-dark-50 dark:focus:bg-dark-300/10",
                // Change text color from text-gray-800 to text-gray-900 (black) in light mode
                "text-gray-900 hover:bg-gray-100 hover:text-gray-950 focus:bg-gray-100 focus:text-gray-950" // ← CHANGED
              )
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <Icon
              className={clsx(
                "size-5 shrink-0 stroke-[1.5]",
                !isOpen && "opacity-80 group-hover:opacity-100",
              )}
            />
          )}
          <span className="truncate">{label}</span>
        </div>
        {/* Dropdown arrow */}
        <ChevronDownIcon
          className={clsx(
            "size-4 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="flex flex-col space-y-1 px-3 py-1.5">
          {childs.map((child) => (
            <MenuItem key={child.id} data={child} />
          ))}
        </div>
      )}
    </div>
  );
}