// Import Dependencies
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

// Local Imports
import { Collapse } from "@/components/ui";
import { useThemeContext } from "@/app/contexts/theme/context";
import { CollapsibleItem } from "./CollapsibleItem";
import { MenuItem } from "./MenuItem";
import { type NavigationTree } from "@/@types/navigation";
import { navigationIcons } from "@/app/navigation/icons";

// ----------------------------------------------------------------------
interface GroupProps {
 data: NavigationTree;
 isOpened: boolean;
 onToggle: () => void;
}

export function Group({
 data,
 isOpened,
 onToggle,
}: GroupProps) {
 const { t } = useTranslation();
 const { cardSkin } = useThemeContext();

 // If no children, don't render
 if (!data.childs || data.childs.length === 0) {
   return null;
 }

 const Icon = data.icon ? navigationIcons[data.icon] : null;

 return (
  <div className="pt-3">
   <div
    className={clsx(
     "sticky top-0 z-10 bg-white px-6",
     cardSkin === "bordered" ? "dark:bg-dark-900" : "dark:bg-dark-750",
    )}
   >
    <button
     onClick={onToggle}
     className={clsx(
       "dark:text-dark-300 dark:hover:text-dark-50 dark:focus:text-dark-50 mb-2 flex w-full cursor-pointer items-center justify-between pt-2 text-xs font-medium tracking-wider uppercase outline-hidden hover:text-gray-900 focus:text-gray-900",
       // Change text color from text-gray-500 to text-gray-900 (black) in light mode
       "text-gray-900" // ← CHANGED FROM text-gray-500 TO text-gray-900
     )}
    >
     <div className="flex items-center gap-3">
       {Icon && <Icon className="h-4 w-4 shrink-0" />}
       <span>{data.transKey ? t(data.transKey) : data.title}</span>
     </div>
     {/* Dropdown arrow */}
     <ChevronDownIcon
       className={clsx(
         "h-4 w-4 shrink-0 transition-transform duration-200",
         isOpened && "rotate-180"
       )}
     />
    </button>
    <div
     className={clsx(
      "pointer-events-none absolute inset-x-0 -bottom-3 h-3 bg-linear-to-b from-white to-transparent",
      cardSkin === "bordered"
       ? "dark:from-dark-900"
       : "dark:from-dark-750",
     )}
    ></div>
   </div>
   {data.childs && data.childs.length > 0 && (
    <Collapse in={isOpened}>
     <div className="flex flex-col space-y-1.5">
      {data.childs.map((item) => {
       switch (item.type) {
        case "collapse":
         return <CollapsibleItem key={item.path} data={item} />;
        case "item":
         return <MenuItem key={item.path} data={item} />;
        default:
         return null;
       }
      })}
     </div>
    </Collapse>
   )}
  </div>
 );
}