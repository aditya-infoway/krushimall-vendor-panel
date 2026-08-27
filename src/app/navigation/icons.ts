import {
  HomeIcon,
  UserIcon as HiUserIcon,
  FolderIcon,
  CubeIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { ElementType } from "react";
import {
  TbCategory,
  TbBriefcase,
  TbBuildingBank,
  TbPalette,
  TbTruck,
  TbTools,
  TbBuildingBank as TbBank,
  TbWallet,
  TbPackages,
  TbUsers,
  TbTransfer,
  TbBook2,
  TbReportMoney,
} from "react-icons/tb";

import DashboardsIcon from "@/assets/dualicons/dashboards.svg?react";
import SettingIcon from "@/assets/dualicons/setting.svg?react";
// import { report } from "./segments/report";

export const navigationIcons: Record<string, ElementType> = {
  dashboards: DashboardsIcon,
  user: TbBriefcase,
  settings: SettingIcon,
  "dashboards.home": HomeIcon,
  "settings.general": HiUserIcon,
  "settings.appearance": TbPalette,
  master: FolderIcon,
  variant: CubeIcon,
  leadbuilder: ChartBarIcon,
  enquirysettings: TbCategory,
  item: ClipboardDocumentListIcon,
  accessories: WrenchScrewdriverIcon,
  purchase: ShoppingCartIcon,
  "purchase-tractor": TbTruck,
  "purchase-accessories": TbTools,
  report: ExclamationTriangleIcon,
  accounting: TbBuildingBank,
  cashbank:TbWallet,
  control:TbPackages,
  follow:TbUsers,
  stocktransfer: TbTransfer,
  ledgerreport: TbBook2,
  bookingbalance: TbReportMoney,
  
};
