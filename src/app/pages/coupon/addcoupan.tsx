import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ArrowLeft } from "lucide-react";
import { Switch } from "@headlessui/react";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { toast } from "sonner";
import apiHelper from "../../../utils/apiHelper";
import { Combobox } from "@/components/shared/form/Combobox";

// ================================
// OPTIONS
// ================================

const COUPON_TYPE_OPTIONS = [
  { id: "PERCENTAGE", name: "percentage" },
  { id: "FIXED", name: "fixed" },
];

const APPLY_ON_OPTIONS = [
  { id: "ALL_PRODUCTS", name: "all_products" },
  { id: "SPECIFIC_PRODUCTS", name: "specific_products" },
];

// ================================
// DATE HELPERS (timezone-safe)
// ================================

/**
 * Converts a Date object OR an ISO string (from backend, e.g.
 * "2026-09-07T18:30:00.000Z") into a plain "YYYY-MM-DD" string
 * using the browser's LOCAL calendar date (not UTC).
 *
 * This is the key fix: using .slice(0, 10) on a UTC ISO string
 * gives the UTC date, which can be one day off from the date the
 * user actually picked (e.g. IST is UTC+5:30, so midnight IST on
 * 08-Sep becomes 18:30 UTC on 07-Sep — slicing gives "07", not "08").
 */
