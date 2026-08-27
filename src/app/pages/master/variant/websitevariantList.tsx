// WebsiteVariantList.tsx - Clean version with only table design
import { useEffect, useState } from "react";
import apiHelper from "@/utils/apiHelper";
import { useNavigate } from "react-router";
import {
  // Dialog,
  // DialogPanel,
  Transition,
  // TransitionChild,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/react";
import { Fragment } from "react";
import { RiFileExcel2Fill, RiFilePdfFill } from "react-icons/ri";
import {
  // XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  FunnelIcon,
  // DocumentArrowDownIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// Local UI Imports
import { Button, Checkbox } from "@/components/ui";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
// import { Listbox } from "@/components/shared/form/StyledListbox";
import { Combobox } from "@/components/shared/form/Combobox";
// Dummy data structure matching the table design
type WebsiteVariantType = {
  id: number;

  category?: {
    id: number;
    categoryName: string;
  };

  brand?: {
    id: number;
    brandName: string;
  };

  model?: {
    id: number;
    modelName: string;
  };

  modelYear?: {
    id: number;
    modelYear: number;
  };

  variant?: {
    id: number;
    variantName: string;
  };

  productName: string;
  variantCode: string;
  status: string;
  createdAt: string;
};
const entriesOptions = [
  { id: 10, name: "10" },
  { id: 20, name: "20" },
  { id: 30, name: "30" },
  { id: 50, name: "50" },
  { id: 100, name: "100" },
];

export default function WebsiteVariantList() {
  const navigate = useNavigate();
  // const [showDrawer, setShowDrawer] = useState(false);
  // const [editId, setEditId] = useState<number | null>(null);
  const [variants, setVariants] = useState<WebsiteVariantType[]>([]);
  const [loading, setLoading] = useState(false);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Search and filter states
  const [search, setSearch] = useState("");
  const [showFilterBar, setShowFilterBar] = useState(false);
  // const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("All");
  const [selectedModelFilter, setSelectedModelFilter] = useState("All");
  // const [selectedYearFilter, setSelectedYearFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
const [selectedYearFilter, setSelectedYearFilter] = useState("All");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmState, setConfirmState] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
type FilterOption = {
  id: string;
  name: string;
  categoryId?: string;
  brandId?: string;
  modelId?: string;
};

const [categories, setCategories] = useState<FilterOption[]>([]);
const [brands, setBrands] = useState<FilterOption[]>([]);
const [models, setModels] = useState<FilterOption[]>([]);
const [modelYears, setModelYears] = useState<FilterOption[]>([]);
const getCategories = async () => {
  try {
    const res = await apiHelper.get("/category");
    const data = res?.data || res;

    setCategories(
      (Array.isArray(data) ? data : []).map((item: any) => ({
        id: item.id,
        name: item.categoryName,
      }))
    );
  } catch {
    setCategories([]);
  }
};

const getBrands = async () => {
  try {
    const res = await apiHelper.get("/brand");
    const data = res?.data || res;

   setBrands(
  (Array.isArray(data) ? data : []).map((item: any) => ({
    id: String(item.id),
    name: item.brandName,
    categoryId: String(item.categoryId),
  }))
);
  } catch {
    setBrands([]);
  }
};

const getModels = async () => {
  try {
    const res = await apiHelper.get("/model");
    const data = res?.data || res;

   setModels(
  (Array.isArray(data) ? data : []).map((item: any) => ({
    id: String(item.id),
    name: item.modelName,
    brandId: String(item.brandId),
  }))
);
  } catch {
    setModels([]);
  }
};

const getModelYears = async () => {
  try {
    const res = await apiHelper.get("/model-year");
    const data = res?.data || res;

    setModelYears(
  (Array.isArray(data) ? data : []).map((item: any) => ({
    id: String(item.id),
    name: String(item.modelYear),
    modelId: String(item.modelId),
  }))
);
  } catch {
    setModelYears([]);
  }
};
useEffect(() => {
  getCategories();
  getBrands();
  getModels();
  getModelYears();
}, []);
  // Selection states
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const fetchVariants = async () => {
    try {
      setLoading(true);

      const res = await apiHelper.get("/website-variants");

      setVariants(res.data.data || res.data);
    } catch (error) {
      console.error("Error fetching website variants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariants();
  }, []);
 const categoryOptions = [
  { id: "All", name: "All Categories" },
  ...categories.map((c: any) => ({
    id: String(c.id),
    name: c.name,
  })),
];

const brandOptions = [
  { id: "All", name: "All Brands" },
  ...(selectedCategoryFilter === "All"
    ? []
    : brands
        .filter(b => b.categoryId === selectedCategoryFilter)
        .map(b => ({
          id: b.id,
          name: b.name,
        }))),
];

const modelOptions = [
  { id: "All", name: "All Models" },
  ...(selectedBrandFilter === "All"
    ? []
    : models
        .filter(m => m.brandId === selectedBrandFilter)
        .map(m => ({
          id: m.id,
          name: m.name,
        }))),
];
const yearFilterOptions = [
  { id: "All", name: "All Years" },
  ...(selectedModelFilter === "All"
    ? []
    : modelYears
        .filter(y => y.modelId === selectedModelFilter)
        .map(y => ({
          id: y.id,
          name: y.name,
        }))),
];

const statusFilterOptions = [
  { id: "All", name: "All" },
  { id: "ACTIVE", name: "ACTIVE" },
  { id: "INACTIVE", name: "INACTIVE" },
];
  // Filter logic
  const filteredData = variants.filter((item) => {
    const matchesSearch =
     item.category?.categoryName.toLowerCase().includes(search.toLowerCase()) ||
      item.productName?.toLowerCase().includes(search.toLowerCase()) ||
      item.variant?.variantName?.toLowerCase().includes(search.toLowerCase()) ||
      item.variantCode?.toLowerCase().includes(search.toLowerCase()) ||
      item.brand?.brandName?.toLowerCase().includes(search.toLowerCase()) ||
      item.model?.modelName?.toLowerCase().includes(search.toLowerCase()) ||
         item.modelYear?.modelYear.toString().includes(search.toLowerCase());
const matchesCategoryDropdown =
  selectedCategoryFilter === "All" ||
  String(item.category?.id) === selectedCategoryFilter;

const matchesBrandDropdown =
  selectedBrandFilter === "All" ||
  String(item.brand?.id) === selectedBrandFilter;

const matchesModelDropdown =
  selectedModelFilter === "All" ||
  String(item.model?.id) === selectedModelFilter;

const matchesYearDropdown =
  selectedYearFilter === "All" ||
  String(item.modelYear?.id) === selectedYearFilter;;

    const matchesStatusDropdown =
      selectedStatusFilter === "All" ||
      String(item.status) === selectedStatusFilter;

    return (
      matchesSearch &&
      matchesCategoryDropdown &&
      matchesBrandDropdown &&
      matchesModelDropdown &&
      matchesYearDropdown &&
      matchesStatusDropdown
    );
  });

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Selection handlers
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

  // CRUD handlers (dummy implementations)

  const handleEdit = (item: WebsiteVariantType) => {
    navigate(`/master/variant/website/create?id=${item.id}`);
  };

  const handleDelete = (id: number) => {
    setDeleteTargetId(id);
    setIsBulkDelete(false);
    setConfirmState("pending");
    setShowConfirmModal(true);
  };

  const handleBulkDelete = () => {
    setIsBulkDelete(true);
    setConfirmState("pending");
    setShowConfirmModal(true);
  };

  const performDelete = async () => {
    setConfirmLoading(true);
    try {
      if (isBulkDelete) {
        await apiHelper.post("/website-variants/bulk-delete", {
          ids: selectedIds,
        });
        toast.success(
          `${selectedIds.length} website variants deleted successfully!`,
        );
        await fetchVariants();
        setSelectedIds([]);
        setCurrentPage(1);
        setConfirmState("success");
      } else {
        if (deleteTargetId === null) return;
        await apiHelper.delete(`/website-variants/${deleteTargetId}`);
        toast.success("Website variant deleted successfully!");
        await fetchVariants();
        setSelectedIds((prev) => prev.filter((id) => id !== deleteTargetId));
        setDeleteTargetId(null);
        setConfirmState("success");
      }
      setTimeout(() => setShowConfirmModal(false), 1500);
    } catch (error: any) {
      console.error("Delete failed:", error);
      setConfirmState("error");
      toast.error(
        error.response?.data?.message || "Failed to delete. Please try again.",
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      setVariants((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
              }
            : item,
        ),
      );

      await apiHelper.patch(`/website-variants/${id}/toggle-status`);
    } catch (error) {
      console.error("Toggle failed:", error);

      fetchVariants(); // reload old data if API fails
    }
  };

  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* Upper Actions Control Toolbar Layout */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            Website Variant List
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage all website variants from here
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

          {/* Right side - Add Website Variant button */}
          <Button
            color="primary"
            onClick={() => navigate("/master/variant/website/create")}
            className="whitespace-nowrap"
          >
            Add Website Variant
          </Button>
        </div>{" "}
      </div>

      {/* Global Context Search Box */}
      <div className="relative w-full max-w-md">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search product, variant, model..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="dark:border-dark-500 dark:bg-dark-800 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm outline-none"
        />
      </div>

      {/* Five Dropdown Filters */}
      {showFilterBar && (
        <div className="dark:bg-dark-700 dark:border-dark-500 animate-in fade-in slide-in-from-top-2 rounded-xl border border-gray-200 bg-white p-4 transition-all duration-150">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <div className="flex flex-col gap-1">
              <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Category
              </span>
              <Combobox
                data={categoryOptions}
                value={
                  categoryOptions.find(
                    (opt) => opt.id === selectedCategoryFilter
                  ) || categoryOptions[0]
                }
              onChange={(opt: any) => {
  setSelectedCategoryFilter(opt.id);
  setSelectedBrandFilter("All");
  setSelectedModelFilter("All");
  setSelectedYearFilter("All");
  setCurrentPage(1);
}}
                displayField="name"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Brand
              </span>
              <Combobox
                data={brandOptions}
                value={
                  brandOptions.find(
                    (opt) => opt.id === selectedBrandFilter
                  ) || brandOptions[0]
                }
              onChange={(opt: any) => {
  setSelectedBrandFilter(opt.id);
  setSelectedModelFilter("All");
  setSelectedYearFilter("All");
  setCurrentPage(1);
}}
                displayField="name"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Model
              </span>
              <Combobox
                data={modelOptions}
                value={
                  modelOptions.find(
                    (opt) => opt.id === selectedModelFilter
                  ) || modelOptions[0]
                }
              onChange={(opt: any) => {
  setSelectedModelFilter(opt.id);
  setSelectedYearFilter("All");
  setCurrentPage(1);
}}
                displayField="name"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Year
              </span>
              <Combobox
                data={yearFilterOptions}
                value={
                  yearFilterOptions.find(
                    (opt) => opt.id === selectedYearFilter
                  ) || yearFilterOptions[0]
                }
                onChange={(opt: any) => {
                  setSelectedYearFilter(opt.id);
                  setCurrentPage(1);
                }}
                displayField="name"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Status
              </span>
              <Combobox
                data={statusFilterOptions}
                value={
                  statusFilterOptions.find(
                    (opt) => opt.id === selectedStatusFilter
                  ) || statusFilterOptions[0]
                }
                onChange={(opt: any) => {
                  setSelectedStatusFilter(opt.id);
                  setCurrentPage(1);
                }}
                displayField="name"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Table Layout Panel Container */}
      <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table
            hoverable
            className="w-full min-w-200 text-left [&_.table-th]:font-semibold"
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
                  Category
                </Th>

                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Brand
                </Th>

                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Model
                </Th>

                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Variant Name
                </Th>

                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Variant Code
                </Th>

                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Model Year
                </Th>

                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Product Name
                </Th>

                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Status
                </Th>

                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Created
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
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.category?.categoryName}
                    </Td>

                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.brand?.brandName}
                    </Td>

                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.model?.modelName}
                    </Td>

                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.variant?.variantName}
                    </Td>

                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.variantCode}
                    </Td>

                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.modelYear?.modelYear || "-"}
                    </Td>

                    <Td className="py-4 font-medium text-gray-900 dark:text-gray-400">
                      {item.productName}
                    </Td>
                    <Td className="py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item.id)}
                        className={`relative h-6 w-12 rounded-full transition-all ${
                          item.status === "ACTIVE"
                            ? "bg-primary-500"
                            : "dark:bg-dark-600 bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                            item.status === "ACTIVE" ? "left-6.5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </Td>
                    <Td className="py-4 text-gray-500 dark:text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString("en-IN")}
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
                                  onClick={() => handleEdit(item)}
                                  className={`${
                                    active
                                      ? "dark:bg-dark-600 text-primary-600 bg-gray-50 dark:text-white"
                                      : "dark:text-dark-200 text-gray-700"
                                  } flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium`}
                                >
                                  <PencilSquareIcon className="size-4" />
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
                    colSpan={9}
                    className="py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    No years found
                  </Td>
                </Tr>
              )}
            </TBody>
          </Table>
        </div>

        {/* Premium Three-Column Footer System */}
        {totalItems > 0 && (
          <div className="dark:border-dark-700 dark:bg-dark-800 flex flex-col gap-4 rounded-b-xl border-t border-gray-200 bg-white px-4 py-4 md:flex-row md:items-center">
            {/* Column 1: Row Limits Selection */}
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

            {/* Column 2: Page Navigation */}
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

            {/* Column 3: Stats Summary */}
            <div className="order-3 flex items-center justify-center text-sm text-gray-500 select-none md:w-1/3 md:justify-end dark:text-gray-400">
              <span>
                {totalItems === 0 ? 0 : indexOfFirstItem + 1} -{" "}
                {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Bar for Selected Checks */}
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
      {/* Confirmation Modal */}
      <ConfirmModal
        show={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setDeleteTargetId(null);
          setConfirmState("pending");
        }}
        onOk={performDelete}
        confirmLoading={confirmLoading}
        state={confirmState}
        messages={{
          pending: {
            Icon: ExclamationTriangleIcon,
            title: isBulkDelete
              ? "Delete Selected Website Variants?"
              : "Are you sure?",
            description: isBulkDelete
              ? `Are you sure you want to delete ${selectedIds.length} selected website variants? This action cannot be undone.`
              : "Are you sure you want to delete this website variant? Once deleted, it cannot be restored.",
            actionText: isBulkDelete ? "Delete All" : "Delete",
          },
          success: {
            title: "Deleted Successfully",
            description: isBulkDelete
              ? `${selectedIds.length} website variants have been deleted.`
              : "The website variant has been deleted.",
            actionText: "Done",
          },
          error: {
            title: "Delete Failed",
            description: "Failed to delete. Please try again.",
            actionText: "Try Again",
          },
        }}
      />
    </div>
  );
}
// WebsiteVariantList.tsx - Clean version with table design and New/Used toggles
// import { useEffect, useState } from "react";
// import apiHelper from "@/utils/apiHelper";
// import { useNavigate } from "react-router";
// import {
//   Dialog,
//   DialogPanel,
//   Transition,
//   TransitionChild,
//   Menu,
//   MenuButton,
//   MenuItems,
//   MenuItem,
// } from "@headlessui/react";
// import { Fragment } from "react";
// import { RiFileExcel2Fill, RiFilePdfFill } from "react-icons/ri";
// import {
//   XMarkIcon,
//   PencilSquareIcon,
//   TrashIcon,
//   FunnelIcon,
//   DocumentArrowDownIcon,
//   EllipsisHorizontalIcon,
//   MagnifyingGlassIcon,
//   ChevronLeftIcon,
//   ChevronRightIcon,
// } from "@heroicons/react/24/outline";
// import { toast } from "sonner";
// import { ConfirmModal } from "@/components/shared/ConfirmModal";
// import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// // Local UI Imports
// import { Button, Checkbox, Input } from "@/components/ui";
// import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
// import { Listbox } from "@/components/shared/form/StyledListbox";
// import { Combobox } from "@/components/shared/form/Combobox";

// // Dummy data structure matching the table design
// type WebsiteVariantType = {
//   id: number;
//   category?: {
//     id: number;
//     categoryName: string;
//   };
//   brand?: {
//     id: number;
//     brandName: string;
//   };
//   model?: {
//     id: number;
//     modelName: string;
//   };
//   modelYear?: {
//     id: number;
//     modelYear: number;
//   };
//   variant?: {
//     id: number;
//     variantName: string;
//   };
//   productName: string;
//   variantCode: string;
//   status: string;
//   createdAt: string;
//   variantType?: "NEW" | "USED"; // Add this field for variant type
// };

// const entriesOptions = [
//   { id: 10, name: "10" },
//   { id: 20, name: "20" },
//   { id: 30, name: "30" },
//   { id: 50, name: "50" },
//   { id: 100, name: "100" },
// ];

// export default function WebsiteVariantList() {
//   const navigate = useNavigate();
//   const [showDrawer, setShowDrawer] = useState(false);
//   const [editId, setEditId] = useState<number | null>(null);
//   const [variants, setVariants] = useState<WebsiteVariantType[]>([]);
//   const [loading, setLoading] = useState(false);
  
//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);

//   // Search and filter states
//   const [search, setSearch] = useState("");
//   const [showFilterBar, setShowFilterBar] = useState(false);
//   const [selectedBrandFilter, setSelectedBrandFilter] = useState("All");
//   const [selectedModelFilter, setSelectedModelFilter] = useState("All");
//   const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
//   const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
//   const [selectedYearFilter, setSelectedYearFilter] = useState("All");
  
//   // NEW: Variant Type filter states
//   const [selectedVariantType, setSelectedVariantType] = useState<"ALL" | "NEW" | "USED">("ALL");

//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [confirmState, setConfirmState] = useState<
//     "pending" | "success" | "error"
//   >("pending");
//   const [confirmLoading, setConfirmLoading] = useState(false);
//   const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
//   const [isBulkDelete, setIsBulkDelete] = useState(false);

//   type FilterOption = {
//     id: string;
//     name: string;
//   };

//   const [categories, setCategories] = useState<FilterOption[]>([]);
//   const [brands, setBrands] = useState<FilterOption[]>([]);
//   const [models, setModels] = useState<FilterOption[]>([]);
//   const [modelYears, setModelYears] = useState<FilterOption[]>([]);

//   const getCategories = async () => {
//     try {
//       const res = await apiHelper.get("/category");
//       const data = res?.data || res;
//       setCategories(
//         (Array.isArray(data) ? data : []).map((item: any) => ({
//           id: item.id,
//           name: item.categoryName,
//         }))
//       );
//     } catch {
//       setCategories([]);
//     }
//   };

//   const getBrands = async () => {
//     try {
//       const res = await apiHelper.get("/brand");
//       const data = res?.data || res;
//       setBrands(
//         (Array.isArray(data) ? data : []).map((item: any) => ({
//           id: item.id,
//           name: item.brandName,
//         }))
//       );
//     } catch {
//       setBrands([]);
//     }
//   };

//   const getModels = async () => {
//     try {
//       const res = await apiHelper.get("/model");
//       const data = res?.data || res;
//       setModels(
//         (Array.isArray(data) ? data : []).map((item: any) => ({
//           id: item.id,
//           name: item.modelName,
//         }))
//       );
//     } catch {
//       setModels([]);
//     }
//   };

//   const getModelYears = async () => {
//     try {
//       const res = await apiHelper.get("/model-year");
//       const data = res?.data || res;
//       setModelYears(
//         (Array.isArray(data) ? data : []).map((item: any) => ({
//           id: item.id,
//           name: item.modelYear,
//         }))
//       );
//     } catch {
//       setModelYears([]);
//     }
//   };

//   useEffect(() => {
//     getCategories();
//     getBrands();
//     getModels();
//     getModelYears();
//   }, []);

//   // Selection states
//   const [selectedIds, setSelectedIds] = useState<number[]>([]);

//   const fetchVariants = async () => {
//     try {
//       setLoading(true);
//       const res = await apiHelper.get("/website-variants");
//       setVariants(res.data.data || res.data);
//     } catch (error) {
//       console.error("Error fetching website variants:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchVariants();
//   }, []);

//   const categoryOptions = [
//     { id: "All", name: "All Categories" },
//     ...categories.map((c: any) => ({
//       id: String(c.id),
//       name: c.name,
//     })),
//   ];

//   const brandOptions = [
//     { id: "All", name: "All Brands" },
//     ...brands.map((b: any) => ({
//       id: String(b.id),
//       name: b.name,
//     })),
//   ];

//   const modelOptions = [
//     { id: "All", name: "All Models" },
//     ...models.map((m: any) => ({
//       id: String(m.id),
//       name: m.name,
//     })),
//   ];

//   const yearFilterOptions = [
//     { id: "All", name: "All Years" },
//     ...modelYears.map((y: any) => ({
//       id: String(y.id),
//       name: String(y.name),
//     })),
//   ];

//   const statusFilterOptions = [
//     { id: "All", name: "All" },
//     { id: "ACTIVE", name: "ACTIVE" },
//     { id: "INACTIVE", name: "INACTIVE" },
//   ];

//   // Filter logic
//   const filteredData = variants.filter((item) => {
//     const matchesSearch =
//       item.productName?.toLowerCase().includes(search.toLowerCase()) ||
//       item.variant?.variantName?.toLowerCase().includes(search.toLowerCase()) ||
//       item.variantCode?.toLowerCase().includes(search.toLowerCase()) ||
//       item.brand?.brandName?.toLowerCase().includes(search.toLowerCase()) ||
//       item.model?.modelName?.toLowerCase().includes(search.toLowerCase());

//     const matchesCategoryDropdown =
//       selectedCategoryFilter === "All" ||
//       String(item.category?.id) === selectedCategoryFilter;

//     const matchesBrandDropdown =
//       selectedBrandFilter === "All" ||
//       String(item.brand?.id) === selectedBrandFilter;

//     const matchesModelDropdown =
//       selectedModelFilter === "All" ||
//       String(item.model?.id) === selectedModelFilter;

//     const matchesYearDropdown =
//       selectedYearFilter === "All" ||
//       String(item.modelYear?.id) === selectedYearFilter;

//     const matchesStatusDropdown =
//       selectedStatusFilter === "All" ||
//       String(item.status) === selectedStatusFilter;

//     // NEW: Filter by variant type
//     const matchesVariantType =
//       selectedVariantType === "ALL" || item.variantType === selectedVariantType;

//     return (
//       matchesSearch &&
//       matchesCategoryDropdown &&
//       matchesBrandDropdown &&
//       matchesModelDropdown &&
//       matchesYearDropdown &&
//       matchesStatusDropdown &&
//       matchesVariantType
//     );
//   });

//   // Pagination calculations
//   const totalItems = filteredData.length;
//   const totalPages = Math.ceil(totalItems / itemsPerPage);
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

//   // Selection handlers
//   const isAllPageSelected =
//     currentItems.length > 0 &&
//     currentItems.every((item) => selectedIds.includes(item.id));

//   const handleSelectAll = (checked: boolean) => {
//     if (checked) {
//       const pageIds = currentItems.map((item) => item.id);
//       setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
//     } else {
//       const pageIds = currentItems.map((item) => item.id);
//       setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
//     }
//   };

//   const handleSelectRow = (id: number) => {
//     setSelectedIds((prev) =>
//       prev.includes(id)
//         ? prev.filter((selectedId) => selectedId !== id)
//         : [...prev, id],
//     );
//   };

//   // CRUD handlers
//   const handleEdit = (item: WebsiteVariantType) => {
//     navigate(`/master/variant/website/create?id=${item.id}`);
//   };

//   const handleDelete = (id: number) => {
//     setDeleteTargetId(id);
//     setIsBulkDelete(false);
//     setConfirmState("pending");
//     setShowConfirmModal(true);
//   };

//   const handleBulkDelete = () => {
//     setIsBulkDelete(true);
//     setConfirmState("pending");
//     setShowConfirmModal(true);
//   };

//   const performDelete = async () => {
//     setConfirmLoading(true);
//     try {
//       if (isBulkDelete) {
//         await apiHelper.post("/website-variants/bulk-delete", {
//           ids: selectedIds,
//         });
//         toast.success(
//           `${selectedIds.length} website variants deleted successfully!`,
//         );
//         await fetchVariants();
//         setSelectedIds([]);
//         setCurrentPage(1);
//         setConfirmState("success");
//       } else {
//         if (deleteTargetId === null) return;
//         await apiHelper.delete(`/website-variants/${deleteTargetId}`);
//         toast.success("Website variant deleted successfully!");
//         await fetchVariants();
//         setSelectedIds((prev) => prev.filter((id) => id !== deleteTargetId));
//         setDeleteTargetId(null);
//         setConfirmState("success");
//       }
//       setTimeout(() => setShowConfirmModal(false), 1500);
//     } catch (error: any) {
//       console.error("Delete failed:", error);
//       setConfirmState("error");
//       toast.error(
//         error.response?.data?.message || "Failed to delete. Please try again.",
//       );
//     } finally {
//       setConfirmLoading(false);
//     }
//   };

//   const handleToggleStatus = async (id: number) => {
//     try {
//       setVariants((prev) =>
//         prev.map((item) =>
//           item.id === id
//             ? {
//                 ...item,
//                 status: item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
//               }
//             : item,
//         ),
//       );
//       await apiHelper.patch(`/website-variants/${id}/toggle-status`);
//     } catch (error) {
//       console.error("Toggle failed:", error);
//       fetchVariants();
//     }
//   };

//   // NEW: Handler for variant type toggle
//   const handleVariantTypeToggle = (type: "NEW" | "USED") => {
//     setSelectedVariantType((prev) => (prev === type ? "ALL" : type));
//   };

//   return (
//     <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
//       {/* Upper Actions Control Toolbar Layout */}
//       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//         <div>
//           <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
//             Website Variant List
//           </h1>
//           <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
//             Manage all website variants from here
//           </p>
//         </div>
//         <div className="flex flex-wrap items-center justify-between gap-2 md:flex-nowrap">
//           {/* Left side - Filter and icons */}
//           <div className="flex items-center gap-2">
//             <button
//               type="button"
//               onClick={() => setShowFilterBar(!showFilterBar)}
//               className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
//                 showFilterBar
//                   ? "bg-primary-50 border-primary-200 text-primary-600 dark:bg-dark-600 dark:border-dark-500 dark:text-white"
//                   : "dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
//               }`}
//             >
//               <FunnelIcon className="size-4.5" />
//               <span className="hidden sm:inline">Filter</span>
//             </button>

