import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/react";
import { Fragment } from "react";
import { RiFileExcel2Fill, RiFilePdfFill } from "react-icons/ri";
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
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Button, Checkbox, Input } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Listbox } from "@/components/shared/form/StyledListbox";
import apiHelper from "@/utils/apiHelper";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Colour {
  id: number;

  modelId: number;
  variantId: number;
  showroomVariantId?: number;
  model?: {
    modelName: string;
  };

  variant?: {
    variantName: string;
  };
  showroomVariant?: {
    id: number;
    variantName: string;
  };
  colourName: string;
  colourCode: string;
  status: "ACTIVE" | "INACTIVE";

  createdAt: string;
}

interface FormValues {
  model: string;
  modelId: number | string;
  variant: string;
  variantId: number | string;
  showroomVariantId: number | string;
  colourName: string;
  colourCode: string;
  status: "ACTIVE" | "INACTIVE";
}

interface OptionType {
  id: number;
  name: string;
  modelId?: number;
}

// ─── Helper Functions ──────────────────────────────────────────────────────
const formatDate = (dateString: string) => {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) return dateString;

    // Format as: 15 Jan 2025
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

// ─── Options ──────────────────────────────────────────────────────────────
const entriesOptions = [
  { id: 10, name: "10" },
  { id: 20, name: "20" },
  { id: 30, name: "30" },
  { id: 40, name: "40" },
  { id: 50, name: "50" },
  { id: 100, name: "100" },
];

const statusOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

const statusFilterOptions = [
  { id: "All", name: "All Statuses" },
  { id: "ACTIVE", name: "Active" },
  { id: "INACTIVE", name: "Inactive" },
];

// ─── Main Component ──────────────────────────────────────────────────────
const Colour = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [colours, setColours] = useState<Colour[]>([]);
  const [search, setSearch] = useState("");
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);
const [selectedModelFilter, setSelectedModelFilter] = useState("All");
const [selectedVariantFilter, setSelectedVariantFilter] = useState("All");
const [selectedShowroomVariantFilter, setSelectedShowroomVariantFilter] =
  useState("All");
const [selectedColourFilter, setSelectedColourFilter] = useState("All");
  // ─── Dynamic Data from API ─────────────────────────────────────────────
  const [models, setModels] = useState<OptionType[]>([]);
  const [variants, setVariants] = useState<OptionType[]>([]);
  const [filteredVariants, setFilteredVariants] = useState<OptionType[]>([]);
  const [showroomVariants, setShowroomVariants] = useState<OptionType[]>([]);
  const [filteredShowroomVariants, setFilteredShowroomVariants] = useState<
    OptionType[]
  >([]);
const [filteredVariantFilterOptions, setFilteredVariantFilterOptions] =
  useState<OptionType[]>([]);