const toLocalDateStr = (value: Date | string | null | undefined): string => {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ================================
// VALIDATION SCHEMA
// ================================

// ================================
// VALIDATION SCHEMA
// ================================

const schema = yup.object({
  couponType: yup
    .string()
    .oneOf(["PERCENTAGE", "FIXED"])
    .required("Coupon type is required"),

  title: yup
    .string()
    .trim()
    .required("Title is required"),

  code: yup
    .string()
    .trim()
    .uppercase()
    .matches(
      /^[A-Z0-9]+$/,
      "Only letters and numbers allowed (no spaces or symbols)"
    )
    .required("Coupon code is required"),

  limitPerUser: yup
    .number()
    .typeError("Limit per user is required")
    .min(1, "Must be at least 1")
    .required("Limit per user is required"),

  maxUsageCount: yup
    .number()
    .typeError("Must be a number")
    .min(1, "Must be at least 1")
    .nullable()
    .optional()
    .transform((value, originalValue) =>
      originalValue === "" ? null : value
    ),

  minOrderValue: yup
    .number()
    .typeError("Min order value is required")
    .min(0, "Cannot be negative")
    .required("Min order value is required"),

  discountValue: yup
    .number()
    .typeError("Discount value is required")
    .positive("Must be greater than 0")
    .required("Discount value is required")
    .when("couponType", {
      is: "PERCENTAGE",
      then: (s) =>
        s.max(100, "Percentage cannot exceed 100"),
    }),

  maxDiscountAmount: yup
    .number()
    .typeError("Must be a number")
    .min(0, "Cannot be negative")
    .nullable()
    .optional()
    .transform((value, originalValue) =>
      originalValue === "" ? null : value
    ),

  startDate: yup
    .string()
    .required("Start date is required"),

  expiryDate: yup
    .string()
    .required("Expiry date is required")
    .test(
      "is-after-start",
      "Expiry date must be after start date",
      function (value) {
        const { startDate } = this.parent;

        if (!startDate || !value) return true;

        return new Date(value) >= new Date(startDate);
      }
    ),

  applyOn: yup
    .string()
    .oneOf(["ALL_PRODUCTS", "SPECIFIC_PRODUCTS"])
    .required("Apply on is required"),

  applyOnIds: yup
    .array()
    .of(yup.number())
    .optional()
    .default([])
    .when("applyOn", {
      is: "SPECIFIC_PRODUCTS",
      then: (s) =>
        s.min(1, "Please select at least one product"),
    }),

  displayMessage: yup
    .string()
    .trim()
    .optional(),

  isActive: yup
    .boolean()
    .required(),
});



type FormValues = {
  couponType: "PERCENTAGE" | "FIXED";
  title: string;
  code: string;
  limitPerUser: number;
  maxUsageCount: number | null | undefined;
  minOrderValue: number;
  discountValue: number | undefined;
  maxDiscountAmount: number | null | undefined;
  startDate: string;
  expiryDate: string;
  applyOn: "ALL_PRODUCTS" | "SPECIFIC_PRODUCTS";
  applyOnIds: number[];
  displayMessage: string;
  isActive: boolean;
};

// ================================
// COMPONENT
// ================================

const AddCoupon = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [submitting, setSubmitting] = useState(false);
  const [loadingCoupon, setLoadingCoupon] = useState(isEditMode);
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

const {
  control,
  register,
  handleSubmit,
  watch,
  setValue,
  reset,
  formState: { errors },
} = useForm<FormValues>({
 resolver: yupResolver(schema) as any,
 defaultValues: {
  couponType: "PERCENTAGE",
  title: "",
  code: "",
  limitPerUser: 1,
  maxUsageCount: null,
  minOrderValue: 0,
  discountValue: 0,
  maxDiscountAmount: null,
  startDate: "",
  expiryDate: "",
  applyOn: "ALL_PRODUCTS",
  applyOnIds: [],
  displayMessage: "",
  isActive: true,
},
});

  const couponType = watch("couponType");
  const isActive = watch("isActive");
  const applyOn = watch("applyOn");
  const applyOnIds = (watch("applyOnIds") || []) as number[];

  const toggleApplyOnId = (pid: number) => {
    const next = applyOnIds.includes(pid)
      ? applyOnIds.filter((v) => v !== pid)
      : [...applyOnIds, pid];
    setValue("applyOnIds", next, { shouldValidate: true });
  };

  // ---- load products (needed for the SPECIFIC_PRODUCTS picker) ----
  useEffect(() => {
    (async () => {
      try {
        const res = await apiHelper.get("/vendor-panel/product");
        const prodData = (res?.data || res || []) as any[];
        setProducts(
          prodData.map((p) => ({ id: p.id, name: p.productName || p.name })),
        );
      } catch (err) {
        console.error("Failed to load products for coupon", err);
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, []);

  // ---- edit mode: load existing coupon and prefill the form ----
  useEffect(() => {
    if (!isEditMode) return;

    (async () => {
      try {
        const res = await apiHelper.get(`/vendor-panel/coupons/${id}`);
        const c = res?.coupon || res?.data || res;

        reset({
          couponType: c.type,
          title: c.title || "",
          code: c.code || "",
          limitPerUser: c.perUserLimit ?? 1,
          maxUsageCount: c.usageLimit ?? null,
          minOrderValue: Number(c.minOrderValue) || 0,
          discountValue: Number(c.discountValue),
       maxDiscountAmount:
  c.maxDiscountAmount !== null &&
  c.maxDiscountAmount !== undefined
    ? Number(c.maxDiscountAmount)
    : null,
          // FIX: use local-timezone date extraction instead of
          // c.startDate.slice(0, 10) which read the raw UTC date
          // and was off by one day in IST.
          startDate: toLocalDateStr(c.startDate),
          expiryDate: toLocalDateStr(c.endDate),
          applyOn: c.applyOn || "ALL_PRODUCTS",
          applyOnIds: (c.products || []).map((cp: any) => cp.productId),
          displayMessage: c.displayMessage || "",
          isActive: c.status !== "INACTIVE",
        });
      } catch (err: any) {
        console.error("Failed to load coupon", err);
        toast.error("Failed to load coupon");
        navigate(-1);
      } finally {
        setLoadingCoupon(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      const payload = {
        ...values,
        code: values.code.toUpperCase(),
        // FIX: always send plain YYYY-MM-DD strings, never raw Date
        // objects. Date objects get JSON.stringify'd via
        // toISOString() (UTC midnight), which is what caused the
        // drift in the first place. The backend should interpret
        // these as calendar dates (ideally store as DATE, not
        // TIMESTAMPTZ).
        startDate: toLocalDateStr(values.startDate as any),
        expiryDate: toLocalDateStr(values.expiryDate as any),
        status: values.isActive ? "ACTIVE" : "INACTIVE",
      };

      const data = isEditMode
        ? await apiHelper.put(`/vendor-panel/coupons/${id}`, payload)
        : await apiHelper.post("/vendor-panel/coupons", payload);

      if (data.success) {
        toast.success(isEditMode ? "Coupon updated successfully" : "Coupon created successfully");
        navigate(-1);
      } else {
        toast.error(data.message || `Failed to ${isEditMode ? "update" : "create"} coupon`);
      }
    } catch (err: any) {
      console.error("saveCoupon error:", err);
      toast.error(
        err.response?.data?.message || `Failed to ${isEditMode ? "update" : "create"} coupon`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCoupon) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="dark:text-dark-300 text-sm text-gray-500">Loading coupon...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 p-4 pb-28 text-gray-900 md:p-6 dark:text-gray-100">
      {/* HEADER */}
      <div className="mb-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="dark:bg-dark-800 dark:border-dark-600 dark:hover:bg-dark-700 inline-flex size-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-300 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl dark:text-white">
            {isEditMode ? "Edit Coupon" : "Add Coupon"}
          </h1>
          <p className="dark:text-dark-300 mt-0.5 text-sm text-gray-500">
            {isEditMode ? "Update your discount coupon" : "Create a new discount coupon"}
          </p>
        </div>
      </div>

      {/* FORM CARD */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="dark:bg-dark-800 dark:border-dark-700 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
          {/* Coupon Type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Coupon Type <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="couponType"
              render={({ field }) => (
                <Combobox
                  data={COUPON_TYPE_OPTIONS}
                  value={COUPON_TYPE_OPTIONS.find((o) => o.id === field.value)}
                  displayField="name"
                  placeholder="Select coupon type"
                  onChange={(opt: any) => field.onChange(opt.id)}
                />
              )}
            />
            {errors.couponType && (
              <p className="mt-1 text-xs text-red-500">{errors.couponType.message}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter coupon title"
              {...register("title")}
              className="dark:border-dark-500 dark:bg-dark-700 focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:ring-1 dark:text-gray-200"
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          {/* Coupon Code */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Coupon Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., SAVE20"
              {...register("code")}
              className="dark:border-dark-500 dark:bg-dark-700 focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 uppercase outline-none placeholder:text-gray-400 focus:ring-1 dark:text-gray-200"
            />
            {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>}
          </div>

          {/* Limit Per User */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Limit Per User <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              placeholder="1"
              {...register("limitPerUser")}
              className="dark:border-dark-500 dark:bg-dark-700 focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:ring-1 dark:text-gray-200"
            />
            {errors.limitPerUser && (
              <p className="mt-1 text-xs text-red-500">{errors.limitPerUser.message}</p>
            )}
          </div>

          {/* Max Usage Count */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Max Usage Count
            </label>
            <input
              type="number"
              min={1}
              placeholder="Leave empty for unlimited"
              {...register("maxUsageCount")}
              className="dark:border-dark-500 dark:bg-dark-700 focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:ring-1 dark:text-gray-200"
            />
            {errors.maxUsageCount && (
              <p className="mt-1 text-xs text-red-500">{errors.maxUsageCount.message}</p>
            )}
          </div>

          {/* Min Order Value */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Min Order Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              placeholder="0"
              {...register("minOrderValue")}
              className="dark:border-dark-500 dark:bg-dark-700 focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:ring-1 dark:text-gray-200"
            />
            {errors.minOrderValue && (
              <p className="mt-1 text-xs text-red-500">{errors.minOrderValue.message}</p>
            )}
          </div>

          {/* Discount Value */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {couponType === "PERCENTAGE" ? "Discount Percentage * (%)" : "Discount Amount * (₹)"}
            </label>
            <input
              type="number"
              min={0}
              max={couponType === "PERCENTAGE" ? 100 : undefined}
              placeholder={couponType === "PERCENTAGE" ? "e.g., 10" : "e.g., 100"}
              {...register("discountValue")}
              className="dark:border-dark-500 dark:bg-dark-700 focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:ring-1 dark:text-gray-200"
            />
            {errors.discountValue && (
              <p className="mt-1 text-xs text-red-500">{errors.discountValue.message}</p>
            )}
          </div>

          {/* Max Discount Amount — only relevant for percentage type */}
          {couponType === "PERCENTAGE" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Max Discount Amount
              </label>
              <input
                type="number"
                min={0}
                placeholder="Optional cap"
                {...register("maxDiscountAmount")}
                className="dark:border-dark-500 dark:bg-dark-700 focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:ring-1 dark:text-gray-200"
              />
              {errors.maxDiscountAmount && (
                <p className="mt-1 text-xs text-red-500">{errors.maxDiscountAmount.message}</p>
              )}
            </div>
          )}

          {/* Start Date */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  options={{ disableMobile: true }}
                  onChange={(date: any) => {
                    // FIX: normalize to a plain local YYYY-MM-DD
                    // string immediately, so no Date object with a
                    // hidden UTC offset ever enters form state.
                    const picked = Array.isArray(date) ? date[0] : date;
                    field.onChange(toLocalDateStr(picked));
                  }}
                  placeholder="Select start date"
                />
              )}
            />
            {errors.startDate && (
              <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>
            )}
          </div>

          {/* Expiry Date */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="expiryDate"
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  options={{ disableMobile: true }}
                  onChange={(date: any) => {
                    const picked = Array.isArray(date) ? date[0] : date;
                    field.onChange(toLocalDateStr(picked));
                  }}
                  placeholder="Select expiry date"
                />
              )}
            />
            {errors.expiryDate && (
              <p className="mt-1 text-xs text-red-500">{errors.expiryDate.message}</p>
            )}
          </div>

          {/* Apply On */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Apply On <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="applyOn"
              render={({ field }) => (
                <Combobox
                  data={APPLY_ON_OPTIONS}
                  value={APPLY_ON_OPTIONS.find((o) => o.id === field.value)}
                  displayField="name"
                  placeholder="Select where this applies"
                  onChange={(opt: any) => {
                    field.onChange(opt.id);
                    setValue("applyOnIds", []);
                  }}
                />
              )}
            />
            {errors.applyOn && (
              <p className="mt-1 text-xs text-red-500">{errors.applyOn.message}</p>
            )}
          </div>

          {/* Product picker — only for SPECIFIC_PRODUCTS */}
          {applyOn === "SPECIFIC_PRODUCTS" && (
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Products <span className="text-red-500">*</span>
              </label>

              {loadingProducts ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : (
                <div className="dark:border-dark-500 dark:bg-dark-700 max-h-56 space-y-2 overflow-y-auto rounded-lg border border-gray-300 bg-white p-3">
                  {products.length === 0 ? (
                    <p className="text-sm text-gray-500">No products found.</p>
                  ) : (
                    products.map((item) => (
                      <label
                        key={item.id}
                        className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
                      >
                        <input
                          type="checkbox"
                          checked={applyOnIds.includes(item.id)}
                          onChange={() => toggleApplyOnId(item.id)}
                          className="accent-primary-500 h-4 w-4"
                        />
                        {item.name}
                      </label>
                    ))
                  )}
                </div>
              )}
              {errors.applyOnIds && (
                <p className="mt-1 text-xs text-red-500">
                  {(errors.applyOnIds as any)?.message}
                </p>
              )}
            </div>
          )}

          {/* Display Message */}
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Display Message (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Custom message to display with this coupon"
              {...register("displayMessage")}
              className="dark:border-dark-500 dark:bg-dark-700 focus:border-primary-500 focus:ring-primary-500 w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:ring-1 dark:text-gray-200"
            />
          </div>

          {/* Active Toggle */}
          <div className="dark:border-dark-700 flex items-center gap-3 border-t border-gray-200 pt-5 md:col-span-2">
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  className={`${
                    field.value ? "bg-primary-500" : "dark:bg-dark-600 bg-gray-300"
                  } relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors`}
                >
                  <span
                    className={`${
                      field.value ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              )}
            />
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {isActive ? "Active" : "Inactive"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enable this coupon to make it available for use
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="dark:border-dark-700 mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="dark:border-dark-600 dark:hover:bg-dark-700 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary-500 hover:bg-primary-600 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
                ? "Update Coupon"
                : "Create Coupon"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCoupon;