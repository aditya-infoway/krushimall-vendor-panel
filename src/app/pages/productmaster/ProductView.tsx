import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  CubeIcon,
  TagIcon,
  PhotoIcon,
  Cog6ToothIcon,
  CheckBadgeIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import apiHelper from "@/utils/apiHelper";
import { toast } from "sonner";

// ============================================================
// TYPES
// ============================================================

type TabKey = "product" | "pricing" | "images" | "additional";

const tabs: { key: TabKey; label: string }[] = [
  { key: "product", label: "Product" },
  { key: "pricing", label: "Pricing" },
  { key: "images", label: "Images" },
  { key: "additional", label: "Additional" },
];

type SpecItem = { title: string; value: string };

type ProductDetail = {
  id: number;
  productName: string;
  sku: string;
  partNumber: string;
  oemNumber: string;
  countryOfOrigin: string;
  category: {
    id: number;
    name?: string;
    categoryName?: string;
  } | null;

  subCategory: {
    id: number;
    name?: string;
    subCategoryName?: string;
  } | null;

  subSubCategory: {
    id: number;
    name?: string;
    subSubCategoryName?: string;
  } | null;

  brand: {
    id: number;
    name?: string;
    brandName?: string;
  } | null;
  productType: string;
  keywords: string;
  shortDescription: string;
  keyFeatures: string[];
  videoUrl: string;
  stock: string;

  mrp: number;
  sellingPrice: number;
  tax: number;
  discount: number;
  finalPrice: number;
  stockQuantity: number;
  barcode: string;
  unit: string;
  weight: string;
  maxOrderQuantity: number;

  mainImage: string;
  thumbnailImage: string;
  additionalImages: string[];

  productCondition: string;
  manufacturingDate: string;
  expiryDate: string;
  returnPolicy: string;
  estimatedDeliveryTime: string;
  freeShipping: boolean;
  warrantyPeriod: string;
  warrantyDetails: string;
  specifications: SpecItem[];

  verificationStatus: string;
  status: string;
  createdAt: string;
};

// ============================================================
// SMALL DISPLAY HELPERS
// ============================================================

const Field = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <div>
    <p className="dark:text-dark-300 mb-1 text-xs font-medium text-gray-500">
      {label}
    </p>
    <p className="dark:text-dark-50 text-sm font-medium text-gray-800">
      {value === "" || value === null || value === undefined ? "—" : value}
    </p>
  </div>
);