const [
  filteredShowroomVariantFilterOptions,
  setFilteredShowroomVariantFilterOptions,
] = useState<OptionType[]>([]);
const [filteredColourFilterOptions, setFilteredColourFilterOptions] =
  useState<{ id: string; name: string }[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
const [confirmState, setConfirmState] = useState<"pending" | "success" | "error">("pending");
const [confirmLoading, setConfirmLoading] = useState(false);
const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
const [isBulkDelete, setIsBulkDelete] = useState(false);
  // ─── Form State ─────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<FormValues>({
    model: "",
    modelId: "",
    variant: "",
    variantId: "",
    showroomVariantId: "",
    colourName: "",
    colourCode: "#000000",
    status: "ACTIVE",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Color Picker State ──────────────────────────────────────────────────
  const [colorPickerState, setColorPickerState] = useState<{
    isOpen: boolean;
    id: number | null;
    color: string;
    position: { x: number; y: number };
  }>({
    isOpen: false,
    id: null,
    color: "#000000",
    position: { x: 0, y: 0 },
  });

  // ─── Fetch Models ──────────────────────────────────────────────────────
 const modelFilterOptions = [
  { id: "All", name: "All Models" },
  ...models.map((m) => ({
    id: String(m.id),
    name: m.name,
  })),
];

const variantFilterOptions = [
  { id: "All", name: "All Variants" },
  ...variants.map((v) => ({
    id: String(v.id),
    name: v.name,
  })),
];

const showroomVariantFilterOptions = [
  { id: "All", name: "All Showroom Variants" },
  ...showroomVariants.map((v) => ({
    id: String(v.id),
    name: v.name,
  })),
];

const colourFilterOptions = [
  { id: "All", name: "All Colours" },
  ...Array.from(
    new Map(
      colours.map((c) => [
        c.colourName,
        {
          id: c.colourName,
          name: c.colourName,
        },
      ])
    ).values()
  ),
];

  const getShowroomVariants = async () => {
    try {
      const res = await apiHelper.get("/showroom-variant");

      const data = res.data || [];

      setShowroomVariants(
        data.map((item: any) => ({
          id: item.id,
          name: item.variantName,
          modelId: item.modelId,
        })),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const getModels = async () => {
    try {
      setLoading(true);
      const response = await apiHelper.get("/model");
      let modelsData = response?.data || response;
      if (!Array.isArray(modelsData)) modelsData = [];

      const mappedModels = modelsData.map((item: any) => ({
        id: item.id || item._id,
        name: item.modelName || item.name || "Unknown",
      }));
      setModels(mappedModels);
    } catch (error) {
      console.error("Failed to fetch models:", error);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  const getVariants = async () => {
    try {
      const response = await apiHelper.get("/variant");
      let variantsData = response?.data || response;
      if (!Array.isArray(variantsData)) variantsData = [];

      const mappedVariants = variantsData.map((item: any) => ({
        id: item.id || item._id,
        name: item.variantName || item.name || "Unknown",
        modelId: item.modelId || item.model?.id || null,
      }));
      setVariants(mappedVariants);
      setFilteredVariants(mappedVariants);
    } catch (error) {
      console.error("Failed to fetch variants:", error);
      setVariants([]);
      setFilteredVariants([]);
    }
  };
  const getColours = async () => {
    try {
      setLoading(true);

      const response = await apiHelper.get("/colours");

      // FIX
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      setColours(data);
    } catch (error) {
      console.error("Failed to fetch colours:", error);
    } finally {
      setLoading(false);
    }
  };
   useEffect(() => {
    getModels();
    getVariants();
    getColours();
    getShowroomVariants();
  }, []);
  useEffect(() => {
    if (formData.modelId) {
      setFilteredShowroomVariants(
        showroomVariants.filter(
          (item) => item.modelId === Number(formData.modelId),
        ),
      );
    } else {
      setFilteredShowroomVariants([]);
    }
  }, [formData.modelId, showroomVariants]);
  // ─── Filter Variants by Model ─────────────────────────────────────────
  useEffect(() => {
    if (formData.modelId) {
      const filtered = variants.filter(
        (v) => v.modelId === Number(formData.modelId),
      );
      setFilteredVariants(filtered);
    } else {
      setFilteredVariants(variants);
    }
  }, [formData.modelId, variants]);

  // ─── Color Picker Effects ──────────────────────────────────────────────
  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerState.isOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest(".color-picker-popover")) {
          closeColorPicker();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [colorPickerState.isOpen]);

  // Close color picker on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && colorPickerState.isOpen) {
        closeColorPicker();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [colorPickerState.isOpen]);

  // ─── Handlers ───────────────────────────────────────────────────────────
  const handleInputChange = (field: keyof FormValues, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleOpenAddDrawer = () => {
    setEditId(null);
    setFormData({
      model: "",
      modelId: "",
      variant: "",
      variantId: "",
      showroomVariantId: "",
      colourName: "",
      colourCode: "#000000",
      status: "ACTIVE",
    });
    setErrors({});
    setShowDrawer(true);
  };

  const handleOpenEditDrawer = (item: Colour) => {
    setEditId(item.id);

    setFormData({
      model: item.model?.modelName || "",
      modelId: item.modelId || "",

      variant: item.variant?.variantName || "",
      variantId: item.variantId || "",
      showroomVariantId: item.showroomVariantId || "",
      colourName: item.colourName,
      colourCode: item.colourCode,
      status: item.status,
    });

    setShowDrawer(true);
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
      await Promise.all(selectedIds.map((id) => apiHelper.delete(`/colours/${id}`)));
      toast.success(`${selectedIds.length} colours deleted successfully!`);
      await getColours();
      setSelectedIds([]);
      setCurrentPage(1);
      setConfirmState("success");
    } else {
      if (deleteTargetId === null) return;
      await apiHelper.delete(`/colours/${deleteTargetId}`);
      toast.success("Colour deleted successfully!");
      await getColours();
      setDeleteTargetId(null);
      setConfirmState("success");
    }
    setTimeout(() => setShowConfirmModal(false), 1500);
  } catch (error: any) {
    console.error("Delete failed:", error);
    setConfirmState("error");
    toast.error(error.response?.data?.message || "Failed to delete. Please try again.");
  } finally {
    setConfirmLoading(false);
  }
};

  const handleToggleStatus = async (id: number) => {
    const colour = colours.find((item) => item.id === id);
    if (!colour) return;

    const newStatus = colour.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    // Optimistic update for instant feedback
    setColours((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item,
      ),
    );

    try {
      await apiHelper.put(`/colours/${id}`, { status: newStatus });
    } catch (error) {
      console.error("Failed to toggle status:", error);
      // Revert on failure
      await getColours();
    }
  };

  // ─── Handle Colour Picker Click (Direct Edit) ──────────────────────────
  const handleOpenColorPicker = (
    id: number,
    currentColor: string,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

    // Calculate position to ensure it stays within viewport
    let x = rect.left;
    let y = rect.bottom + 8;

    // If it would go off the right side, align to the right
    if (x + 220 > window.innerWidth) {
      x = rect.right - 200;
    }

    // If it would go off the bottom, show above instead
    if (y + 250 > window.innerHeight) {
      y = rect.top - 250;
    }

    setColorPickerState({
      isOpen: true,
      id: id,
      color: currentColor,
      position: { x, y },
    });
  };

  const handleColorChange = (newColor: string) => {
    if (colorPickerState.id !== null) {
      setColours(
        colours.map((item) =>
          item.id === colorPickerState.id
            ? { ...item, colourCode: newColor }
            : item,
        ),
      );
      setColorPickerState((prev) => ({ ...prev, color: newColor }));
    }
  };

  const closeColorPicker = async () => {
    const { id, color } = colorPickerState;

    if (id !== null) {
      try {
        await apiHelper.put(`/colours/${id}`, { colourCode: color });
      } catch (error) {
        console.error("Failed to update colour:", error);
        await getColours();
      }
    }

    setColorPickerState((prev) => ({ ...prev, isOpen: false }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.modelId) newErrors.model = "Model is required";

    // Either Variant OR Showroom Variant required
    if (!formData.variantId && !formData.showroomVariantId) {
      newErrors.variant = "Select Variant or Showroom Variant";
    }

    if (!formData.colourName.trim())
      newErrors.colourName = "Colour Name is required";

    if (!formData.colourCode) newErrors.colourCode = "Colour Code is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const handleSave = async () => {
  if (!validate()) return;

  try {
    const payload = {
      modelId: Number(formData.modelId),
      variantId: Number(formData.variantId),
      showroomVariantId: Number(formData.showroomVariantId),
      colourName: formData.colourName,
      colourCode: formData.colourCode,
      status: formData.status,
    };

    if (editId) {
      await apiHelper.put(`/colours/${editId}`, payload);
      toast.success("Colour updated successfully!");
    } else {
      await apiHelper.post("/colours", payload);
      toast.success("Colour created successfully!");
    }

    await getColours();
    setShowDrawer(false);
  } catch (error: any) {
    console.error("Save failed:", error);
    toast.error(error.response?.data?.message || "Failed to save colour. Please try again.");
  }
};

  // ─── Filter Data ────────────────────────────────────────────────────────
const filteredData = colours.filter((item) => {
  const searchText = search.toLowerCase();

  const matchesSearch =
    item.colourName.toLowerCase().includes(searchText) ||
    item.model?.modelName?.toLowerCase().includes(searchText) ||
    item.variant?.variantName?.toLowerCase().includes(searchText) ||
    item.showroomVariant?.variantName?.toLowerCase().includes(searchText);

  const matchesModel =
    selectedModelFilter === "All" ||
    String(item.modelId) === selectedModelFilter;

  const matchesVariant =
    selectedVariantFilter === "All" ||
    String(item.variantId) === selectedVariantFilter;

  const matchesShowroomVariant =
    selectedShowroomVariantFilter === "All" ||
    String(item.showroomVariantId) ===
      selectedShowroomVariantFilter;

  const matchesColour =
    selectedColourFilter === "All" ||
    item.colourName === selectedColourFilter;

  const matchesStatus =
    selectedStatusFilter === "All" ||
    item.status === selectedStatusFilter;

  return (
    matchesSearch &&
    matchesModel &&
    matchesVariant &&
    matchesShowroomVariant &&
    matchesColour &&
    matchesStatus
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
            Colour List
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage all colours from here
          </p>
        </div>

       <div className="flex flex-wrap items-center justify-between gap-2 md:flex-nowrap">
  {/* Left side - Filter and icon */}
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

  {/* Right side - Add Colour button */}
  <Button
    color="primary"
    onClick={handleOpenAddDrawer}
    className="whitespace-nowrap"
  >
    <PlusIcon className="mr-1.5 size-4.5" />
    Add Colour
  </Button>
</div>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search colour, model or variant..."
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
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

  {/* Model */}
  <div className="flex flex-col gap-1">
    <span className="text-sm font-medium">Model</span>
    <Combobox
      data={modelFilterOptions}
      displayField="name"
      value={
        modelFilterOptions.find(
          (o) => o.id === selectedModelFilter
        ) || modelFilterOptions[0]
      }
      placeholder="All Models"
      searchFields={["name"]}
     onChange={(opt: any) => {
  const modelId = opt?.id || "All";

  setSelectedModelFilter(modelId);
  setSelectedVariantFilter("All");
  setSelectedShowroomVariantFilter("All");
  setCurrentPage(1);

  if (modelId === "All") {
    setFilteredVariantFilterOptions(variants);
    setFilteredShowroomVariantFilterOptions(showroomVariants);
    return;
  }

  setFilteredVariantFilterOptions(
    variants.filter(v => String(v.modelId) === String(modelId))
  );

  setFilteredShowroomVariantFilterOptions(
    showroomVariants.filter(v => String(v.modelId) === String(modelId))
  );
}}
    />
  </div>
 <div className="flex flex-col gap-1">
    <span className="text-sm font-medium">Variant</span>
    <Combobox
     data={[
  { id: "All", name: "All Variants" },
  ...filteredVariantFilterOptions.map(v => ({
    id: String(v.id),
    name: v.name,
  })),
]}
      displayField="name"
      value={
        variantFilterOptions.find(
          (o) => o.id === selectedVariantFilter
        ) || variantFilterOptions[0]
      }
      placeholder="All Variants"
      searchFields={["name"]}
     onChange={(opt:any)=>{
    setSelectedVariantFilter(opt.id);
    setSelectedShowroomVariantFilter("All");
    setSelectedColourFilter("All");

    if(opt.id==="All"){
        return;
    }

    const colourList = colours
        .filter(c=>String(c.variantId)===String(opt.id))
        .map(c=>({
            id:c.colourName,
            name:c.colourName
        }));

    setFilteredColourFilterOptions(
        Array.from(new Map(colourList.map(c=>[c.id,c])).values())
    );
}}
    />
  </div>
  {/* Showroom Variant */}
  <div className="flex flex-col gap-1">
    <span className="text-sm font-medium">Showroom Variant</span>
    <Combobox
   data={[
  { id: "All", name: "All Showroom Variants" },
  ...filteredShowroomVariantFilterOptions.map(v => ({
    id: String(v.id),
    name: v.name,
  })),
]}
      displayField="name"
      value={
        showroomVariantFilterOptions.find(
          (o) => o.id === selectedShowroomVariantFilter
        ) || showroomVariantFilterOptions[0]
      }
      placeholder="All Showroom Variants"
      searchFields={["name"]}
    onChange={(opt:any)=>{
    setSelectedShowroomVariantFilter(opt.id);
    setSelectedVariantFilter("All");
    setSelectedColourFilter("All");

    if(opt.id==="All"){
        return;
    }

    const colourList = colours
        .filter(c=>String(c.showroomVariantId)===String(opt.id))
        .map(c=>({
            id:c.colourName,
            name:c.colourName
        }));

    setFilteredColourFilterOptions(
        Array.from(new Map(colourList.map(c=>[c.id,c])).values())
    );
}}
    />
  </div>

  {/* Variant */}
 

  {/* Colour */}
  <div className="flex flex-col gap-1">
    <span className="text-sm font-medium">Colour</span>
    <Combobox
      data={[
    { id:"All", name:"All Colours" },
    ...filteredColourFilterOptions
]}
      displayField="name"
      value={
        colourFilterOptions.find(
          (o) => o.id === selectedColourFilter
        ) || colourFilterOptions[0]
      }
      placeholder="All Colours"
      searchFields={["name"]}
      onChange={(opt: any) => {
        setSelectedColourFilter(opt?.id || "All");
        setCurrentPage(1);
      }}
    />
  </div>

  {/* Status */}
  <div className="flex flex-col gap-1">
    <span className="text-sm font-medium">Status</span>
    <Listbox
      data={statusFilterOptions}
      displayField="name"
      value={
        statusFilterOptions.find(
          (o) => o.id === selectedStatusFilter
        ) || statusFilterOptions[0]
      }
      placeholder="All Statuses"
      onChange={(opt: any) => {
        setSelectedStatusFilter(opt.id);
        setCurrentPage(1);
      }}
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
            className="w-full min-w-[900px] text-left [&_.table-th]:font-semibold"
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
                  Model
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Showroom Variant
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Variant
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Colour Name
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Colour
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Status
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Created Date
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
                    <Td className="py-4 font-medium text-gray-900 dark:text-gray-400">
                      {item.model?.modelName}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.showroomVariant?.variantName || "-"}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.variant?.variantName || "-"}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.colourName}
                    </Td>
                    <Td className="py-4">
                      <button
                        type="button"
                        onClick={(e) =>
                          handleOpenColorPicker(item.id, item.colourCode, e)
                        }
                        className="relative h-10 w-10 cursor-pointer rounded border border-gray-300 transition-all hover:ring-2 hover:ring-blue-500 dark:border-gray-600"
                        style={{ backgroundColor: item.colourCode }}
                        title="Click to change colour"
                      />
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
                      {formatDate(item.createdAt)}
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
                    colSpan={9}
                    className="py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    No colours found
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

      {/* Color Picker Popover */}
      {colorPickerState.isOpen && (
        <div
          className="color-picker-popover fixed z-[9999]"
          style={{
            left: colorPickerState.position.x,
            top: colorPickerState.position.y,
          }}
        >
          <div className="min-w-[200px] rounded-lg border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium dark:text-white">
                Choose Color
              </span>
              <button
                onClick={closeColorPicker}
                className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            <input
              type="color"
              value={colorPickerState.color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="h-48 w-full cursor-pointer rounded-lg border-2 border-gray-200 dark:border-gray-600"
            />

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded border border-gray-200 dark:border-gray-600"
                  style={{ backgroundColor: colorPickerState.color }}
                />
                <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                  {colorPickerState.color}
                </span>
              </div>
              <button
                onClick={closeColorPicker}
                className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs text-white transition-colors hover:bg-blue-600"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Right Side Drawer */}
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
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="dark:border-dark-500 flex items-center justify-between border-b border-gray-200 px-5 py-4">
                  <h2 className="dark:text-dark-50 text-lg font-semibold text-gray-800">
                    {editId !== null ? "Edit Colour" : "Add Colour"}
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

                {/* Content */}
                <div className="grow space-y-5 overflow-y-auto p-5">
                  {/* Select Model */}
                  <div>
                    <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                      Select Model <span className="text-red-500">*</span>
                    </label>
                    <Combobox
                      data={models}
                      displayField="name"
                      value={
                        models.find((m) => m.id === Number(formData.modelId)) ||
                        null
                      }
                      onChange={(val: OptionType | null) => {
                        handleInputChange("model", val?.name || "");
                        handleInputChange("modelId", val?.id || "");

                        // reset variant
                        handleInputChange("variant", "");
                        handleInputChange("variantId", "");

                        // reset showroom variant
                        handleInputChange("showroomVariantId", "");
                      }}
                      placeholder="Select Model"
                      searchFields={["name"]}
                    />
                    {errors.model && (
                      <span className="text-xs text-orange-500">
                        {errors.model}
                      </span>
                    )}
                  </div>

                  {/* Select Variant */}
                  <div>
                    <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                      Select Variant <span className="text-red-500">*</span>
                    </label>
                    <Combobox
                      data={filteredVariants}
                      displayField="name"
                      value={
                        filteredVariants.find(
                          (v) => v.id === Number(formData.variantId),
                        ) || null
                      }
                      onChange={(val: OptionType | null) => {
                        handleInputChange("variant", val?.name || "");
                        handleInputChange("variantId", val?.id || "");

                        // Reset showroom variant
                        if (val?.id) {
                          handleInputChange("showroomVariantId", "");
                        }
                      }}
                      placeholder="Select Variant"
                      searchFields={["name"]}
                      disabled={
                        !formData.modelId || !!formData.showroomVariantId
                      }
                    />
                    {errors.variant && (
                      <span className="text-xs text-orange-500">
                        {errors.variant}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Select Showroom Variant
                    </label>

                    <Combobox
                      data={filteredShowroomVariants}
                      displayField="name"
                      value={
                        filteredShowroomVariants.find(
                          (v) => v.id === Number(formData.showroomVariantId),
                        ) || null
                      }
                      onChange={(val: any) => {
                        handleInputChange("showroomVariantId", val?.id || "");

                        // Reset variant
                        if (val?.id) {
                          handleInputChange("variant", "");
                          handleInputChange("variantId", "");
                        }
                      }}
                      placeholder="Select Showroom Variant"
                      searchFields={["name"]}
                      disabled={!formData.modelId || !!formData.variantId}
                    />
                    {errors.showroomVariantId && (
                      <span className="text-xs text-orange-500">
                        {errors.showroomVariantId}
                      </span>
                    )}
                  </div>
                  {/* Colour Name */}
                  <div>
                    <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                      Colour Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter Colour Name"
                      value={formData.colourName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("colourName", e.target.value)
                      }
                    />
                    {errors.colourName && (
                      <span className="text-xs text-orange-500">
                        {errors.colourName}
                      </span>
                    )}
                  </div>

                  {/* Colour Picker */}
                  <div>
                    <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                      Colour Picker <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        value={formData.colourCode}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleInputChange("colourCode", e.target.value)
                        }
                        className="h-16 w-16 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    {errors.colourCode && (
                      <span className="text-xs text-orange-500">
                        {errors.colourCode}
                      </span>
                    )}
                  </div>

                  {/* Status - Dropdown */}
                  <div>
                    <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                      Status <span className="text-red-500">*</span>
                    </label>

                    <Listbox
                      data={statusOptions}
                      displayField="label"
                      value={
                        (statusOptions.find(
                          (s) => s.value === formData.status,
                        ) as {
                          label: string;
                          value: "ACTIVE" | "INACTIVE";
                        } | null) || null
                      }
                      onChange={(
                        val: {
                          label: string;
                          value: "ACTIVE" | "INACTIVE";
                        } | null,
                      ) => handleInputChange("status", val?.value || "ACTIVE")}
                      placeholder="Select Status"
                    />
                  </div>
                </div>

                {/* Footer */}
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
                  <Button
                    color="primary"
                    type="button"
                    onClick={handleSave}
                    className="h-10 w-1/2"
                  >
                    {editId !== null ? "Update" : "Save"}
                  </Button>
                </div>
              </div>
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
      title: isBulkDelete ? "Delete Selected Colours?" : "Are you sure?",
      description: isBulkDelete 
        ? `Are you sure you want to delete ${selectedIds.length} selected colours? This action cannot be undone.`
        : "Are you sure you want to delete this colour? Once deleted, it cannot be restored.",
      actionText: isBulkDelete ? "Delete All" : "Delete",
    },
    success: {
      title: "Deleted Successfully",
      description: isBulkDelete 
        ? `${selectedIds.length} colours have been deleted.`
        : "The colour has been deleted.",
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
};

export default Colour;