//             <button
//               type="button"
//               className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
//             >
//               <RiFileExcel2Fill className="text-lg text-green-500" />
//             </button>

//             <button
//               type="button"
//               className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
//             >
//               <RiFilePdfFill className="text-lg text-red-500" />
//             </button>
//           </div>

//           {/* Right side - Add Website Variant button */}
//           <Button
//             color="primary"
//             onClick={() => navigate("/master/variant/website/create")}
//             className="whitespace-nowrap"
//           >
//             Add Website Variant
//           </Button>
//         </div>
//       </div>

//       {/* Search and Variant Type Toggle Section */}
//       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//         {/* Search Box */}
//         <div className="relative w-full max-w-md">
//           <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search product, variant, model..."
//             value={search}
//             onChange={(e) => {
//               setSearch(e.target.value);
//               setCurrentPage(1);
//             }}
//             className="dark:border-dark-500 dark:bg-dark-800 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm outline-none"
//           />
//         </div>

//         {/* NEW: Variant Type Toggle Buttons */}
//         <div className="flex items-center gap-2">
//           <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
//             Variant Type:
//           </span>
//           <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 dark:border-dark-600 dark:bg-dark-800">
//             <button
//               type="button"
//               onClick={() => handleVariantTypeToggle("NEW")}
//               className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
//                 selectedVariantType === "NEW"
//                   ? "bg-primary-500 text-white shadow-sm"
//                   : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-dark-700"
//               }`}
//             >
//               New
//             </button>
//             <button
//               type="button"
//               onClick={() => handleVariantTypeToggle("USED")}
//               className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
//                 selectedVariantType === "USED"
//                   ? "bg-primary-500 text-white shadow-sm"
//                   : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-dark-700"
//               }`}
//             >
//               Used
//             </button>
//             {selectedVariantType !== "ALL" && (
//               <button
//                 type="button"
//                 onClick={() => setSelectedVariantType("ALL")}
//                 className="rounded-md px-2 py-1.5 text-sm font-medium text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
//               >
//                 <XMarkIcon className="size-4" />
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Five Dropdown Filters */}
//       {showFilterBar && (
//         <div className="dark:bg-dark-700 dark:border-dark-500 animate-in fade-in slide-in-from-top-2 rounded-xl border border-gray-200 bg-white p-4 transition-all duration-150">
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
//             <div className="flex flex-col gap-1">
//               <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
//                 Category
//               </span>
//               <Combobox
//                 data={categoryOptions}
//                 value={
//                   categoryOptions.find(
//                     (opt) => opt.id === selectedCategoryFilter
//                   ) || categoryOptions[0]
//                 }
//                 onChange={(opt: any) => {
//                   setSelectedCategoryFilter(opt.id);
//                   setCurrentPage(1);
//                 }}
//                 displayField="name"
//               />
//             </div>

//             <div className="flex flex-col gap-1">
//               <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
//                 Brand
//               </span>
//               <Combobox
//                 data={brandOptions}
//                 value={
//                   brandOptions.find(
//                     (opt) => opt.id === selectedBrandFilter
//                   ) || brandOptions[0]
//                 }
//                 onChange={(opt: any) => {
//                   setSelectedBrandFilter(opt.id);
//                   setCurrentPage(1);
//                 }}
//                 displayField="name"
//               />
//             </div>

//             <div className="flex flex-col gap-1">
//               <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
//                 Model
//               </span>
//               <Combobox
//                 data={modelOptions}
//                 value={
//                   modelOptions.find(
//                     (opt) => opt.id === selectedModelFilter
//                   ) || modelOptions[0]
//                 }
//                 onChange={(opt: any) => {
//                   setSelectedModelFilter(opt.id);
//                   setCurrentPage(1);
//                 }}
//                 displayField="name"
//               />
//             </div>

//             <div className="flex flex-col gap-1">
//               <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
//                 Year
//               </span>
//               <Combobox
//                 data={yearFilterOptions}
//                 value={
//                   yearFilterOptions.find(
//                     (opt) => opt.id === selectedYearFilter
//                   ) || yearFilterOptions[0]
//                 }
//                 onChange={(opt: any) => {
//                   setSelectedYearFilter(opt.id);
//                   setCurrentPage(1);
//                 }}
//                 displayField="name"
//               />
//             </div>

//             <div className="flex flex-col gap-1">
//               <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
//                 Status
//               </span>
//               <Combobox
//                 data={statusFilterOptions}
//                 value={
//                   statusFilterOptions.find(
//                     (opt) => opt.id === selectedStatusFilter
//                   ) || statusFilterOptions[0]
//                 }
//                 onChange={(opt: any) => {
//                   setSelectedStatusFilter(opt.id);
//                   setCurrentPage(1);
//                 }}
//                 displayField="name"
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Main Table Layout Panel Container */}
//       <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white shadow-sm">
//         <div className="overflow-x-auto">
//           <Table
//             hoverable
//             className="w-full min-w-200 text-left [&_.table-th]:font-semibold"
//           >
//             <THead className="dark:bg-dark-700/60 dark:border-dark-600 border-b border-gray-200 bg-gray-100">
//               <Tr>
//                 <Th className="w-12 py-3.5 text-center">
//                   <Checkbox
//                     className="size-4.5"
//                     checked={isAllPageSelected}
//                     onChange={(e: any) => handleSelectAll(e.target.checked)}
//                   />
//                 </Th>
//                 <Th className="w-16 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
//                   S.No
//                 </Th>
//                 <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
//                   Category
//                 </Th>
//                 <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
//                   Brand
//                 </Th>
//                 <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
//                   Model
//                 </Th>
//                 <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
//                   Variant Name
//                 </Th>
//                 <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
//                   Variant Code
//                 </Th>
//                 <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
//                   Model Year
//                 </Th>
//                 <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
//                   Product Name
//                 </Th>
//                 <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
//                   Type
//                 </Th>
//                 <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
//                   Status
//                 </Th>
//                 <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
//                   Created
//                 </Th>
//                 <Th className="w-20 py-3.5 text-center text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
//                   Actions
//                 </Th>
//               </Tr>
//             </THead>