const SectionHeader = ({
  icon,
  title,
  iconBg,
}: {
  icon: React.ReactNode;
  title: string;
  iconBg: string;
}) => (
  <div className="dark:border-dark-600 mb-5 flex items-center gap-2 border-b border-gray-100 pb-4">
    <span
      className={`dark:bg-dark-600 flex size-9 items-center justify-center rounded-lg ${iconBg}`}
    >
      {icon}
    </span>
    <h2 className="dark:text-dark-50 text-base font-semibold text-gray-800">
      {title}
    </h2>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    APPROVED:
      "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400",
    PENDING:
      "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
    REJECTED: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        map[status] ||
        "dark:bg-dark-600 dark:text-dark-200 bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

const formatPrice = (value?: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

// ============================================================
// COMPONENT
// ============================================================

export default function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("product");

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await apiHelper.get(`/vendor-panel/product/${id}`);
      const p = res?.data?.product || res?.product || res?.data || res;

      const keyFeatures: string[] = p.keyFeatures
        ? typeof p.keyFeatures === "string"
          ? JSON.parse(p.keyFeatures)
          : p.keyFeatures
        : [];

      const specifications: SpecItem[] = p.specifications
        ? typeof p.specifications === "string"
          ? JSON.parse(p.specifications)
          : p.specifications
        : [];

      setProduct({
        id: p.id,
        productName: p.productName || p.name || "",
        sku: p.sku || "",
        partNumber: p.partNumber || "",
        oemNumber: p.oemNumber || "",
        countryOfOrigin: p.countryOfOrigin || "",
        category: p.category || null,
        subCategory: p.subCategory || null,
        subSubCategory: p.subSubCategory || null,
        brand: p.brand || null,
        productType: p.productType || "SIMPLE",
        keywords: p.keywords || "",
        shortDescription: p.shortDescription || "",
        keyFeatures: keyFeatures.filter(Boolean),
        videoUrl: p.videoUrl || "",
        stock: p.stock || "",

        mrp: Number(p.mrp) || 0,
        sellingPrice: Number(p.sellingPrice) || 0,
        tax: Number(p.tax) || 0,
        discount: Number(p.discount) || 0,
        finalPrice: Number(p.finalPrice) || 0,
        stockQuantity: Number(p.stockQuantity) || 0,
        barcode: p.barcode || "",
        unit: p.unit || "",
        weight: p.weight || "",
        maxOrderQuantity: Number(p.maxOrderQuantity) || 1,

        mainImage: apiHelper.getImageUrl(p.mainImage) || "",
        thumbnailImage: apiHelper.getImageUrl(p.thumbnailImage) || "",
        additionalImages: (p.additionalImages || []).map((img: string) =>
          apiHelper.getImageUrl(img),
        ),

        productCondition: p.productCondition || "NEW",
        manufacturingDate: p.manufacturingDate || "",
        expiryDate: p.expiryDate || "",
        returnPolicy: p.returnPolicy || "",
        estimatedDeliveryTime: p.estimatedDeliveryTime || "",
        freeShipping: Boolean(p.freeShipping),
        warrantyPeriod: p.warrantyPeriod || "",
        warrantyDetails: p.warrantyDetails || "",
        specifications: specifications.filter((s) => s.title || s.value),

        verificationStatus: p.verificationStatus || "PENDING",
        status: p.status || "ACTIVE",
        createdAt: p.createdAt
          ? new Date(p.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "",
      });
    } catch (error) {
      console.error("Failed to load product", error);
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate("/productmaster/product");
  const handleEdit = () => navigate(`/productmaster/edit-product/${id}`);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="dark:text-dark-300 text-sm text-gray-500">
          Loading product...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="dark:text-dark-300 text-sm text-gray-500">
          Product not found.
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="bg-primary-500 hover:bg-primary-600 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
        >
          <ArrowLeftIcon className="mr-1.5 size-4" />
          Back to Product List
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 p-4 pb-16 text-gray-900 md:p-6 dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
              {product.productName}
            </h1>
            <StatusBadge status={product.verificationStatus} />
          </div>
          <p className="dark:text-dark-300 mt-1 text-sm text-gray-500">
            SKU: {product.sku} • Added on {product.createdAt}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <ArrowLeftIcon className="mr-1.5 size-4" />
            Back
          </button>
          <button
            type="button"
            onClick={handleEdit}
            className="bg-primary-500 hover:bg-primary-600 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            <PencilSquareIcon className="mr-1.5 size-4" />
            Edit
          </button>
        </div>
      </div>

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
        <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white p-5 md:p-6">
          <SectionHeader
            icon={
              <CubeIcon className="text-primary-600 dark:text-primary-400 size-5" />
            }
            title="Product Details"
            iconBg="bg-primary-50"
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Product Name" value={product.productName} />
            <Field label="SKU" value={product.sku} />
            <Field label="Part Number" value={product.partNumber} />
            <Field label="OEM Number" value={product.oemNumber} />
            <Field label="Country of Origin" value={product.countryOfOrigin} />
            <Field
              label="Category"
              value={product.category?.categoryName || product.category?.name}
            />

            <Field
              label="Subcategory"
              value={
                product.subCategory?.subCategoryName ||
                product.subCategory?.name
              }
            />

            <Field
              label="Sub-Subcategory"
              value={
                product.subSubCategory?.subSubCategoryName ||
                product.subSubCategory?.name
              }
            />

            <Field
              label="Brand"
              value={product.brand?.brandName || product.brand?.name}
            />
            <Field
              label="Product Type"
              value={product.productType === "VARIABLE" ? "Variable" : "Simple"}
            />
            <Field label="Keywords" value={product.keywords} />
            <Field label="Stock" value={product.stock?.replace(/_/g, " ")} />
          </div>

          {/* Description */}
          <div className="dark:border-dark-600 mt-6 rounded-xl border border-gray-200 p-4">
            <span className="dark:text-dark-50 mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <InformationCircleIcon className="text-primary-500 size-5" />
              Description
            </span>

            <div className="space-y-5">
              <Field
                label="Short Description"
                value={product.shortDescription}
              />

              {product.keyFeatures.length > 0 && (
                <div>
                  <p className="dark:text-dark-300 mb-2 text-xs font-medium text-gray-500">
                    Key Features
                  </p>
                  <ul className="dark:text-dark-50 list-inside list-disc space-y-1 text-sm text-gray-800">
                    {product.keyFeatures.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {product.videoUrl && (
                <Field label="Product Video URL" value={product.videoUrl} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PRICING TAB */}
      {/* ============================================================ */}
      {activeTab === "pricing" && (
        <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white p-5 md:p-6">
          <SectionHeader
            icon={
              <TagIcon className="size-5 text-green-600 dark:text-green-400" />
            }
            title="Pricing & Stock"
            iconBg="bg-green-50"
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Field label="MRP" value={formatPrice(product.mrp)} />
            <Field
              label="Selling Price (Tax Excluded)"
              value={formatPrice(product.sellingPrice)}
            />
            <Field label="Tax" value={`${product.tax}% GST`} />
            <Field label="Discount" value={`${product.discount}%`} />

            <div>
              <p className="dark:text-dark-300 mb-1 text-xs font-medium text-gray-500">
                Final Price (Tax Included & Discounted)
              </p>
              <div className="inline-block rounded-lg border border-green-300 bg-green-50 px-3.5 py-1.5 text-sm font-semibold text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
                {formatPrice(product.finalPrice)}
              </div>
            </div>

            <Field label="Stock Quantity" value={product.stockQuantity} />
            <Field label="Barcode" value={product.barcode} />
            <Field label="Unit" value={product.unit} />
            <Field label="Weight" value={product.weight} />
            <Field
              label="Max Order Quantity"
              value={product.maxOrderQuantity}
            />
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* IMAGES TAB */}
      {/* ============================================================ */}
      {activeTab === "images" && (
        <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white p-5 md:p-6">
          <SectionHeader
            icon={
              <PhotoIcon className="size-5 text-purple-600 dark:text-purple-400" />
            }
            title="Product Images & Media"
            iconBg="bg-purple-50"
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <p className="mb-2 text-sm font-medium">Main Image</p>
              <div className="dark:border-dark-600 dark:bg-dark-700 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                {product.mainImage ? (
                  <img
                    src={product.mainImage}
                    alt="Main"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <PhotoIcon className="size-16 text-gray-300" />
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Thumbnail Image</p>
              <div className="dark:border-dark-600 dark:bg-dark-700 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                {product.thumbnailImage ? (
                  <img
                    src={product.thumbnailImage}
                    alt="Thumbnail"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <PhotoIcon className="size-16 text-gray-300" />
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Additional Images</p>
              <div className="dark:border-dark-600 dark:bg-dark-700 aspect-square w-full rounded-xl border border-gray-200 bg-gray-50 p-3">
                {product.additionalImages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {product.additionalImages.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Additional ${i + 1}`}
                        className="aspect-square w-full rounded-lg object-cover"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <PhotoIcon className="size-16 text-gray-300" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADDITIONAL TAB */}
      {/* ============================================================ */}
      {activeTab === "additional" && (
        <div className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white p-5 md:p-6">
          <SectionHeader
            icon={
              <Cog6ToothIcon className="size-5 text-yellow-600 dark:text-yellow-400" />
            }
            title="Additional Information"
            iconBg="bg-yellow-50"
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Product Condition"
              value={
                product.productCondition.charAt(0) +
                product.productCondition.slice(1).toLowerCase()
              }
            />
            <Field
              label="Manufacturing Date"
              value={product.manufacturingDate}
            />
            <Field label="Expiry Date" value={product.expiryDate} />
            <Field
              label="Return Policy"
              value={
                product.returnPolicy
                  ? product.returnPolicy === "NONE"
                    ? "No Return"
                    : `${product.returnPolicy.replace("DAYS_", "")} Days Return`
                  : "—"
              }
            />
            <Field
              label="Estimated Delivery Time"
              value={product.estimatedDeliveryTime}
            />
            <div>
              <p className="dark:text-dark-300 mb-1 text-xs font-medium text-gray-500">
                Free Shipping
              </p>
              <span
                className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                  product.freeShipping
                    ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                    : "dark:bg-dark-600 dark:text-dark-200 bg-gray-100 text-gray-600"
                }`}
              >
                {product.freeShipping ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>

          {/* Warranty */}
          {(product.warrantyPeriod || product.warrantyDetails) && (
            <div className="dark:border-dark-600 mt-6 rounded-xl border border-gray-200 p-4">
              <span className="dark:text-dark-50 mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                <CheckBadgeIcon className="size-5 text-green-500" />
                Warranty Information
              </span>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Warranty Period" value={product.warrantyPeriod} />
                <Field
                  label="Warranty Details"
                  value={product.warrantyDetails}
                />
              </div>
            </div>
          )}

          {/* Specifications */}
          {product.specifications.length > 0 && (
            <div className="dark:border-dark-600 mt-4 rounded-xl border border-gray-200 p-4">
              <span className="dark:text-dark-50 mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                <InformationCircleIcon className="size-5 text-purple-500" />
                Product Specifications
              </span>
              <div className="dark:divide-dark-600 divide-y divide-gray-100">
                {product.specifications.map((s, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-2 gap-4 py-2.5 text-sm"
                  >
                    <span className="dark:text-dark-300 font-medium text-gray-500">
                      {s.title}
                    </span>
                    <span className="dark:text-dark-50 text-gray-800">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
