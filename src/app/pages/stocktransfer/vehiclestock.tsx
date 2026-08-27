import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiHelper from "@/utils/apiHelper";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { RiFileExcel2Fill, RiFilePdfFill } from "react-icons/ri";
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Transition,
} from "@headlessui/react";
import { Fragment } from "react";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Button, Checkbox } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Combobox } from "@/components/shared/form/Combobox";
type VehicleStock = {
  id: number;
  transferNo: string;
  transferDate: string;

  branch: {
    id: number;
    branchName: string;
    mobileNo?: string;
  };

  manager: {
    id: number;
    accountName: string;
  };

  modelName: string;
  variantName: string;
  colour: string;
  chassisNo: string;
  engineNo: string;
  itemName: string;
  itemCode: string;

  vehicleSrNo?: string;
  mfgDate?: string;
  keyNo?: string;
  batteryNo?: string;
  batteryMake?: string;

  f1TyresNo?: string;
  f2TyresNo?: string;
  s1TyresNo?: string;
  s2TyresNo?: string;

  location?: string;

  grnNumber?: string;
  grnDate?: string;
  grnRecordDate?: string;

  contactNo?: string;
  branchManagerName?: string;
};

const entriesOptions = [
  { id: 10, name: "10" },
  { id: 20, name: "20" },
  { id: 30, name: "30" },
  { id: 40, name: "40" },
  { id: 50, name: "50" },
  { id: 100, name: "100" },
];

const branchOptions = [
  { label: "Mumbai", value: "Mumbai" },
  { label: "Delhi", value: "Delhi" },
  { label: "Bangalore", value: "Bangalore" },
  { label: "Chennai", value: "Chennai" },
  { label: "Pune", value: "Pune" },
];

const VehicleStock = () => {
  const navigate = useNavigate();
  const [vehicleStocks, setVehicleStocks] = useState<VehicleStock[]>([]);
  const [search, setSearch] = useState("");
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  

  const [selectedBranchFilter, setSelectedBranchFilter] = useState("All");
  const [selectedChassisFilter, setSelectedChassisFilter] = useState("All");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleStock | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);
