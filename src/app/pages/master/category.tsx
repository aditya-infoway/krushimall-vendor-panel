// Import Dependencies
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  FunnelIcon,
  // DocumentArrowDownIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Row, Table as TanstackTable } from "@tanstack/react-table";
import apiHelper from "@/utils/apiHelper";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { RiFileExcel2Fill, RiFilePdfFill } from "react-icons/ri";
import { Combobox } from "@/components/shared/form/Combobox";
// Local Imports
import { Button, Checkbox, Input } from "@/components/ui";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Listbox } from "@/components/shared/form/StyledListbox";

type Category = {
  id: number;
  categoryName: string;
  name?: string;
  status: string; // ✅ Changed from boolean to string (or keep as boolean if backend converts)
  createdAt: string;
  image: string;
};

type FormValues = {
  name: string;
  status: string; // Changed to string
  image: string;
};

const statusOptions = [
  { id: "ACTIVE", name: "On" },
  { id: "INACTIVE", name: "Off" },
];

const entriesOptions = [
  { id: 10, name: "10" },
  { id: 20, name: "20" },
  { id: 30, name: "30" },
  { id: 40, name: "40" },
  { id: 50, name: "50" },
  { id: 100, name: "100" },
];

export function SelectHeader({ table }: { table: TanstackTable<any> }) {
  return (
    <div className="flex items-center justify-center">
      <Checkbox
        className="size-4.5"
        color="error"
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    </div>
  );
}