//             <TBody className="dark:divide-dark-700 divide-y divide-gray-200">
//               {currentItems.map((item, index) => {
//                 const isRowSelected = selectedIds.includes(item.id);
//                 return (
//                   <Tr
//                     key={item.id}
//                     className={`${
//                       isRowSelected ? "dark:bg-dark-600/30 bg-gray-50/50" : ""
//                     } dark:hover:bg-dark-700/40 transition-colors hover:bg-gray-50/30`}
//                   >
//                     <Td className="py-4 text-center">
//                       <Checkbox
//                         className="size-4.5"
//                         checked={isRowSelected}
//                         onChange={() => handleSelectRow(item.id)}
//                       />
//                     </Td>
//                     <Td className="py-4 font-medium text-gray-500">
//                       {indexOfFirstItem + index + 1}
//                     </Td>
//                     <Td className="dark:text-dark-200 py-4 text-gray-600">
//                       {item.category?.categoryName}
//                     </Td>
//                     <Td className="dark:text-dark-200 py-4 text-gray-600">
//                       {item.brand?.brandName}
//                     </Td>
//                     <Td className="dark:text-dark-200 py-4 text-gray-600">
//                       {item.model?.modelName}
//                     </Td>
//                     <Td className="dark:text-dark-200 py-4 text-gray-600">
//                       {item.variant?.variantName}
//                     </Td>
//                     <Td className="dark:text-dark-200 py-4 text-gray-600">
//                       {item.variantCode}
//                     </Td>
//                     <Td className="dark:text-dark-200 py-4 text-gray-600">
//                       {item.modelYear?.modelYear || "-"}
//                     </Td>
//                     <Td className="py-4 font-medium text-gray-900 dark:text-gray-400">
//                       {item.productName}
//                     </Td>
//                     {/* NEW: Variant Type column with styled badges */}
//                     <Td className="py-4">
//                       <span
//                         className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
//                           item.variantType === "NEW"
//                             ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
//                             : item.variantType === "USED"
//                             ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
//                             : "bg-gray-100 text-gray-500 dark:bg-dark-600 dark:text-gray-400"
//                         }`}
//                       >
//                         {item.variantType || "-"}
//                       </span>
//                     </Td>
//                     <Td className="py-4">
//                       <button
//                         type="button"
//                         onClick={() => handleToggleStatus(item.id)}
//                         className={`relative h-6 w-12 rounded-full transition-all ${
//                           item.status === "ACTIVE"
//                             ? "bg-primary-500"
//                             : "dark:bg-dark-600 bg-gray-300"
//                         }`}
//                       >
//                         <span
//                           className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
//                             item.status === "ACTIVE" ? "left-6.5" : "left-0.5"
//                           }`}
//                         />
//                       </button>
//                     </Td>
//                     <Td className="py-4 text-gray-500 dark:text-gray-400">
//                       {new Date(item.createdAt).toLocaleDateString("en-IN")}
//                     </Td>
//                     <Td className="py-4 text-center">
//                       <Menu
//                         as="div"
//                         className="relative inline-block text-left"
//                       >
//                         <MenuButton className="dark:hover:bg-dark-600 dark:text-dark-200 inline-flex size-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100">
//                           <EllipsisHorizontalIcon className="size-5" />
//                         </MenuButton>
//                         <Transition
//                           as={Fragment}
//                           enter="transition ease-out duration-100"
//                           enterFrom="transform opacity-0 scale-95"
//                           enterTo="transform opacity-100 scale-100"
//                           leave="transition ease-in duration-75"
//                           leaveFrom="transform opacity-100 scale-100"
//                           leaveTo="transform opacity-0 scale-95"
//                         >
//                           <MenuItems
//                             anchor="bottom end"
//                             className="dark:bg-dark-800 dark:ring-dark-500 dark:border-dark-500 z-100 w-36 rounded-lg border border-gray-100 bg-white p-1 shadow-lg ring-1 ring-black/5 [--anchor-gap:4px] focus:outline-none"
//                           >
//                             <MenuItem>
//                               {({ active }) => (
//                                 <button
//                                   type="button"
//                                   onClick={() => handleEdit(item)}
//                                   className={`${
//                                     active
//                                       ? "dark:bg-dark-600 text-primary-600 bg-gray-50 dark:text-white"
//                                       : "dark:text-dark-200 text-gray-700"
//                                   } flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium`}
//                                 >
//                                   <PencilSquareIcon className="size-4" />
//                                   Edit
//                                 </button>
//                               )}
//                             </MenuItem>
//                             <MenuItem>
//                               {({ active }) => (
//                                 <button
//                                   type="button"
//                                   onClick={() => handleDelete(item.id)}
//                                   className={`${
//                                     active
//                                       ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
//                                       : "dark:text-dark-200 text-gray-700"
//                                   } flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium`}
//                                 >
//                                   <TrashIcon className="size-4" />
//                                   Delete
//                                 </button>
//                               )}
//                             </MenuItem>
//                           </MenuItems>
//                         </Transition>
//                       </Menu>
//                     </Td>
//                   </Tr>
//                 );
//               })}

