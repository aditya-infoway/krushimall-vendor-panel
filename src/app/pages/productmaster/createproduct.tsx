import {  useEffect, useState, useMemo } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  CubeIcon,
  TagIcon,
  PhotoIcon,
  Cog6ToothIcon,
  XMarkIcon,
  CheckBadgeIcon,
  SparklesIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import apiHelper from "@/utils/apiHelper";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Combobox } from "@/components/shared/form/Combobox";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Country } from "country-state-city";
import Select from "react-select";

// ============================================================
// TYPES
// ============================================================

type OptionType = { id: string | number; name: string };

type FormValues = {
  // ---- Product tab ----
  productName: string;
  sku: string;
  partNumber: string;
  oemNumber: string;
  countryOfOrigin: string;
  categoryId: string;
  subCategoryId: string;
  subSubCategoryId: string;
  brandId: string;
  productType: string;
  keywords: string;
  shortDescription: string;
  feature1: string;
  feature2: string;
  feature3: string;
  feature4: string;
  feature5: string;
  feature6: string;
  videoUrl: string;
  stock: string;
  // ---- Pricing tab ----
  mrp: number | string;
  sellingPrice: number | string;
  tax: number | string;
  discount: number | string;
  stockQuantity: number | string;
  barcode: string;
  unit: string;
  weight: string;
  maxOrderQuantity: number | string;

  // ---- Images tab ----
  mainImage: string;
  thumbnailImage: string;
  additionalImages: string[];

  // ---- Additional tab ----
  productCondition: string;
  manufacturingDate: string;
  expiryDate: string;
  returnPolicy: string;
  estimatedDeliveryTime: string;
  freeShipping: boolean;
  warrantyPeriod: string;
  warrantyDetails: string;
  specTitle1: string;
  specValue1: string;
  specTitle2: string;
  specValue2: string;
  specTitle3: string;
  specValue3: string;
  specTitle4: string;
  specValue4: string;
  specTitle5: string;
  specValue5: string;
  specTitle6: string;
  specValue6: string;
};

type TabKey = "product" | "pricing" | "images" | "additional";

// ============================================================
// STATIC OPTIONS
// ============================================================

const productTypeOptions: OptionType[] = [
  { id: "SIMPLE", name: "Simple" },
  { id: "VARIABLE", name: "Variable" },
];
const stockOptions: OptionType[] = [
  { id: "IN_STOCK", name: "In Stock" },
  { id: "OUT_OF_STOCK", name: "Out of Stock" },
  { id: "PRE_ORDER", name: "Pre-Order" },
];
const taxOptions: OptionType[] = [
  { id: 0, name: "0% GST" },
  { id: 5, name: "5% GST" },
  { id: 12, name: "12% GST" },
  { id: 18, name: "18% GST" },
  { id: 28, name: "28% GST" },
];

const productConditionOptions: OptionType[] = [
  { id: "NEW", name: "New" },
  { id: "USED", name: "Used" },
  { id: "REFURBISHED", name: "Refurbished" },
];

const returnPolicyOptions: OptionType[] = [
  { id: "NONE", name: "No Return" },
  { id: "DAYS_7", name: "7 Days Return" },
  { id: "DAYS_15", name: "15 Days Return" },
  { id: "DAYS_30", name: "30 Days Return" },
];

const tabs: { key: TabKey; label: string }[] = [
  { key: "product", label: "Product" },
  { key: "pricing", label: "Pricing" },
  { key: "images", label: "Images" },
  { key: "additional", label: "Additional" },
];