export function SelectCell({ row }: { row: Row<any> }) {
  return (
    <div className="flex items-center justify-center">
      <Checkbox
        className="size-4.5"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        indeterminate={row.getIsSomeSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    </div>
  );
}

export default function Category() {
  const [showDrawer, setShowDrawer] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("All");
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<string>("All");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showFilterBar, setShowFilterBar] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmState, setConfirmState] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      setLoading(true);
      const response = await apiHelper.get("/vendor-web/category");
     

      let categoriesData = [];

      if (response && response.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (Array.isArray(response)) {
        categoriesData = response;
      }

      // Map to ensure 'name' field exists and format date
      const mappedData = categoriesData.map((item: any) => ({
        ...item,
        name: item.categoryName || item.name || "Unknown",
        id: item.id || item._id,
        image: apiHelper.getImageUrl(item.image),
        createdAt: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "",
      }));

      setCategories(mappedData);
    } catch (error) {
      console.error(error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      status: "ACTIVE",
      image: "",
    },
  });

  const formStatusValue = useWatch({ control, name: "status" });
  const formImageValue: string = useWatch({
    control,
    name: "image",
  });

  const formOption = {
    name: { required: "Category name is required" },
  };

  // ✅ Fix
  const categoryFilterOptions = [
    { id: "All", name: "All" },
    ...Array.from(new Set(categories.map((c) => c.categoryName || c.name))).map(
      (n) => ({ id: n, name: n }),
    ),
  ];

  const statusFilterOptions = [
    { id: "All", name: "All" },
    { id: "ACTIVE", name: "On" },
    { id: "INACTIVE", name: "Off" },
  ];

  const handleOpenAddDrawer = () => {
    setEditId(null);
    reset({
      name: "",
      status: "ACTIVE",
      image: "", //
    });
    setShowDrawer(true);
  };

  const handleOpenEditDrawer = (item: Category) => {
    setEditId(item.id);
    reset({
      name: item.categoryName || item.name, // Use categoryName from API
      status: item.status === "ACTIVE" ? "ACTIVE" : "INACTIVE", // Keep as string
      image: item.image || "",
    });
    setShowDrawer(true);
  };

  // Replace handleDelete
  const handleDelete = (id: number) => {
    setDeleteTargetId(id);
    setIsBulkDelete(false);
    setConfirmState("pending");
    setShowConfirmModal(true);
  };

  // Replace handleBulkDelete
  const handleBulkDelete = () => {
    setIsBulkDelete(true);
    setConfirmState("pending");
    setShowConfirmModal(true);
  };

  // Add this new function to perform the actual delete
  const performDelete = async () => {
    setConfirmLoading(true);
    try {
      if (isBulkDelete) {
        await Promise.all(
          selectedIds.map((id) => apiHelper.delete(`/vendor-web/category/${id}`)),
        );
        toast.success(`${selectedIds.length} categories deleted successfully!`);
        await getCategories();
        setSelectedIds([]);
        setCurrentPage(1);
        setConfirmState("success");
      } else {
        if (deleteTargetId === null) return;
        await apiHelper.delete(`/vendor-web/category/${deleteTargetId}`);
        toast.success("Category deleted successfully!");
        await getCategories();
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

  const handleToggleTableStatus = async (id: number) => {
    const category = categories.find((item) => item.id === id);
    if (!category) return;

    try {
      const newStatus = category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      await apiHelper.put(`/vendor-web/category/${id}`, {
        categoryName: category.categoryName || category.name,
        status: newStatus, // ✅ Send the toggled status
      });

      await getCategories();
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onFormSubmit = async (data: FormValues) => {
    try {
      const formData = new FormData();
      formData.append("categoryName", data.name);
      formData.append("status", data.status);

      // Log FormData contents
     
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      // Handle image upload
      if (data.image && data.image.startsWith("data:")) {
        const response = await fetch(data.image);
        const blob = await response.blob();
        const file = new File([blob], "category-image.jpg", {
          type: blob.type,
        });

        formData.append("image", file);
      }

     
      if (editId !== null) {
        await apiHelper.put(`/vendor-web/category/${editId}`, formData);
        toast.success("Category updated successfully!");
      } else {
        await apiHelper.post("/vendor-web/category", formData);
        toast.success("Category created successfully!");
      }

      await getCategories();
      setShowDrawer(false);
      reset();
    } catch (error: any) {
      console.error("Failed to save category:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to save category. Please try again.",
      );
    }
  };

  const filteredData = categories.filter((item) => {
    const itemName = item.categoryName || item.name || "";
    const matchesSearch = itemName.toLowerCase().includes(search.toLowerCase());
    const matchesCategoryDropdown =
      selectedCategoryFilter === "All" || itemName === selectedCategoryFilter;
    const matchesStatus =
      selectedStatusFilter === "All" || item.status === selectedStatusFilter;
    return matchesSearch && matchesCategoryDropdown && matchesStatus;
  });

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredData, currentPage, totalPages]);

  const isAllPageSelected =
    currentItems.length > 0 &&
    currentItems.every((item) => selectedIds.includes(item.id));
  const isSomePageSelected =
    currentItems.some((item) => selectedIds.includes(item.id)) &&
    !isAllPageSelected;

  const generatedTableInstance = {
    getIsAllRowsSelected: () => isAllPageSelected,
    getIsSomeRowsSelected: () => isSomePageSelected,
    getToggleAllRowsSelectedHandler: () => (e: any) => {
      if (isAllPageSelected || !e.target.checked) {
        const pageIds = currentItems.map((item) => item.id);
        setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
      } else {
        const pageIds = currentItems.map((item) => item.id);
        setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
      }
    },
  } as unknown as TanstackTable<Category>;

  const getGeneratedRowInstance = (id: number) =>
    ({
      getIsSelected: () => selectedIds.includes(id),
      getCanSelect: () => true,
      getIsSomeSelected: () => false,
      getToggleSelectedHandler: () => () => {
        setSelectedIds((prev) =>
          prev.includes(id)
            ? prev.filter((selectedId) => selectedId !== id)
            : [...prev, id],
        );
      },
    }) as unknown as Row<Category>;

  return (
    <div className="relative min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* Top Header Actions Layout Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            Category List
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage all categories from here
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
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

          <Button
            color="primary"
            onClick={handleOpenAddDrawer}
            className="ml-auto whitespace-nowrap"
          >
            Add Category
          </Button>
        </div>
      </div>
      {/* Global Filter Search Input field */}
      <div className="relative w-full max-w-md">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search category..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="dark:border-dark-500 dark:bg-dark-800 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm outline-none"
        />
      </div>

      {/* Grid Filter Sub-toolbar Dropdowns */}
      {showFilterBar && (
        <div className="dark:bg-dark-700 dark:border-dark-500 animate-in fade-in slide-in-from-top-2 rounded-xl border border-gray-200 bg-white p-4 transition-all duration-150">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Category Name
              </span>
              <Combobox
                data={categoryFilterOptions}
                value={
                  categoryFilterOptions.find(
                    (o) => o.id === selectedCategoryFilter,
                  ) || categoryFilterOptions[0]
                }
                placeholder="All"
                displayField="name"
                searchFields={["name"]}
                onChange={(opt: any) => {
                  setSelectedCategoryFilter(opt.id);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Status
              </span>
              <Listbox
                data={statusFilterOptions}
                value={
                  statusFilterOptions.find(
                    (o) => o.id === selectedStatusFilter,
                  ) || statusFilterOptions[0]
                }
                placeholder="All"
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

      {/* Data Table Section Container */}
      <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table
            hoverable
            className="w-full min-w-[600px] text-left [&_.table-th]:font-semibold"
          >
            <THead className="dark:bg-dark-700/60 dark:border-dark-600 border-b border-gray-200 bg-gray-100">
              <Tr>
                <Th className="w-12 py-3.5 text-center">
                  <SelectHeader table={generatedTableInstance} />
                </Th>
                <Th className="w-16 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  S.No
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Image
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Category Name
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
                    className={`${isRowSelected ? "dark:bg-dark-600/30 bg-gray-50/50" : ""} dark:hover:bg-dark-700/40 transition-colors hover:bg-gray-50/30`}
                  >
                    <Td className="py-4 text-center">
                      <SelectCell row={getGeneratedRowInstance(item.id)} />
                    </Td>
                    <Td className="py-4 font-medium text-gray-500">
                      {indexOfFirstItem + index + 1}
                    </Td>
                    <Td className="py-4">
                      <div className="dark:border-dark-500 flex h-15 w-15 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <span className="text-xs font-bold text-gray-400 uppercase">
                            {(item.name || "NA").substring(0, 2)}
                          </span>
                        )}
                      </div>
                    </Td>
                    <Td className="py-4 font-medium text-gray-900 dark:text-white">
                      {item.categoryName || item.name || "N/A"}
                    </Td>

                    <Td className="py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleTableStatus(item.id)}
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
                      {item.createdAt}
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
                            className="dark:bg-dark-800 dark:ring-dark-500 dark:border-dark-500 z-[100] w-36 rounded-lg border border-gray-100 bg-white p-1 shadow-lg ring-1 ring-black/5 [--anchor-gap:4px] focus:outline-none"
                          >
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditDrawer(item)}
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
                    colSpan={7}
                    className="py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    No categories found
                  </Td>
                </Tr>
              )}
            </TBody>
          </Table>
        </div>

        {/* --- FULLY RESPONSIVE 3-COLUMN SEPARATED FOOTER ALIGNMENT --- */}
        {totalItems > 0 && (
          <div className="dark:border-dark-700 dark:bg-dark-800 flex flex-col gap-4 rounded-b-xl border-t border-gray-200 bg-white px-4 py-4 md:flex-row md:items-center">
            {/* Column 1: Entries Selector (Left-aligned on desktop, Centered on mobile) */}
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
                      className="dark:bg-dark-700 dark:border-dark-600 z-[200] w-20 space-y-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-xl ring-1 ring-black/5 [--anchor-gap:6px] focus:outline-none"
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

            {/* Column 2: Page List Controls (Centered on all viewports) */}
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

            {/* Column 3: Stats Summary Label (Right-aligned on desktop, Centered on mobile) */}
            <div className="order-3 flex items-center justify-center text-sm text-gray-500 select-none md:w-1/3 md:justify-end dark:text-gray-400">
              <span>
                {totalItems === 0 ? 0 : indexOfFirstItem + 1} -{" "}
                {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bulk Actions Panel Component */}
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

      {/* Drawer Component */}
      <Transition appear show={showDrawer} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[100]"
          onClose={() => setShowDrawer(false)}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/40" />
          </TransitionChild>

          <TransitionChild
            as={Fragment}
            enter="ease-out transform-gpu transition-transform duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in transform-gpu transition-transform duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="dark:bg-dark-700 fixed top-0 right-0 flex h-full w-full max-w-md transform-gpu flex-col bg-white shadow-2xl transition-transform duration-200">
              <form
                onSubmit={handleSubmit(onFormSubmit)}
                className="flex h-full flex-col"
              >
                <div className="dark:border-dark-500 flex items-center justify-between border-b border-gray-200 px-5 py-4">
                  <h2 className="dark:text-dark-50 text-lg font-semibold text-gray-800">
                    {editId !== null ? "Edit Category" : "Add Category"}
                  </h2>
                  <Button
                    onClick={() => setShowDrawer(false)}
                    variant="flat"
                    isIcon
                    className="size-8 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    type="button"
                  >
                    <XMarkIcon className="size-5" />
                  </Button>
                </div>

                <div className="grow space-y-5 overflow-y-auto p-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Category Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter category name"
                      {...register("name", formOption.name)}
                      error={errors?.name && errors.name.message}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Category Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="dark:file:bg-dark-800 dark:file:text-dark-200 block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
                    />
                    {formImageValue ? (
                      <div>
                        <img
                          src={formImageValue}
                          alt="Preview"
                          className="dark:border-dark-500 mt-3 h-20 w-20 rounded-xl border border-gray-200 object-contain"
                        />
                        {editId && (
                          <p className="mt-1 text-xs text-gray-400">
                            Current image (upload new to replace)
                          </p>
                        )}
                      </div>
                    ) : (
                      editId && (
                        <p className="mt-1 text-xs text-gray-400">
                          No image uploaded
                        </p>
                      )
                    )}
                  </div>

                  <div>
                    <span className="mb-2 block text-sm font-medium">
                      Status
                    </span>
                    <Listbox
                      data={statusOptions}
                      value={
                        statusOptions.find(
                          (opt) => opt.id === formStatusValue,
                        ) || statusOptions[0]
                      }
                      placeholder="Select Status"
                      onChange={(selectedOpt: any) =>
                        setValue("status", selectedOpt.id)
                      }
                      displayField="name"
                    />
                  </div>
                </div>

                <div className="dark:border-dark-500 flex items-center justify-end gap-3 border-t border-gray-200 p-5">
                  <Button
                    variant="outlined"
                    color="neutral"
                    type="button"
                    onClick={() => setShowDrawer(false)}
                    className="h-10 w-1/2"
                  >
                    Cancel
                  </Button>
                  <Button color="primary" type="submit" className="h-10 w-1/2">
                    Save
                  </Button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>

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
              ? "Delete Selected Categories?"
              : "Are you sure?",
            description: isBulkDelete
              ? `Are you sure you want to delete ${selectedIds.length} selected categories? This action cannot be undone.`
              : "Are you sure you want to delete this category? Once deleted, it cannot be restored.",
            actionText: isBulkDelete ? "Delete All" : "Delete",
          },
          success: {
            title: "Deleted Successfully",
            description: isBulkDelete
              ? `${selectedIds.length} categories have been deleted.`
              : "The category has been deleted.",
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
