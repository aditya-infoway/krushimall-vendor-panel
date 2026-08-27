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
import { RiFileExcel2Fill, RiFilePdfFill } from "react-icons/ri";
import { useForm, useWatch, Controller } from "react-hook-form";
import {
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import apiHelper from "@/utils/apiHelper";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// Local UI Imports
import { Button, Checkbox, Input } from "@/components/ui";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Combobox } from "@/components/shared/form/Combobox";

type VariantType = {
  id: number;

  category: string;
  categoryId?: number;

  brand: string;
  brandId?: number;

  model: string;
  modelId?: number;

  modelYear: string;
  modelYearId?: number;

  variantCode: string;
  variantName: string;

  image?: string;

  status: string;
  createdAt: string;
};

type FormValues = {
  category: string;
  categoryId: number | string;
  brand: string;
  brandId: number | string;
  model: string;
  modelId: number | string;
  modelYear: string;
  modelYearId: number | string;
  variantCode: string;
  variantName: string;
  image: string;
  status: string;
};

const entriesOptions = [
  { id: 10, name: "10" },
  { id: 20, name: "20" },
  { id: 30, name: "30" },
  { id: 40, name: "40" },
  { id: 50, name: "50" },
  { id: 100, name: "100" },
];

const statusOptions = [
  { id: "ACTIVE", name: "On" },
  { id: "INACTIVE", name: "Off" },
];