const generateSKU = () => {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PROD-${rand}`;
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ============================================================
// COMPONENT
// ============================================================

export default function CreateProduct() {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [activeTab, setActiveTab] = useState<TabKey>("product");
  const [submitting, setSubmitting] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(isEditMode);

  // collapsible sections
  const [showDescription, setShowDescription] = useState(true);
  const [showWarranty, setShowWarranty] = useState(false);
  const [showSpecifications, setShowSpecifications] = useState(true);
  const navigate = useNavigate();
  // dropdown data
  const [categories, setCategories] = useState<OptionType[]>([]);
  const [subCategories, setSubCategories] = useState<
    (OptionType & { categoryId: number })[]
  >([]);
  const [subSubCategories, setSubSubCategories] = useState<
    (OptionType & { subCategoryId: number })[]
  >([]);
  const [brands, setBrands] = useState<OptionType[]>([]);

  const [filteredSubCategories, setFilteredSubCategories] = useState<
    OptionType[]
  >([]);
  const [filteredSubSubCategories, setFilteredSubSubCategories] = useState<
    OptionType[]
  >([]);
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      productName: "",
      sku: generateSKU(),
      partNumber: "",
      oemNumber: "",
      countryOfOrigin: "",
      categoryId: "",
      subCategoryId: "",
      subSubCategoryId: "",
      brandId: "",
      productType: "SIMPLE",
      keywords: "",
      shortDescription: "",
      feature1: "",
      feature2: "",
      feature3: "",
      feature4: "",
      feature5: "",
      feature6: "",
      videoUrl: "",
      stock: "",
      mrp: "",
      sellingPrice: "",
      tax: 0,
      discount: 0,
      stockQuantity: "",
      barcode: "",
      unit: "",
      weight: "",
      maxOrderQuantity: 1,

      mainImage: "",
      thumbnailImage: "",
      additionalImages: [],

      productCondition: "NEW",
      manufacturingDate: "",
      expiryDate: "",
      returnPolicy: "",
      estimatedDeliveryTime: "",
      freeShipping: false,
      warrantyPeriod: "",
      warrantyDetails: "",
      specTitle1: "",
      specValue1: "",
      specTitle2: "",
      specValue2: "",
      specTitle3: "",
      specValue3: "",
      specTitle4: "",
      specValue4: "",
      specTitle5: "",
      specValue5: "",
      specTitle6: "",
      specValue6: "",
    },
  });

  // ---- country options (for Country of Origin select) ----
  const countryOptions = useMemo(() => {
    return Country.getAllCountries().map((c) => ({
      value: c.name,
      label: c.name,
    }));
  }, []);

  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "transparent",
      borderColor: state.isFocused
        ? "var(--color-primary-600)"
        : "var(--color-gray-700)",
      boxShadow: state.isFocused
        ? "0 0 0 1px var(--color-primary-600)"
        : "none",
      minHeight: "42px",
      "&:hover": {
        borderColor: "var(--color-primary-500)",
      },
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      color: "var(--color-dark-100)",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "var(--color-dark-100)",
    }),
    input: (provided: any) => ({
      ...provided,
      color: "var(--color-dark-100)",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "var(--color-gray-400)",
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "var(--color-dark-700)",
      border: "1px solid var(--color-primary-600)",
      borderRadius: "12px",
      overflow: "hidden",
    }),
    menuList: (provided: any) => ({
      ...provided,
      padding: 0,
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "var(--color-primary-600)"
        : state.isFocused
          ? "var(--color-primary-500)"
          : "var(--color-dark-700)",
      color: "#fff",
      cursor: "pointer",
    }),
    dropdownIndicator: (provided: any, state: any) => ({
      ...provided,
      color: state.isFocused
        ? "var(--color-primary-600)"
        : "var(--color-gray-400)",
    }),
    clearIndicator: (provided: any) => ({
      ...provided,
      color: "var(--color-gray-400)",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
  };

  const categoryId = useWatch({ control, name: "categoryId" });
  const subCategoryId = useWatch({ control, name: "subCategoryId" });
  const sellingPrice = useWatch({ control, name: "sellingPrice" });
  const tax = useWatch({ control, name: "tax" });
  const discount = useWatch({ control, name: "discount" });
  const mainImage = useWatch({ control, name: "mainImage" });
  const thumbnailImage = useWatch({ control, name: "thumbnailImage" });
  const additionalImages = useWatch({ control, name: "additionalImages" });
  const freeShipping = useWatch({ control, name: "freeShipping" });

  // ---- load product for edit mode (after dropdowns ready) ----
  const loadProductForEdit = async () => {
    try {
      setLoadingProduct(true);
      const res = await apiHelper.get(`/vendor-panel/product/${id}`);
      const p = res?.data?.product || res?.product || res?.data || res;

      setValue("productName", p.productName || p.name || "");
      setValue("sku", p.sku || "");
      setValue("partNumber", p.partNumber || "");
      setValue("oemNumber", p.oemNumber || "");
      setValue("countryOfOrigin", p.countryOfOrigin || "");
      setValue("categoryId", String(p.category?.id || p.categoryId || ""));
      setValue(
        "subCategoryId",
        String(p.subCategory?.id || p.subCategoryId || ""),
      );
      setValue(
        "subSubCategoryId",
        String(p.subSubCategory?.id || p.subSubCategoryId || ""),
      );
      setValue("brandId", String(p.brand?.id || p.brandId || ""));
      setValue("productType", p.productType || "SIMPLE");
      setValue("keywords", p.keywords || "");
      setValue("shortDescription", p.shortDescription || "");

      const features: string[] = p.keyFeatures
        ? typeof p.keyFeatures === "string"
          ? JSON.parse(p.keyFeatures)
          : p.keyFeatures
        : [];
      features.forEach((f, i) => {
        if (i < 6) setValue(`feature${i + 1}` as keyof FormValues, f);
      });

      setValue("videoUrl", p.videoUrl || "");
      setValue("stock", p.stock || "");

      setValue("mrp", p.mrp ?? "");
      setValue("sellingPrice", p.sellingPrice ?? "");
      setValue("tax", Number(p.tax) || 0);
      setValue("discount", Number(p.discount) || 0);
      setValue("stockQuantity", p.stockQuantity ?? "");
      setValue("barcode", p.barcode || "");
      setValue("unit", p.unit || "");
      setValue("weight", p.weight || "");
      setValue("maxOrderQuantity", p.maxOrderQuantity ?? 1);

      setValue("mainImage", apiHelper.getImageUrl(p.mainImage) || "");
      setValue("thumbnailImage", apiHelper.getImageUrl(p.thumbnailImage) || "");
      setValue(
        "additionalImages",
        (p.additionalImages || []).map((img: string) =>
          apiHelper.getImageUrl(img),
        ),
      );

      setValue("productCondition", p.productCondition || "NEW");
      setValue("manufacturingDate", p.manufacturingDate || "");
      setValue("expiryDate", p.expiryDate || "");
      setValue("returnPolicy", p.returnPolicy || "");
      setValue("estimatedDeliveryTime", p.estimatedDeliveryTime || "");
      setValue("freeShipping", Boolean(p.freeShipping));
      setValue("warrantyPeriod", p.warrantyPeriod || "");
      setValue("warrantyDetails", p.warrantyDetails || "");

      const specs: { title: string; value: string }[] = p.specifications
        ? typeof p.specifications === "string"
          ? JSON.parse(p.specifications)
          : p.specifications
        : [];
      specs.forEach((s, i) => {
        if (i < 6) {
          setValue(`specTitle${i + 1}` as keyof FormValues, s.title);
          setValue(`specValue${i + 1}` as keyof FormValues, s.value);
        }
      });
    } catch (error) {
      console.error("Failed to load product", error);
      toast.error("Failed to load product for editing");
    } finally {
      setLoadingProduct(false);
    }
  };

  // ---- fetch dropdown data (then product, if editing) ----
  useEffect(() => {
    (async () => {
      try {
        const [catRes, subCatRes, subSubCatRes, brandRes] = await Promise.all([
          apiHelper.get("/vendor-panel/category"),
          apiHelper.get("/vendor-panel/subcategory"),
          apiHelper.get("/vendor-panel/subsubcategory"),
          apiHelper.get("/vendor-panel/brand"),
        ]);

        const catData = (catRes?.data || catRes || []) as any[];
        const subCatData = (subCatRes?.data || subCatRes || []) as any[];
        const subSubCatData = (subSubCatRes?.data ||
          subSubCatRes ||
          []) as any[];
        const brandData = (brandRes?.data || brandRes || []) as any[];

        setCategories(
          catData.map((c) => ({
            id: c.id || c._id,
            name: c.categoryName || c.name,
          })),
        );
        setSubCategories(
          subCatData.map((s) => ({
            id: s.id || s._id,
            name: s.subCategoryName || s.name,
            categoryId:
              typeof s.category === "object" ? s.category?.id : s.categoryId,
          })),
        );
        setSubSubCategories(
          subSubCatData.map((s) => ({
            id: s.id || s._id,
            name: s.subSubCategoryName || s.name,
            subCategoryId:
              typeof s.subCategory === "object"
                ? s.subCategory?.id
                : s.subCategoryId,
          })),
        );
        setBrands(
          brandData.map((b) => ({
            id: b.id || b._id,
            name: b.brandName || b.name,
          })),
        );

        if (isEditMode) {
          await loadProductForEdit();
        }
      } catch (error) {
        console.error("Failed to load dropdown data", error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- cascading dropdowns ----
  useEffect(() => {
    if (!categoryId) {
      setFilteredSubCategories([]);
      return;
    }
    setFilteredSubCategories(
      subCategories.filter(
        (sc) => String(sc.categoryId) === String(categoryId),
      ),
    );
  }, [categoryId, subCategories]);

  useEffect(() => {
    if (!subCategoryId) {
      setFilteredSubSubCategories([]);
      return;
    }
    setFilteredSubSubCategories(
      subSubCategories.filter(
        (ss) => String(ss.subCategoryId) === String(subCategoryId),
      ),
    );
  }, [subCategoryId, subSubCategories]);

  // ---- final price auto-calc ----
  const numericSelling = Number(sellingPrice) || 0;
  const numericTax = Number(tax) || 0;
  const numericDiscount = Number(discount) || 0;

  // Step 1: Add tax
  const taxIncludedPrice = numericSelling + (numericSelling * numericTax) / 100;

  // Step 2: Apply discount after tax
  const finalPrice = (
    taxIncludedPrice -
    (taxIncludedPrice * numericDiscount) / 100
  ).toFixed(2);

  // ---- image handlers ----
  const handleSingleImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "mainImage" | "thumbnailImage",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setValue(field, base64);
    // allow re-selecting the same file again later
    e.target.value = "";
  };

  const removeSingleImage = (
    e: React.MouseEvent,
    field: "mainImage" | "thumbnailImage",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setValue(field, "");
  };

  const handleAdditionalImages = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const current = getValues("additionalImages") || [];
    const remainingSlots = 5 - current.length;
    if (remainingSlots <= 0) {
      toast.error("Maximum 5 additional images allowed");
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    const base64List = await Promise.all(filesToAdd.map(fileToBase64));
    setValue("additionalImages", [...current, ...base64List]);
    e.target.value = "";
  };

  const removeAdditionalImage = (index: number) => {
    const current = getValues("additionalImages") || [];
    setValue(
      "additionalImages",
      current.filter((_, i) => i !== index),
    );
  };

  // ---- tab navigation ----
  const tabIndex = tabs.findIndex((t) => t.key === activeTab);

  const goNext = async () => {
    if (activeTab === "product") {
      const valid = await trigger(["productName", "categoryId"]);
      if (!valid) {
        toast.error("Please fill required fields before continuing");
        return;
      }
    }
    if (tabIndex < tabs.length - 1) setActiveTab(tabs[tabIndex + 1].key);
  };

  const goPrevious = () => {
    if (tabIndex > 0) setActiveTab(tabs[tabIndex - 1].key);
  };

  // ---- submit ----
  const onSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("productName", data.productName);
      formData.append("sku", data.sku);
      formData.append("partNumber", data.partNumber);
      formData.append("oemNumber", data.oemNumber);
      formData.append("countryOfOrigin", data.countryOfOrigin);
      formData.append("categoryId", data.categoryId);
      formData.append("subCategoryId", data.subCategoryId);
      formData.append("subSubCategoryId", data.subSubCategoryId);
      formData.append("brandId", data.brandId);
      formData.append("productType", data.productType);
      formData.append("stock", data.stock);
      formData.append("keywords", data.keywords);
      formData.append("shortDescription", data.shortDescription);

      formData.append(
        "keyFeatures",
        JSON.stringify(
          [
            data.feature1,
            data.feature2,
            data.feature3,
            data.feature4,
            data.feature5,
            data.feature6,
          ].filter(Boolean),
        ),
      );

      formData.append("videoUrl", data.videoUrl);

      formData.append("mrp", String(data.mrp));
      formData.append("sellingPrice", String(data.sellingPrice));
      formData.append("tax", String(data.tax));
      formData.append("discount", String(data.discount));
      formData.append("finalPrice", String(finalPrice));
      formData.append("stockQuantity", String(data.stockQuantity));
      formData.append("barcode", data.barcode);
      formData.append("unit", data.unit);
      formData.append("weight", data.weight);
      formData.append("maxOrderQuantity", String(data.maxOrderQuantity));

      // =========================
      // IMAGES
      // =========================

      if (data.mainImage?.startsWith("data:")) {
        const blob = await (await fetch(data.mainImage)).blob();
        formData.append("mainImage", blob, "main-image.jpg");
      } else if (isEditMode && data.mainImage) {
        // unchanged existing image url
        formData.append("mainImage", data.mainImage);
      }

      if (data.thumbnailImage?.startsWith("data:")) {
        const blob = await (await fetch(data.thumbnailImage)).blob();
        formData.append("thumbnailImage", blob, "thumbnail-image.jpg");
      } else if (isEditMode && data.thumbnailImage) {
        formData.append("thumbnailImage", data.thumbnailImage);
      }

      const existingAdditionalImages: string[] = [];
      for (let i = 0; i < (data.additionalImages || []).length; i++) {
        const img = data.additionalImages[i];

        if (img?.startsWith("data:")) {
          const blob = await (await fetch(img)).blob();
          formData.append("additionalImages", blob, `additional-${i}.jpg`);
        } else if (isEditMode && img) {
          existingAdditionalImages.push(img);
        }
      }
      if (isEditMode) {
        formData.append(
          "existingAdditionalImages",
          JSON.stringify(existingAdditionalImages),
        );
      }

      // =========================
      // ADDITIONAL INFORMATION
      // =========================

      formData.append("productCondition", data.productCondition);
      formData.append("manufacturingDate", data.manufacturingDate);
      formData.append("expiryDate", data.expiryDate);
      formData.append("returnPolicy", data.returnPolicy);
      formData.append("estimatedDeliveryTime", data.estimatedDeliveryTime);
      formData.append("freeShipping", String(data.freeShipping));
      formData.append("warrantyPeriod", data.warrantyPeriod);
      formData.append("warrantyDetails", data.warrantyDetails);

      formData.append(
        "specifications",
        JSON.stringify(
          [1, 2, 3, 4, 5, 6]
            .map((n) => ({
              title: (data as any)[`specTitle${n}`],
              value: (data as any)[`specValue${n}`],
            }))
            .filter((s) => s.title && s.value),
        ),
      );

      // =========================
      // SAVE PRODUCT (create vs update)
      // =========================

      if (isEditMode) {
        await apiHelper.put(`/vendor-panel/product/${id}`, formData);
        toast.success("Product updated successfully!");
      } else {
        await apiHelper.post("/vendor-panel/product", formData);
        toast.success("Product submitted for verification!");
      }

      navigate("/productmaster/product");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} product. Please try again.`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  const handleBack = () => {
    navigate("/productmaster/product");
  };

  if (loadingProduct) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="dark:text-dark-300 text-sm text-gray-500">
          Loading product...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h1>

          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            {isEditMode
              ? "Update your product details"
              : "Create and manage your products"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleBack}
          className="bg-primary-500 hover:bg-primary-600 inline-flex cursor-pointer items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors sm:px-5"
        >
          <ArrowLeftIcon className="mr-1.5 size-4" />
          Back
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Tabs bar */}
        <div className="dark:bg-dark-800 dark:border-dark-700 flex overflow-x-auto rounded-xl border border-gray-200 bg-white">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 border-b-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "dark:text-dark-300 dark:hover:text-dark-100 border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ============================================================ */}
        {/* PRODUCT TAB */}
        {/* ============================================================ */}
        {activeTab === "product" && (
          <div className="dark:bg-dark-800 dark:border-dark-700 mt-6 rounded-xl border border-gray-200 bg-white p-5 md:p-6">
            <div className="dark:border-dark-600 mb-5 flex items-center gap-2 border-b border-gray-100 pb-4">
              <span className="bg-primary-50 dark:bg-dark-600 flex size-9 items-center justify-center rounded-lg">
                <CubeIcon className="text-primary-600 dark:text-primary-400 size-5" />
              </span>
              <h2 className="dark:text-dark-50 text-base font-semibold text-gray-800">
                Product Details
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter product name"
                  {...register("productName", {
                    required: "Product name is required",
                  })}
                  error={errors.productName?.message}
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium">SKU</label>
                  {!isEditMode && (
                    <button
                      type="button"
                      onClick={() => setValue("sku", generateSKU())}
                      className="text-primary-600 dark:text-primary-400 flex items-center gap-1 text-xs font-semibold hover:underline"
                    >
                      <SparklesIcon className="size-3.5" />
                      Generate
                    </button>
                  )}
                </div>
                <Input type="text" {...register("sku")} disabled={isEditMode} />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Part Number
                </label>
                <Input
                  type="text"
                  placeholder="Enter part number"
                  {...register("partNumber")}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  OEM Number
                </label>
                <Input
                  type="text"
                  placeholder="Enter OEM number"
                  {...register("oemNumber")}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Country of Origin
                </label>
                <Controller
                  name="countryOfOrigin"
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={countryOptions}
                      styles={customSelectStyles}
                      classNamePrefix="react-select"
                      placeholder="Search Country"
                      isClearable
                      value={
                        countryOptions.find(
                          (option) => option.value === field.value,
                        ) || null
                      }
                      onChange={(selected) => {
                        field.onChange(selected?.value || "");
                      }}
                    />
                  )}
                />
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium">
                  Category
                </span>
                <Controller
                  name="categoryId"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field, fieldState }) => (
                    <Combobox
                      data={categories}
                      value={
                        categories.find(
                          (c) => String(c.id) === String(field.value),
                        ) || null
                      }
                      displayField="name"
                      searchFields={["name"]}
                      placeholder="Select Category"
                      error={fieldState.error?.message}
                      onChange={(opt: any) => {
                        field.onChange(String(opt.id));
                        setValue("subCategoryId", "");
                        setValue("subSubCategoryId", "");
                      }}
                    />
                  )}
                />
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium">
                  Subcategory
                </span>
                <Controller
                  name="subCategoryId"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      data={filteredSubCategories}
                      value={
                        filteredSubCategories.find(
                          (c) => String(c.id) === String(field.value),
                        ) || null
                      }
                      displayField="name"
                      searchFields={["name"]}
                      placeholder={
                        categoryId
                          ? "Select Subcategory"
                          : "First select category"
                      }
                      onChange={(opt: any) => {
                        field.onChange(String(opt.id));
                        setValue("subSubCategoryId", "");
                      }}
                    />
                  )}
                />
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium">
                  Sub-Subcategory
                </span>
                <Controller
                  name="subSubCategoryId"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      data={filteredSubSubCategories}
                      value={
                        filteredSubSubCategories.find(
                          (c) => String(c.id) === String(field.value),
                        ) || null
                      }
                      displayField="name"
                      searchFields={["name"]}
                      placeholder={
                        subCategoryId
                          ? "Select Sub-Subcategory"
                          : "First select subcategory"
                      }
                      onChange={(opt: any) => field.onChange(String(opt.id))}
                    />
                  )}
                />
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium">Brand</span>
                <Controller
                  name="brandId"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      data={brands}
                      value={
                        brands.find(
                          (b) => String(b.id) === String(field.value),
                        ) || null
                      }
                      displayField="name"
                      searchFields={["name"]}
                      placeholder="Select Brand"
                      onChange={(opt: any) => field.onChange(String(opt.id))}
                    />
                  )}
                />
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium">
                  Product Type
                </span>
                <Controller
                  name="productType"
                  control={control}
                  render={({ field }) => (
                    <Listbox
                      data={productTypeOptions}
                      value={
                        productTypeOptions.find((o) => o.id === field.value) ||
                        productTypeOptions[0]
                      }
                      displayField="name"
                      placeholder="Select Type"
                      onChange={(opt: any) => field.onChange(opt.id)}
                    />
                  )}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-1">
                <label className="mb-1.5 block text-sm font-medium">
                  Keywords
                </label>
                <Input
                  type="text"
                  placeholder="Enter keywords (comma separated)"
                  {...register("keywords")}
                />
              </div>
              <div>
                <span className="mb-1.5 block text-sm font-medium">Stock</span>
                <Controller
                  name="stock"
                  control={control}
                  render={({ field }) => (
                    <Listbox
                      data={stockOptions}
                      value={
                        stockOptions.find((o) => o.id === field.value) ||
                        stockOptions[0]
                      }
                      displayField="name"
                      placeholder="Select Stock"
                      onChange={(opt: any) => field.onChange(opt.id)}
                    />
                  )}
                />
              </div>
            </div>

            {/* Collapsible: Description */}
            <div className="dark:border-dark-600 mt-6 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setShowDescription((v) => !v)}
                className="dark:hover:bg-dark-700/40 flex w-full items-center justify-between rounded-xl px-4 py-3.5 hover:bg-gray-50"
              >
                <span className="dark:text-dark-50 flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <InformationCircleIcon className="text-primary-500 size-5" />
                  Add Product Description
                </span>
                {showDescription ? (
                  <ChevronUpIcon className="size-4 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="size-4 text-gray-400" />
                )}
              </button>

              {showDescription && (
                <div className="dark:border-dark-600 space-y-5 border-t border-gray-200 p-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Short Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter short description"
                      {...register("shortDescription")}
                      className="dark:border-dark-500 dark:bg-dark-800 w-full resize-none rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <span className="mb-2 block text-sm font-medium">
                      Key Features
                    </span>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="flex items-center gap-2">
                          <span className="dark:text-dark-300 w-20 shrink-0 text-sm text-gray-500">
                            Feature {n}:
                          </span>
                          <Input
                            type="text"
                            placeholder={`Enter product feature ${n}`}
                            {...register(`feature${n}` as keyof FormValues)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Product Video URL
                    </label>
                    <Input
                      type="text"
                      placeholder="https://www.youtube.com/watch?v=..."
                      {...register("videoUrl")}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PRICING TAB */}
        {/* ============================================================ */}
        {activeTab === "pricing" && (
          <div className="dark:bg-dark-800 dark:border-dark-700 mt-6 rounded-xl border border-gray-200 bg-white p-5 md:p-6">
            <div className="dark:border-dark-600 mb-5 flex items-center gap-2 border-b border-gray-100 pb-4">
              <span className="dark:bg-dark-600 flex size-9 items-center justify-center rounded-lg bg-green-50">
                <TagIcon className="size-5 text-green-600 dark:text-green-400" />
              </span>
              <h2 className="dark:text-dark-50 text-base font-semibold text-gray-800">
                Pricing & Stock
              </h2>
            </div>

            <div className="dark:border-dark-600 rounded-xl border border-gray-100 p-4">
              <p className="dark:text-dark-200 mb-4 text-sm font-semibold text-gray-700">
                Stock Option 1
              </p>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    MRP
                  </label>
                  <Input type="number" placeholder="0" {...register("mrp")} />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Selling Price (Tax Excluded)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    {...register("sellingPrice")}
                  />
                </div>

                <div>
                  <span className="mb-1.5 block text-sm font-medium">Tax</span>
                  <Controller
                    name="tax"
                    control={control}
                    render={({ field }) => (
                      <Listbox
                        data={taxOptions}
                        value={
                          taxOptions.find((o) => o.id === field.value) ||
                          taxOptions[0]
                        }
                        displayField="name"
                        placeholder="Select tax"
                        onChange={(opt: any) => field.onChange(opt.id)}
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Discount (%)
                  </label>

                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.01"
                    {...register("discount", {
                      min: {
                        value: 0,
                        message: "Discount cannot be negative",
                      },
                      max: {
                        value: 100,
                        message: "Discount cannot exceed 100%",
                      },
                    })}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Final Price (Tax Included & Discounted)
                  </label>
                  <div className="rounded-lg border border-green-300 bg-green-50 px-3.5 py-2.5 text-sm font-semibold text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
                    {finalPrice}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Stock Quantity
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    {...register("stockQuantity")}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Barcode
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter barcode"
                    {...register("barcode")}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Unit
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., pieces, kg, liters"
                    {...register("unit")}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Weight
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., 500g, 1kg"
                    {...register("weight")}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Max Order Quantity
                  </label>
                  <Input
                    type="number"
                    placeholder="1"
                    {...register("maxOrderQuantity")}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* IMAGES TAB */}
        {/* ============================================================ */}
        {activeTab === "images" && (
          <div className="dark:bg-dark-800 dark:border-dark-700 mt-6 rounded-xl border border-gray-200 bg-white p-5 md:p-6">
            <div className="dark:border-dark-600 mb-5 flex items-center gap-2 border-b border-gray-100 pb-4">
              <span className="dark:bg-dark-600 flex size-9 items-center justify-center rounded-lg bg-purple-50">
                <PhotoIcon className="size-5 text-purple-600 dark:text-purple-400" />
              </span>
              <h2 className="dark:text-dark-50 text-base font-semibold text-gray-800">
                Product Images & Media
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Main Image */}
              <div>
                <p className="mb-2 text-sm font-medium">Main Image</p>
                <div className="relative">
                  <label className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/40 p-4 text-center transition-colors hover:bg-blue-50 dark:border-blue-800 dark:bg-blue-950/10">
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt="Main"
                        className="h-full w-full rounded-lg object-contain"
                      />
                    ) : (
                      <>
                        <PhotoIcon className="size-16 text-blue-400" />
                        <div>
                          <p className="text-sm font-semibold text-blue-600">
                            Click to upload main image
                          </p>
                          <p className="dark:text-dark-300 mt-1 text-xs text-gray-500">
                            Recommended: 800×800px, JPG/PNG
                          </p>
                        </div>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => handleSingleImage(e, "mainImage")}
                    />
                  </label>

                  {mainImage && (
                    <button
                      type="button"
                      onClick={(e) => removeSingleImage(e, "mainImage")}
                      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-all hover:scale-110 hover:bg-red-600"
                      title="Remove image"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Thumbnail Image */}
              <div>
                <p className="mb-2 text-sm font-medium">Thumbnail Image</p>
                <div className="relative">
                  <label className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-green-300 bg-green-50/40 p-4 text-center transition-colors hover:bg-green-50 dark:border-green-800 dark:bg-green-950/10">
                    {thumbnailImage ? (
                      <img
                        src={thumbnailImage}
                        alt="Thumbnail"
                        className="h-full w-full rounded-lg object-contain"
                      />
                    ) : (
                      <>
                        <PhotoIcon className="size-16 text-green-400" />
                        <div>
                          <p className="text-sm font-semibold text-green-600">
                            Click to upload thumbnail
                          </p>
                          <p className="dark:text-dark-300 mt-1 text-xs text-gray-500">
                            Recommended: 400×400px, JPG/PNG
                          </p>
                        </div>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => handleSingleImage(e, "thumbnailImage")}
                    />
                  </label>

                  {thumbnailImage && (
                    <button
                      type="button"
                      onClick={(e) => removeSingleImage(e, "thumbnailImage")}
                      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-all hover:scale-110 hover:bg-red-600"
                      title="Remove image"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Additional Images */}
              <div>
                <p className="mb-2 text-sm font-medium">Additional Images</p>

                <div className="aspect-square w-full rounded-xl border-2 border-dashed border-purple-300 bg-purple-50/40 p-3 dark:border-purple-800 dark:bg-purple-950/10">
                  {additionalImages?.length ? (
                    <div className="grid grid-cols-3 gap-3">
                      {additionalImages.map((img, i) => (
                        <div key={i} className="group relative">
                          <img
                            src={img}
                            alt={`Additional ${i + 1}`}
                            className="aspect-square w-full rounded-lg object-cover"
                          />

                          {/* Proper remove icon */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeAdditionalImage(i);
                            }}
                            className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-all hover:scale-110 hover:bg-red-600"
                            title="Remove image"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      {/* Add More Images */}
                      {additionalImages.length < 5 && (
                        <label
                          htmlFor="additional-images-upload"
                          className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-purple-300 bg-white/60 transition-colors hover:bg-purple-50"
                        >
                          <PhotoIcon className="h-10 w-10 text-purple-400" />

                          <span className="mt-2 text-xs font-semibold text-purple-600">
                            Add More
                          </span>

                          <span className="mt-1 text-[10px] text-gray-500">
                            {additionalImages.length}/5
                          </span>
                        </label>
                      )}
                    </div>
                  ) : (
                    /* First image upload */
                    <label
                      htmlFor="additional-images-upload"
                      className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 text-center"
                    >
                      <PhotoIcon className="h-16 w-16 text-purple-400" />

                      <div>
                        <p className="text-sm font-semibold text-purple-600">
                          Click to upload additional images
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Multiple images allowed (Max 5 images)
                        </p>
                      </div>
                    </label>
                  )}

                  {/* File input OUTSIDE label */}
                  <input
                    id="additional-images-upload"
                    type="file"
                    accept="image/*"
                    hidden
                    multiple
                    onChange={handleAdditionalImages}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ADDITIONAL TAB */}
        {/* ============================================================ */}
        {activeTab === "additional" && (
          <div className="dark:bg-dark-800 dark:border-dark-700 mt-6 rounded-xl border border-gray-200 bg-white p-5 md:p-6">
            <div className="dark:border-dark-600 mb-5 flex items-center gap-2 border-b border-gray-100 pb-4">
              <span className="dark:bg-dark-600 flex size-9 items-center justify-center rounded-lg bg-yellow-50">
                <Cog6ToothIcon className="size-5 text-yellow-600 dark:text-yellow-400" />
              </span>
              <h2 className="dark:text-dark-50 text-base font-semibold text-gray-800">
                Additional Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <span className="mb-1.5 block text-sm font-medium">
                  Product Condition
                </span>
                <Controller
                  name="productCondition"
                  control={control}
                  render={({ field }) => (
                    <Listbox
                      data={productConditionOptions}
                      value={
                        productConditionOptions.find(
                          (o) => o.id === field.value,
                        ) || productConditionOptions[0]
                      }
                      displayField="name"
                      placeholder="Select condition"
                      onChange={(opt: any) => field.onChange(opt.id)}
                    />
                  )}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Manufacturing Date
                </label>
                <Controller
                  name="manufacturingDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      options={{ disableMobile: true }}
                      onChange={(date: any) => field.onChange(date)}
                      placeholder="Select manufacturing date"
                    />
                  )}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Expiry Date
                </label>
                <Controller
                  name="expiryDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      options={{ disableMobile: true }}
                      onChange={(date: any) => field.onChange(date)}
                      placeholder="Select expiry date"
                    />
                  )}
                />
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium">
                  Return Policy
                </span>
                <Controller
                  name="returnPolicy"
                  control={control}
                  render={({ field }) => (
                    <Listbox
                      data={returnPolicyOptions}
                      value={
                        returnPolicyOptions.find((o) => o.id === field.value) ||
                        null
                      }
                      displayField="name"
                      placeholder="Select Return Policy"
                      onChange={(opt: any) => field.onChange(opt.id)}
                    />
                  )}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Estimated Delivery Time
                </label>
                <Input
                  type="text"
                  placeholder="e.g., 3-5 business days"
                  {...register("estimatedDeliveryTime")}
                />
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium">
                  Free Shipping
                </span>
                <button
                  type="button"
                  onClick={() => setValue("freeShipping", !freeShipping)}
                  className="dark:border-dark-500 flex w-full items-center justify-between rounded-lg border border-gray-300 px-3.5 py-2.5"
                >
                  <div className="text-left">
                    <p className="text-sm font-medium">Free Shipping</p>
                    <p className="dark:text-dark-300 text-xs text-gray-500">
                      {freeShipping ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  <span
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      freeShipping
                        ? "bg-primary-500"
                        : "dark:bg-dark-600 bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                        freeShipping ? "left-5.5" : "left-0.5"
                      }`}
                    />
                  </span>
                </button>
              </div>
            </div>

            {/* Warranty */}
            <div className="dark:border-dark-600 mt-6 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setShowWarranty((v) => !v)}
                className="dark:hover:bg-dark-700/40 flex w-full items-center justify-between rounded-xl px-4 py-3.5 hover:bg-gray-50"
              >
                <span className="dark:text-dark-50 flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <CheckBadgeIcon className="size-5 text-green-500" />
                  Add Warranty Information
                </span>
                {showWarranty ? (
                  <ChevronUpIcon className="size-4 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="size-4 text-gray-400" />
                )}
              </button>

              {showWarranty && (
                <div className="dark:border-dark-600 grid grid-cols-1 gap-4 border-t border-gray-200 p-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Warranty Period
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., 1 Year"
                      {...register("warrantyPeriod")}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Warranty Details
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Manufacturer warranty"
                      {...register("warrantyDetails")}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="dark:border-dark-600 mt-4 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setShowSpecifications((v) => !v)}
                className="dark:hover:bg-dark-700/40 flex w-full items-center justify-between rounded-xl px-4 py-3.5 hover:bg-gray-50"
              >
                <span className="dark:text-dark-50 flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <InformationCircleIcon className="size-5 text-purple-500" />
                  Add Product Specifications
                </span>
                {showSpecifications ? (
                  <ChevronUpIcon className="size-4 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="size-4 text-gray-400" />
                )}
              </button>

              {showSpecifications && (
                <div className="dark:border-dark-600 border-t border-gray-200 p-4">
                  <p className="dark:text-dark-200 mb-4 text-sm font-semibold text-gray-700">
                    Product Specifications
                  </p>
                  <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <p className="dark:text-dark-300 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        Specification Titles
                      </p>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n}>
                          <label className="dark:text-dark-300 mb-1 block text-xs text-gray-500">
                            Title {n}
                          </label>
                          <Input
                            type="text"
                            placeholder={`Enter specification ${n}`}
                            {...register(`specTitle${n}` as keyof FormValues)}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <p className="dark:text-dark-300 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        Specification Values
                      </p>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n}>
                          <label className="dark:text-dark-300 mb-1 block text-xs text-gray-500">
                            Value {n}
                          </label>
                          <Input
                            type="text"
                            placeholder={`Enter value ${n}`}
                            {...register(`specValue${n}` as keyof FormValues)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

       
        <div className="dark:bg-dark-800 dark:border-dark-700 mt-6 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outlined"
              color="neutral"
              onClick={goPrevious}
              disabled={tabIndex === 0}
              className="flex w-full items-center justify-center gap-1 sm:w-auto"
            >
              <ChevronLeftIcon className="size-4" />
              Previous
            </Button>

            {tabIndex < tabs.length - 1 ? (
              <Button
                type="button"
                color="primary"
                onClick={goNext}
                className="flex w-full items-center justify-center gap-1 sm:w-auto"
              >
                Next
                <ChevronRightIcon className="size-4" />
              </Button>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outlined"
                  color="neutral"
                  onClick={() => setActiveTab("product")}
                  className="w-full sm:w-auto"
                >
                  View All Sections
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={submitting}
                  className="w-full sm:w-auto"
                >
                  {submitting
                    ? isEditMode
                      ? "Updating..."
                      : "Submitting..."
                    : isEditMode
                      ? "Update Product"
                      : "Submit for Verification"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