//               {currentItems.length === 0 && (
//                 <Tr>
//                   <Td
//                     colSpan={13}
//                     className="py-12 text-center text-gray-400 dark:text-gray-500"
//                   >
//                     No variants found
//                   </Td>
//                 </Tr>
//               )}
//             </TBody>
//           </Table>
//         </div>

//         {/* Premium Three-Column Footer System */}
//         {totalItems > 0 && (
//           <div className="dark:border-dark-700 dark:bg-dark-800 flex flex-col gap-4 rounded-b-xl border-t border-gray-200 bg-white px-4 py-4 md:flex-row md:items-center">
//             {/* Column 1: Row Limits Selection */}
//             <div className="order-1 flex items-center justify-center gap-2 text-sm text-gray-600 md:w-1/3 md:justify-start dark:text-gray-400">
//               <span>Show</span>
//               <div className="w-20">
//                 <Menu
//                   as="div"
//                   className="relative inline-block w-full text-left"
//                 >
//                   <MenuButton className="dark:border-dark-600 dark:bg-dark-700 flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none dark:text-gray-200">
//                     <span>{itemsPerPage}</span>
//                     <svg
//                       className="ml-2 h-4 w-4 transform transition-transform"
//                       viewBox="0 0 20 20"
//                       fill="currentColor"
//                     >
//                       <path
//                         fillRule="evenodd"
//                         d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                   </MenuButton>
//                   <Transition
//                     as={Fragment}
//                     enter="transition ease-out duration-100"
//                     enterFrom="transform opacity-0 scale-95"
//                     enterTo="transform opacity-100 scale-100"
//                     leave="transition ease-in duration-75"
//                     leaveFrom="transform opacity-100 scale-100"
//                     leaveTo="transform opacity-0 scale-95"
//                   >
//                     <MenuItems
//                       anchor="top start"
//                       className="dark:bg-dark-700 dark:border-dark-600 z-200 w-20 space-y-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-xl ring-1 ring-black/5 [--anchor-gap:6px] focus:outline-none"
//                     >
//                       {entriesOptions.map((opt) => (
//                         <MenuItem key={opt.id}>
//                           {({ active }) => (
//                             <button
//                               type="button"
//                               onClick={() => {
//                                 setItemsPerPage(opt.id);
//                                 setCurrentPage(1);
//                               }}
//                               className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm font-medium ${
//                                 opt.id === itemsPerPage
//                                   ? "bg-primary-500 text-white"
//                                   : active
//                                     ? "dark:bg-dark-600 bg-gray-100 text-gray-900 dark:text-white"
//                                     : "text-gray-700 dark:text-gray-200"
//                               }`}
//                             >
//                               {opt.name}
//                               {opt.id === itemsPerPage && (
//                                 <svg
//                                   className="h-4 w-4"
//                                   fill="none"
//                                   viewBox="0 0 24 24"
//                                   stroke="currentColor"
//                                   strokeWidth={3}
//                                 >
//                                   <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     d="M5 13l4 4L19 7"
//                                   />
//                                 </svg>
//                               )}
//                             </button>
//                           )}
//                         </MenuItem>
//                       ))}
//                     </MenuItems>
//                   </Transition>
//                 </Menu>
//               </div>
//               <span>entries</span>
//             </div>

//             {/* Column 2: Page Navigation */}
//             <div className="order-2 flex justify-center md:w-1/3">
//               <div className="dark:border-dark-700 dark:bg-dark-800 inline-flex items-center space-x-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
//                 <button
//                   type="button"
//                   onClick={() =>
//                     setCurrentPage((prev) => Math.max(prev - 1, 1))
//                   }
//                   disabled={currentPage === 1}
//                   className="dark:hover:bg-dark-700 inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400"
//                 >
//                   <ChevronLeftIcon className="size-4" />
//                 </button>

//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(
//                   (page) => (
//                     <button
//                       key={page}
//                       type="button"
//                       onClick={() => setCurrentPage(page)}
//                       className={`inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${
//                         page === currentPage
//                           ? "bg-primary-500 text-white"
//                           : "dark:hover:bg-dark-700 text-gray-600 hover:bg-gray-100 dark:text-gray-300"
//                       }`}
//                     >
//                       {page}
//                     </button>
//                   ),
//                 )}

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//                   }
//                   disabled={currentPage === totalPages}
//                   className="dark:hover:bg-dark-700 inline-flex size-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-400"
//                 >
//                   <ChevronRightIcon className="size-4" />
//                 </button>
//               </div>
//             </div>

//             {/* Column 3: Stats Summary */}
//             <div className="order-3 flex items-center justify-center text-sm text-gray-500 select-none md:w-1/3 md:justify-end dark:text-gray-400">
//               <span>
//                 {totalItems === 0 ? 0 : indexOfFirstItem + 1} -{" "}
//                 {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
//               </span>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Floating Action Bar for Selected Checks */}
//       {selectedIds.length > 0 && (
//         <div className="animate-in fade-in slide-in-from-bottom-4 fixed right-6 bottom-6 z-50 w-full max-w-xs px-2 duration-200">
//           <div className="dark:border-dark-500 dark:bg-dark-700/95 flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-xl backdrop-blur">
//             <div className="dark:text-dark-200 text-sm font-medium text-gray-600">
//               Selected{" "}
//               <span className="font-semibold text-gray-900 dark:text-white">
//                 {selectedIds.length}
//               </span>{" "}
//               items
//             </div>
//             <Button
//               variant="filled"
//               color="error"
//               onClick={handleBulkDelete}
//               className="flex items-center gap-1.5 px-3 py-1.5 shadow-sm"
//             >
//               <TrashIcon className="size-4" />
//               <span className="text-xs font-semibold">Delete</span>
//             </Button>
//           </div>
//         </div>
//       )}

//       {/* Confirmation Modal */}
//       <ConfirmModal
//         show={showConfirmModal}
//         onClose={() => {
//           setShowConfirmModal(false);
//           setDeleteTargetId(null);
//           setConfirmState("pending");
//         }}
//         onOk={performDelete}
//         confirmLoading={confirmLoading}
//         state={confirmState}
//         messages={{
//           pending: {
//             Icon: ExclamationTriangleIcon,
//             title: isBulkDelete
//               ? "Delete Selected Website Variants?"
//               : "Are you sure?",
//             description: isBulkDelete
//               ? `Are you sure you want to delete ${selectedIds.length} selected website variants? This action cannot be undone.`
//               : "Are you sure you want to delete this website variant? Once deleted, it cannot be restored.",
//             actionText: isBulkDelete ? "Delete All" : "Delete",
//           },
//           success: {
//             title: "Deleted Successfully",
//             description: isBulkDelete
//               ? `${selectedIds.length} website variants have been deleted.`
//               : "The website variant has been deleted.",
//             actionText: "Done",
//           },
//           error: {
//             title: "Delete Failed",
//             description: "Failed to delete. Please try again.",
//             actionText: "Try Again",
//           },
//         }}
//       />
//     </div>
//   );
// }