export default function Createvariant() {
  const [showDrawer, setShowDrawer] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  type BrandOption = { id: number; name: string; categoryId: number };
type ModelOption = { id: number; name: string; brandId: number };
type ModelYearOption = { id: number; name: string; modelId: number };
 const [modelYears, setModelYears] = useState<ModelYearOption[]>([]);
const [filteredModelYears, setFilteredModelYears] = useState<ModelYearOption[]>([]);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [variants, setVariants] = useState<VariantType[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

const [brands, setBrands] = useState<BrandOption[]>([]);
const [filteredBrands, setFilteredBrands] = useState<BrandOption[]>([]);
const [models, setModels] = useState<ModelOption[]>([]);
const [filteredModels, setFilteredModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmState, setConfirmState] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

const categoryOptions = categories.map((cat) => ({
  id: String(cat.id),
  name: cat.name,
}));
const brandOptions = filteredBrands.map((br) => ({
  id: String(br.id),
  name: br.name,
}));
const modelOptions = filteredModels.map((md) => ({
  id: String(md.id),
  name: md.name,
}));
const modelYearOptions = filteredModelYears.map((yr) => ({
  id: String(yr.id),
  name: yr.name,
}));

  const [search, setSearch] = useState("");
  const [showFilterBar, setShowFilterBar] = useState(false);

  // Filter dropdown states - Added selectedYearFilter
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("All");
  const [selectedModelFilter, setSelectedModelFilter] = useState("All");
  const [selectedYearFilter, setSelectedYearFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  // const [years, setYears] = useState<YearDataType[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);



  const getVariants = async () => {
    try {
      const response = await apiHelper.get("/variant");
      const data = response?.data || response;

      setVariants(
        (Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id,
          category: item.category?.categoryName || "",
          categoryId: item.categoryId,
          brand: item.brand?.brandName || "",
          brandId: item.brandId,
          model: item.model?.modelName || "",
          modelId: item.modelId,
          modelYear: item.modelYear?.modelYear || "",
          modelYearId: item.modelYearId,
          variantCode: item.variantCode,
          variantName: item.variantName,
          image: item.image,
          status: item.status,
          createdAt: item.createdAt,
        })),
      );
    } catch (err) {
      setVariants([]);
    }
  };
  useEffect(() => {
    getVariants();
  }, []);
  const getCategories = async () => {
    try {
      const response = await apiHelper.get("/category");
      const data = response?.data || response;
      setCategories(
        (Array.isArray(data) ? data : []).map((item: any) => ({
          id: item.id || item._id,
          name: item.categoryName || item.name,
        })),
      );
    } catch (error) {
      setCategories([]);
    }
  };

  const getBrands = async () => {
  try {
    const response = await apiHelper.get("/brand");
    const data = response?.data || response;
    setBrands(
      (Array.isArray(data) ? data : []).map((item: any) => ({
        id: Number(item.id || item._id),
        name: item.brandName || item.name || "",
        categoryId: Number(
          typeof item.category === "object" ? item.category?.id : item.categoryId,
        ),
      })),
    );
  } catch (error) {
    setBrands([]);
  }
};

const getModels = async () => {
  try {
    const response = await apiHelper.get("/model");
    const data = response?.data || response;
    setModels(
      (Array.isArray(data) ? data : []).map((item: any) => ({
        id: Number(item.id || item._id),
        name: item.modelName || item.name || "",
        brandId: Number(
          typeof item.brand === "object" ? item.brand?.id : item.brandId,
        ),
      })),
    );
  } catch (error) {
    setModels([]);
  }
};

const getModelYears = async () => {
  try {
    const response = await apiHelper.get("/model-year");
    const data = response?.data || response;
    setModelYears(
      (Array.isArray(data) ? data : []).map((item: any) => ({
        id: Number(item.id || item._id),
        name: item.modelYear,
        modelId: Number(
          typeof item.model === "object" ? item.model?.id : item.modelId,
        ),
      })),
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
  // React Hook Form implementation
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      category: "",
      categoryId: "",

      brand: "",
      brandId: "",

      model: "",
      modelId: "",

      modelYear: "",
      modelYearId: "",

      variantCode: "",
      variantName: "",
      image: "",
      status: "ACTIVE",
    },
  });

  const formStatusValue = useWatch({ control, name: "status" });
  const formCategoryValue = useWatch({ control, name: "category" });
  const formBrandValue = useWatch({ control, name: "brand" });
  const formModelValue = useWatch({ control, name: "model" });
  const formImageValue = useWatch({ control, name: "image" });
  const formModelYearId = useWatch({
    control,
    name: "modelYearId",
  });
  // const formValidationRules = {
  //   category: { required: "Category is required" },
  //   brand: { required: "Brand is required" },
  //   model: { required: "Model is required" },
  //   variantCode: { required: "Variant Code is required" },
  //   variantName: { required: "Variant Name is required" },
  // };

  //   // Filter options
  //   const categoryFilterOptions = [
  //     { id: "All", name: "All Categories" },
  //     ...categories.map((c) => ({ id: c, name: c })),
  //   ];

  //   const brandFilterOptions = [
  //     { id: "All", name: "All Brands" },
  //     ...brands.map((b) => ({ id: b, name: b })),
  //   ];

  //   const modelFilterOptions = [
  //     { id: "All", name: "All Models" },
  //     ...models.map((m) => ({ id: m, name: m })),
  //   ];

  // Year filter options - dynamically generated from existing data

const categoryFilterOptions = [
  { id: "All", name: "All Categories" },
  ...categories.map((c) => ({
    id: String(c.id),
    name: c.name,
  })),
];

const brandFilterOptions = [
  { id: "All", name: "All Brands" },
  ...filteredBrands.map((b) => ({
    id: String(b.id),
    name: b.name,
  })),
];

const modelFilterOptions = [
  { id: "All", name: "All Models" },
  ...filteredModels.map((m) => ({
    id: String(m.id),
    name: m.name,
  })),
];

const modelYearFilterOptions = [
  { id: "All", name: "All Years" },
  
  ...filteredModelYears.map((y) => ({
    
    id: String(y.id),
    name: y.name,
    
  })),
  
];
  const statusFilterOptions = [
    { id: "All", name: "All Statuses" },
    { id: "ACTIVE", name: "On" },
    { id: "INACTIVE", name: "Off" },
  ];

  const handleOpenAddDrawer = () => {
    setEditId(null);
    // const firstCategory = categories[0] || { id: "", name: "" };
    // const firstBrand = brands[0] || { id: "", name: "" };
    // const firstModel = models[0] || { id: "", name: "" };
    reset({
      category: "",
      categoryId: "",

      brand: "",
      brandId: "",

      model: "",
      modelId: "",

      modelYear: "",
      modelYearId: "",

      variantCode: "",
      variantName: "",

      image: "",
      status: "ACTIVE",
    });

     setFilteredBrands([]);
  setFilteredModels([]);
  setFilteredModelYears([]);
  setSelectedFile(null);
  setShowDrawer(true);
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setValue("image", reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  const handleOpenEditDrawer = (item: VariantType) => {
    // ✅ YearDataType
    setEditId(item.id);
    reset({
      category: item.category,
      categoryId: item.categoryId || "",
      brand: item.brand,
      brandId: item.brandId || "",
      model: item.model,
      modelId: item.modelId || "",
      modelYear: item.modelYear,
      modelYearId: item.modelYearId || "",
      variantCode: item.variantCode || "",
      variantName: item.variantName || "",
      image: item.image ? apiHelper.getImageUrl(item.image) : "",
      status: item.status,
    });
     setFilteredBrands(brands.filter((b) => Number(b.categoryId) === Number(item.categoryId)));
  setFilteredModels(models.filter((m) => Number(m.brandId) === Number(item.brandId)));
  setFilteredModelYears(modelYears.filter((y) => Number(y.modelId) === Number(item.modelId)));
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
        await Promise.all(
          selectedIds.map((id) => apiHelper.delete(`/variant/${id}`)),
        );
        toast.success(`${selectedIds.length} variants deleted successfully!`);
        await getVariants();
        setSelectedIds([]);
        setCurrentPage(1);
        setConfirmState("success");
      } else {
        if (deleteTargetId === null) return;
        await apiHelper.delete(`/variant/${deleteTargetId}`);
        toast.success("Variant deleted successfully!");
        await getVariants();
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
    const item = variants.find((v) => v.id === id);
    if (!item) return;
    try {
      const newStatus = item.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await apiHelper.put(`/variant/${id}`, {
        categoryId: item.categoryId,
        brandId: item.brandId,
        modelId: item.modelId,
        modelYearId: item.modelYearId,
        variantCode: item.variantCode,
        variantName: item.variantName,
        status: newStatus,
      });
      setVariants((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v)),
      );
      await getVariants();
    } catch (error) {
      await getVariants();
    }
  };

  const onFormSubmit = async (data: FormValues) => {
    try {
      const hasNewImage = data.image && data.image.startsWith("data:");

      if (hasNewImage) {
        const formData = new FormData();
        formData.append("categoryId", String(data.categoryId));
        formData.append("brandId", String(data.brandId));
        formData.append("modelId", String(data.modelId));
        formData.append("modelYearId", String(data.modelYearId));
        formData.append("variantCode", data.variantCode);
        formData.append("variantName", data.variantName);
        formData.append("status", data.status);

        const response = await fetch(data.image);
        const blob = await response.blob();
        formData.append("image", blob, "variant-image.jpg");

        if (editId !== null) {
          await apiHelper.put(`/variant/${editId}`, formData);
          toast.success("Variant updated successfully!");
        } else {
          await apiHelper.post("/variant", formData);
          toast.success("Variant created successfully!");
        }
      } else {
        // If no new image, send as JSON
        const payload = {
          categoryId: Number(data.categoryId),
          brandId: Number(data.brandId),
          modelId: Number(data.modelId),
          modelYearId: Number(data.modelYearId),
          variantCode: data.variantCode,
          variantName: data.variantName,
          status: data.status,
        };

        if (editId !== null) {
          await apiHelper.put(`/variant/${editId}`, payload);
          toast.success("Variant updated successfully!");
        } else {
          await apiHelper.post("/variant", payload);
          toast.success("Variant created successfully!");
        }
      }

      await getVariants();
      setShowDrawer(false);
      reset();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to save variant. Please try again.",
      );
    }
  };

  // Filter logic - Added year filter matching
  const filteredData = variants.filter((item) => {
    const matchesSearch =
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.brand.toLowerCase().includes(search.toLowerCase()) ||
      item.model.toLowerCase().includes(search.toLowerCase()) ||
      item.modelYear.toString().includes(search.toLowerCase()) ||
        item.variantCode.toLowerCase().includes(search.toLowerCase()) ||
  item.variantName.toLowerCase().includes(search.toLowerCase());

   const matchesCategoryDropdown =
  selectedCategoryFilter === "All" ||
  String(item.categoryId) === selectedCategoryFilter;

const matchesBrandDropdown =
  selectedBrandFilter === "All" ||
  String(item.brandId) === selectedBrandFilter;

const matchesModelDropdown =
  selectedModelFilter === "All" ||
  String(item.modelId) === selectedModelFilter;

const matchesYearDropdown =
  selectedYearFilter === "All" ||
  String(item.modelYearId) === selectedYearFilter;;
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
      {/* Upper Actions Control Toolbar Layout */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            Create Variant
          </h1>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            Manage all Variant from here
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

          {/* Right side - Add Variant button */}
          <Button
            color="primary"
            onClick={handleOpenAddDrawer}
            className="whitespace-nowrap"
          >
            Add Variant
          </Button>
        </div>
      </div>

      {/* Global Context Search Box */}
      <div className="relative w-full max-w-md">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search year, model or brand..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="dark:border-dark-500 dark:bg-dark-800 w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-4 pl-10 text-sm outline-none"
        />
      </div>

      {/* Five Dropdown Filters - Added Year Filter */}
      {showFilterBar && (
        <div className="dark:bg-dark-700 dark:border-dark-500 animate-in fade-in slide-in-from-top-2 rounded-xl border border-gray-200 bg-white p-4 transition-all duration-150">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            <div className="flex flex-col gap-1">
              <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Category
              </span>
            <Combobox
  data={categoryFilterOptions}
  value={
    categoryFilterOptions.find(
      o => o.id === selectedCategoryFilter
    ) || categoryFilterOptions[0]
  }
  displayField="name"
  searchFields={["name"]}
  onChange={(opt:any)=>{
    setSelectedCategoryFilter(opt.id);
    setSelectedBrandFilter("All");
    setSelectedModelFilter("All");
    setSelectedYearFilter("All");

    setFilteredBrands(
      brands.filter(b => String(b.categoryId) === String(opt.id))
    );

    setFilteredModels([]);
    setFilteredModelYears([]);
  }}
/>
            </div>

            <div className="flex flex-col gap-1">
              <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Brand
              </span>
             <Combobox
  data={brandFilterOptions}
  value={
    brandFilterOptions.find(
      o => o.id === selectedBrandFilter
    ) || brandFilterOptions[0]
  }
  displayField="name"
  searchFields={["name"]}
  onChange={(opt:any)=>{
    setSelectedBrandFilter(opt.id);
    setSelectedModelFilter("All");
    setSelectedYearFilter("All");

    setFilteredModels(
      models.filter(m => String(m.brandId) === String(opt.id))
    );

    setFilteredModelYears([]);
  }}
/>
            </div>

            <div className="flex flex-col gap-1">
              <span className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Model
              </span>
             <Combobox
  data={modelFilterOptions}
  value={
    modelFilterOptions.find(
      o => o.id === selectedModelFilter
    ) || modelFilterOptions[0]
  }
  displayField="name"
  searchFields={["name"]}
  onChange={(opt:any)=>{
    setSelectedModelFilter(opt.id);
    setSelectedYearFilter("All");

    setFilteredModelYears(
      modelYears.filter(
        y => String(y.modelId) === String(opt.id)
      )
    );
  }}
/>
            </div>

            {/* New Year Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium">Year</label>
             <Combobox
  data={modelYearFilterOptions}
  value={
    modelYearFilterOptions.find(
      o => o.id === selectedYearFilter
    ) || modelYearFilterOptions[0]
  }
  displayField="name"
  searchFields={["name"]}
  onChange={(opt:any)=>{
    setSelectedYearFilter(opt.id);
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
                placeholder="All Statuses"
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
            className="w-full min-w-[800px] text-left [&_.table-th]:font-semibold"
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
                <Th className="w-16 py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Image
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
                  Model Year
                </Th>
                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Variant Code
                </Th>

                <Th className="py-3.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Variant Name
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
                      <Checkbox
                        className="size-4.5"
                        checked={isRowSelected}
                        onChange={() => handleSelectRow(item.id)}
                      />
                    </Td>
                    <Td className="py-4 font-medium text-gray-500">
                      {indexOfFirstItem + index + 1}
                    </Td>
                    <Td className="py-4">
                      <div className="dark:border-dark-500 flex h-15 w-15 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        {item.image ? (
                          <img
                            src={apiHelper.getImageUrl(item.image)}
                            alt={item.variantName}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              console.log("Image Error:", item.image);
                            }}
                          />
                        ) : (
                          <span className="text-xs font-bold text-gray-400 uppercase">
                            {item.variantName.substring(0, 2)}
                          </span>
                        )}
                      </div>
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.category}
                    </Td>
                    <Td className="dark:text-dark-200 py-4 text-gray-600">
                      {item.brand}
                    </Td>
                    <Td className="py-4 font-medium text-gray-900 dark:text-gray-400">
                      {item.model}
                    </Td>
                    <Td className="py-4 font-medium text-gray-900 dark:text-gray-400">
                      {item.modelYear}
                    </Td>
                    <Td className="py-4 font-medium text-gray-900 dark:text-gray-400">
                      {item.variantCode}
                    </Td>
                    <Td className="py-4 font-medium text-gray-900 dark:text-gray-400">
                      {item.variantName}
                    </Td>

                    <Td className="py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleTableStatus(item.id)}
                        className={`relative h-6 w-12 rounded-full transition-all ${item.status === "ACTIVE" ? "bg-primary-500" : "dark:bg-dark-600 bg-gray-300"}`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${item.status === "ACTIVE" ? "left-6.5" : "left-0.5"}`}
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
                    colSpan={9}
                    className="py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    No variants found
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

      {/* Slide Transition Form Drawer */}
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
                {/* Header */}
                <div className="dark:border-dark-500 flex items-center justify-between border-b border-gray-200 px-5 py-4">
                  <h2 className="dark:text-dark-50 text-lg font-semibold text-gray-800">
                    {editId !== null ? "Edit Variant" : "Add Variant"}
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

                {/* Content Input Fields */}
                <div className="grow space-y-5 overflow-y-auto p-5">
                  <div>
                    <span className="mb-2 block text-sm font-medium">
                      Category
                    </span>
                    <Controller
                      name="categoryId"
                      control={control}
                      rules={{
                        validate: (value) =>
                          (value && Number(value) > 0) ||
                          "Category is required",
                      }}
                      render={({ field, fieldState }) => (
                        <Combobox
                          data={categoryOptions}
                          value={
                            categoryOptions.find(
                              (opt) => String(opt.id) === String(field.value),
                            ) || null
                          }
                          error={fieldState.error?.message}
                          displayField="name"
                          searchFields={["name"]}
                          placeholder="Select Category"
                         onChange={(opt: any) => {
  field.onChange(opt.id);
  setValue("category", opt.name);
  setValue("brand", ""); setValue("brandId", "");
  setValue("model", ""); setValue("modelId", "");
  setValue("modelYear", ""); setValue("modelYearId", "");

  setFilteredBrands(brands.filter((b) => Number(b.categoryId) === Number(opt.id)));
  setFilteredModels([]);
  setFilteredModelYears([]);
}}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <span className="mb-2 block text-sm font-medium">
                      Brand
                    </span>
                    <Controller
                      name="brandId"
                      control={control}
                      rules={{
                        validate: (value) =>
                          (value && Number(value) > 0) || "Brand is required",
                      }}
                      render={({ field, fieldState }) => (
                        <Combobox
                          data={brandOptions}
                          value={
                            brandOptions.find(
                              (opt) => String(opt.id) === String(field.value),
                            ) || null
                          }
                          error={fieldState.error?.message}
                          displayField="name"
                          searchFields={["name"]}
                          placeholder="Select Brand"
                          onChange={(opt: any) => {
  field.onChange(opt.id);
  setValue("brand", opt.name);
  setValue("model", ""); setValue("modelId", "");
  setValue("modelYear", ""); setValue("modelYearId", "");

  setFilteredModels(models.filter((m) => Number(m.brandId) === Number(opt.id)));
  setFilteredModelYears([]);
}}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <span className="mb-2 block text-sm font-medium">
                      Model
                    </span>
                    <Controller
                      name="modelId"
                      control={control}
                      rules={{
                        validate: (value) =>
                          (value && Number(value) > 0) || "Model is required",
                      }}
                      render={({ field, fieldState }) => (
                        <Combobox
                          data={modelOptions}
                          value={
                            modelOptions.find(
                              (opt) => String(opt.id) === String(field.value),
                            ) || null
                          }
                          error={fieldState.error?.message}
                          displayField="name"
                          searchFields={["name"]}
                          placeholder="Select Model"
                         onChange={(opt: any) => {
  field.onChange(opt.id);
  setValue("model", opt.name);
  setValue("modelYear", ""); setValue("modelYearId", "");

  setFilteredModelYears(modelYears.filter((y) => Number(y.modelId) === Number(opt.id)));
}}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Year
                    </label>
                    <Controller
                      name="modelYearId"
                      control={control}
                      rules={{
                        validate: (value) =>
                          (value && Number(value) > 0) ||
                          "Model Year is required",
                      }}
                      render={({ field, fieldState }) => (
                        <Combobox
                          data={modelYearOptions}
                          value={
                            modelYearOptions.find(
                              (opt) => String(opt.id) === String(field.value),
                            ) || null
                          }
                          error={fieldState.error?.message}
                          displayField="name"
                          searchFields={["name"]}
                          placeholder="Select Model Year"
                          onChange={(opt: any) => {
                            field.onChange(opt.id);
                            setValue("modelYear", opt.name);
                          }}
                        />
                      )}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Variant Code
                    </label>

                    <Input
                      placeholder="Enter Variant Code"
                      error={errors.variantCode?.message}
                      {...register("variantCode", {
                        required: "Variant Code is required",
                      })}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Variant Name
                    </label>

                    <Input
                      placeholder="Enter Variant Name"
                      error={errors.variantName?.message}
                      {...register("variantName", {
                        required: "Variant Name is required",
                      })}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Variant Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="dark:file:bg-dark-800 dark:file:text-dark-200 block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
                    />
                    {formImageValue && (
                      <img
                        src={formImageValue}
                        alt="Preview"
                        className="dark:border-dark-500 mt-3 h-20 w-20 rounded-xl border border-gray-200 object-contain"
                      />
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
            title: isBulkDelete ? "Delete Selected Variants?" : "Are you sure?",
            description: isBulkDelete
              ? `Are you sure you want to delete ${selectedIds.length} selected variants? This action cannot be undone.`
              : "Are you sure you want to delete this variant? Once deleted, it cannot be restored.",
            actionText: isBulkDelete ? "Delete All" : "Delete",
          },
          success: {
            title: "Deleted Successfully",
            description: isBulkDelete
              ? `${selectedIds.length} variants have been deleted.`
              : "The variant has been deleted.",
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