const branchOptions = [
  { id: "All", name: "All Branches" },

  ...Array.from(
    new Map(
      vehicleStocks
        .filter((item: any) => item.branch?.branchName)
        .map((item: any) => [
          String(item.branch?.id ?? item.branch?.branchName),
          {
            id: String(item.branch?.id ?? item.branch?.branchName),
            name: String(item.branch?.branchName),
          },
        ]),
    ).values(),
  ),
];
  const getVehicleStocks = async () => {
    try {
      const response = await apiHelper.get("/vehicle-stock-transfer");

   

      setVehicleStocks(response.data);
    } catch (error) {
      console.log("API Error:", error);
    }
  };

  useEffect(() => {
    getVehicleStocks();
  }, []);

  const handleAdd = () => {
    navigate("/stocktransfer/vehiclestock/add");
  };

  const handleEdit = (item: VehicleStock) => {
    navigate(`/stocktransfer/vehiclestock/edit/${item.id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      if (
        window.confirm("Are you sure you want to delete this vehicle stock?")
      ) {
        await apiHelper.delete(`/vehicle-stocks/${id}`);
        getVehicleStocks();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      if (
        window.confirm(
          "Are you sure you want to delete selected vehicle stocks?",
        )
      ) {
        await Promise.all(
          selectedIds.map((id) => apiHelper.delete(`/vehicle-stocks/${id}`)),
        );
        setSelectedIds([]);
        getVehicleStocks();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleViewDetails = (item: VehicleStock) => {
    navigate(`/stocktransfer/vehiclestock/view/${item.id}`);
  };

  // const branchFilterOptions = [
  //   { id: "All", name: "All Branches" },
  //   ...branchOptions.map((b) => ({ id: b.value, name: b.label })),
  // ];

  const chassisFilterOptions = [
    { id: "All", name: "All Chassis" },
    ...vehicleStocks.map((v) => ({ id: v.chassisNo, name: v.chassisNo })),
  ];

  const searchText = search.trim().toLowerCase();

const filteredData = vehicleStocks.filter((item: any) => {
  const branchName =
    item.branch?.branchName ??
    item.branchName ??
    item.branch?.name ??
    "";

  const modelName =
    item.model?.modelName ??
    item.modelName ??
    "";

  const variantName =
    item.variant?.variantName ??
    item.variant?.name ??
    item.variantName ??
    "";

  const colourName =
    item.colour?.colourName ??
    item.colour?.name ??
    item.colourName ??
    "";

 const matchesSearch =
  !searchText ||
  String(item.transferNo ?? "")     // <-- FIX: yeh hi actual Stock ID field hai
    .toLowerCase()
    .includes(searchText) ||
  String(item.stockId ?? "")
    .toLowerCase()
    .includes(searchText) ||
  String(item.stockNo ?? "")
    .toLowerCase()
    .includes(searchText) ||
  String(item.chassisNo ?? "")
    .toLowerCase()
    .includes(searchText) ||
  String(modelName)
    .toLowerCase()
    .includes(searchText) ||
  String(variantName)
    .toLowerCase()
    .includes(searchText) ||
  String(colourName)
    .toLowerCase()
    .includes(searchText) ||
  String(branchName)
    .toLowerCase()
    .includes(searchText);

const matchesBranch =
  selectedBranchFilter === "All" ||
  String(item.branch?.id ?? item.branch?.branchName) ===
    String(selectedBranchFilter);
  const matchesChassis =
    selectedChassisFilter === "All" ||
    String(item.chassisNo ?? "") ===
      String(selectedChassisFilter);

  return (
    matchesSearch &&
    matchesBranch &&
    matchesChassis
  );
});

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const isAllPageSelected =
    currentItems.length > 0 &&
    currentItems.every((item) => selectedIds.includes(item.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageIds = currentItems.map((item) => item.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = currentItems.map((item) => item.id);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    );
  };

  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            Vehicle Stock List
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage all vehicle stocks from here
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 md:flex-nowrap">
          {/* Left side - Filter and icons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilterBar(!showFilterBar)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                showFilterBar
                  ? "bg-primary-50 border-primary-200 text-primary-600 dark:bg-dark-600 dark:border-dark-500 dark:text-white"
                  : "dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FunnelIcon className="size-4.5" />
              <span className="hidden sm:inline">Filter</span>
            </button>

            <button
              type="button"
              className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <RiFileExcel2Fill className="text-lg text-green-500" />
            </button>

            <button
              type="button"
              className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <RiFilePdfFill className="text-lg text-red-500" />
            </button>
          </div>

          {/* Right side - Add Vehicle Stock button */}
          <Button
            color="primary"
            onClick={handleAdd}
            className="whitespace-nowrap"
          >
            <PlusIcon className="mr-1.5 size-4.5" />
            Add Vehicle Stock
          </Button>
        </div>{" "}
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search stock ID, chassis, model..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="dark:border-dark-500 dark:bg-dark-800 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm outline-none"
        />
      </div>

      {/* Filter Bar */}
      {showFilterBar && (
        <div className="dark:bg-dark-700 dark:border-dark-500 animate-in fade-in slide-in-from-top-2 rounded-xl border border-gray-200 bg-white p-4 transition-all duration-150">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Branch
              </span>
             <Combobox
    data={branchOptions}
    value={
      branchOptions.find(
        (option: any) =>
          String(option.id) === String(selectedBranchFilter),
      ) || branchOptions[0]
    }
    onChange={(option: any) => {
      setSelectedBranchFilter(option?.id || "All");
      setCurrentPage(1);
    }}
    displayField="name"
    searchFields={["name"]}
    placeholder="Select Branch"
  />
            </div>
            <div className="flex flex-col gap-1">
              <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Chassis No
              </span>
              <Listbox
                data={chassisFilterOptions}
                value={
                  chassisFilterOptions.find(
                    (o) => o.id === selectedChassisFilter,
                  ) || chassisFilterOptions[0]
                }
                placeholder="All Chassis"
                onChange={(opt: any) => {
                  setSelectedChassisFilter(opt.id);
                  setCurrentPage(1);
                }}
                displayField="name"
              />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table
            hoverable
            className="w-full min-w-300 text-left [&_.table-th]:font-semibold"
          >
            <THead className="dark:bg-dark-700/60 dark:border-dark-600 border-b border-gray-200 bg-gray-100">
              <Tr>
                <Th className="w-12 py-3.5 text-center">
                  <Checkbox
                    className="size-4.5"
                    checked={isAllPageSelected}
                    onChange={(e: any) => handleSelectAll(e.target.checked)}
                  />
                </Th>
                <Th className="w-16 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  S.No
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Stock ID
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Date
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Branch
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Chassis No
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Model
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Variant
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Colour
                </Th>
                <Th className="w-20 py-3.5 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Actions
                </Th>
              </Tr>
            </THead>

            <TBody className="dark:divide-dark-700 divide-y divide-gray-200">
              {currentItems.map((item, index) => {
                const isRowSelected = selectedIds.includes(item.id);
                return (
                  <Tr
                    key={item.id}
                    className={`${
                      isRowSelected ? "dark:bg-dark-600/30 bg-gray-50/50" : ""
                    } dark:hover:bg-dark-700/40 transition-colors hover:bg-gray-50/30`}
                  >
                    <Td className="py-4 text-center">
                      <Checkbox
                        className="size-4.5"
                        checked={isRowSelected}
                        onChange={() => handleSelectRow(item.id)}
                      />
                    </Td>
                    <Td className="py-4 font-medium text-gray-500">
                      {indexOfFirstItem + index + 1}
                    </Td>
                    <Td className="py-4 font-mono text-sm font-medium text-gray-900 dark:text-gray-400">
                      {item.transferNo}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {new Date(item.transferDate).toLocaleDateString("en-IN")}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.branch?.branchName}
                    </Td>
                    <Td className="py-4 font-mono text-sm text-gray-600 dark:text-gray-400">
                      {item.chassisNo}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.modelName}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.variantName}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      <span
                        className="inline-flex h-4 w-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: item.colour.toLowerCase() }}
                      ></span>
                      <span className="ml-2">{item.colour}</span>
                    </Td>
                    <Td className="py-4 text-center">
                      <Menu
                        as="div"
                        className="relative inline-block text-left"
                      >
                        <MenuButton className="dark:hover:bg-dark-600 dark:text-dark-200 inline-flex size-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100">
                          <EllipsisHorizontalIcon className="size-5" />
                        </MenuButton>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <MenuItems
                            anchor="bottom end"
                            className="dark:bg-dark-800 dark:ring-dark-500 dark:border-dark-500 z-100 w-36 rounded-lg border border-gray-100 bg-white p-1 shadow-lg ring-1 ring-black/5 [--anchor-gap:4px] focus:outline-none"
                          >
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  type="button"
                                  onClick={() => handleViewDetails(item)}
                                  className={`${
                                    active
                                      ? "dark:bg-dark-600 text-primary-600 bg-gray-50 dark:text-white"
                                      : "dark:text-dark-200 text-gray-700"
                                  } flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium`}
                                >
                                  <PencilIcon className="size-4" />
                                  View Details
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  type="button"
                                  onClick={() => handleEdit(item)}
                                  className={`${
                                    active
                                      ? "dark:bg-dark-600 text-primary-600 bg-gray-50 dark:text-white"
                                      : "dark:text-dark-200 text-gray-700"
                                  } flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium`}
                                >
                                  <PencilIcon className="size-4" />
                                  Edit
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item.id)}
                                  className={`${
                                    active
                                      ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                                      : "dark:text-dark-200 text-gray-700"
                                  } flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium`}
                                >
                                  <TrashIcon className="size-4" />
                                  Delete
                                </button>
                              )}
                            </MenuItem>
                          </MenuItems>
                        </Transition>
                      </Menu>
                    </Td>
                  </Tr>
                );
              })}

              {currentItems.length === 0 && (
                <Tr>
                  <Td
                    colSpan={10}
                    className="py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    No vehicle stocks found
                  </Td>
                </Tr>
              )}
            </TBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="dark:border-dark-700 dark:bg-dark-800 flex flex-col gap-4 rounded-b-xl border-t border-gray-200 bg-white px-4 py-4 md:flex-row md:items-center">
            <div className="order-1 flex items-center justify-center gap-2 text-sm text-gray-600 md:w-1/3 md:justify-start dark:text-gray-400">
              <span>Show</span>
              <div className="w-20">
                <Menu
                  as="div"
                  className="relative inline-block w-full text-left"
                >
                  <MenuButton className="dark:border-dark-600 dark:bg-dark-700 flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none dark:text-gray-200">
                    <span>{itemsPerPage}</span>
                    <svg
                      className="ml-2 h-4 w-4 transform transition-transform"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </MenuButton>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <MenuItems
                      anchor="top start"
                      className="dark:bg-dark-700 dark:border-dark-600 z-200 w-20 space-y-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-xl ring-1 ring-black/5 [--anchor-gap:6px] focus:outline-none"
                    >
                      {entriesOptions.map((opt) => (
                        <MenuItem key={opt.id}>
                          {({ active }) => (
                            <button
                              type="button"
                              onClick={() => {
                                setItemsPerPage(opt.id);
                                setCurrentPage(1);
                              }}
                              className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm font-medium ${
                                opt.id === itemsPerPage
                                  ? "bg-primary-500 text-white"
                                  : active
                                    ? "dark:bg-dark-600 bg-gray-100 text-gray-900 dark:text-white"
                                    : "text-gray-700 dark:text-gray-200"
                              }`}
                            >
                              {opt.name}
                              {opt.id === itemsPerPage && (
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </button>
                          )}
                        </MenuItem>
                      ))}
                    </MenuItems>
                  </Transition>
                </Menu>
              </div>
              <span>entries</span>
            </div>

            <div className="order-2 flex justify-center md:w-1/3">
              <div className="dark:border-dark-700 dark:bg-dark-800 inline-flex items-center space-x-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="dark:hover:bg-dark-700 inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400"
                >
                  <ChevronLeftIcon className="size-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                        page === currentPage
                          ? "bg-primary-500 text-white"
                          : "dark:hover:bg-dark-700 text-gray-600 hover:bg-gray-100 dark:text-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="dark:hover:bg-dark-700 inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400"
                >
                  <ChevronRightIcon className="size-4" />
                </button>
              </div>
            </div>

            <div className="order-3 flex items-center justify-center text-sm text-gray-500 select-none md:w-1/3 md:justify-end dark:text-gray-400">
              <span>
                {totalItems === 0 ? 0 : indexOfFirstItem + 1} -{" "}
                {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Details View */}
      {showDetails && selectedVehicle && (
        <div className="dark:bg-dark-800 dark:border-dark-700 animate-in fade-in slide-in-from-bottom-4 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Vehicle Details - {selectedVehicle.transferNo}
            </h3>
            <button
              onClick={() => setShowDetails(false)}
              className="dark:hover:bg-dark-600 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <XMarkIcon className="size-5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <Table hoverable className="w-full text-left">
              <THead className="dark:bg-dark-700/60 dark:border-dark-600 border-b border-gray-200 bg-gray-100">
                <Tr>
                  <Th className="py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Field
                  </Th>
                  <Th className="py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Value
                  </Th>
                </Tr>
              </THead>
              <TBody className="dark:divide-dark-700 divide-y divide-gray-200">
                <Tr>
                  <Td className="py-3 font-medium">Stock Transfer No</Td>
                  <Td className="py-3">{selectedVehicle.transferNo}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Date</Td>
                  <Td className="py-3">
                    {new Date(selectedVehicle.transferDate).toLocaleDateString(
                      "en-IN",
                    )}
                  </Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Branch</Td>
                  <Td className="py-3">{selectedVehicle.branch?.branchName}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Branch Manager</Td>
                  <Td className="py-3">{selectedVehicle.branchManagerName}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Contact No</Td>
                  <Td className="py-3">{selectedVehicle.contactNo}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Chassis No</Td>
                  <Td className="py-3">{selectedVehicle.chassisNo}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Vehicle Sr. No</Td>
                  <Td className="py-3">{selectedVehicle.vehicleSrNo}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Model</Td>
                  <Td className="py-3">{selectedVehicle.modelName}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Variant</Td>
                  <Td className="py-3">{selectedVehicle.variantName}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Colour</Td>
                  <Td className="py-3">{selectedVehicle.colour}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Item Name</Td>
                  <Td className="py-3">{selectedVehicle.itemName}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Item Code</Td>
                  <Td className="py-3">{selectedVehicle.itemCode}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Engine No</Td>
                  <Td className="py-3">{selectedVehicle.engineNo}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">MFG Date</Td>
                  <Td className="py-3">{selectedVehicle.mfgDate}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Key No</Td>
                  <Td className="py-3">{selectedVehicle.keyNo}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Battery No</Td>
                  <Td className="py-3">{selectedVehicle.batteryNo}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Battery Make</Td>
                  <Td className="py-3">{selectedVehicle.batteryMake}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">F1 Tyres No</Td>
                  <Td className="py-3">{selectedVehicle.f1TyresNo}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">F2 Tyres No</Td>
                  <Td className="py-3">{selectedVehicle.f2TyresNo}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">S1 Tyres No</Td>
                  <Td className="py-3">{selectedVehicle.s1TyresNo}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">S2 Tyres No</Td>
                  <Td className="py-3">{selectedVehicle.s2TyresNo}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">Location</Td>
                  <Td className="py-3">{selectedVehicle.location}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">GRN Number</Td>
                  <Td className="py-3">{selectedVehicle.grnNumber}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">GRN Date</Td>
                  <Td className="py-3">{selectedVehicle.grnDate}</Td>
                </Tr>
                <Tr>
                  <Td className="py-3 font-medium">GRN Record Date</Td>
                  <Td className="py-3">{selectedVehicle.grnRecordDate}</Td>
                </Tr>
              </TBody>
            </Table>
          </div>
        </div>
      )}

      {/* Floating Action Bar */}
      {selectedIds.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 fixed right-6 bottom-6 z-50 w-full max-w-xs px-2 duration-200">
          <div className="dark:border-dark-500 dark:bg-dark-700/95 flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-xl backdrop-blur">
            <div className="dark:text-dark-200 text-sm font-medium text-gray-600">
              Selected{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {selectedIds.length}
              </span>{" "}
              items
            </div>
            <Button
              variant="filled"
              color="error"
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 shadow-sm"
            >
              <TrashIcon className="size-4" />
              <span className="text-xs font-semibold">Delete</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleStock;