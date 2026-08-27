import { useState, useRef, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
// import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Checkbox } from "@/components/ui/Form/Checkbox";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Timepicker } from "@/components/shared/form/Timepicker";
import { Country, State, City } from "country-state-city";
import { useMemo } from "react";
import { Textarea } from "@/components/ui";
import Select from "react-select";
import { Controller, useForm } from "react-hook-form";
import apiHelper from "@/utils/apiHelper";
import { Combobox } from "@/components/shared/form/Combobox";
import { toast } from "sonner";
// ─── Types ──────────────────────────────────────────────────────────────────
interface AccountForm {
  accountName: string;
  mobile: string;
  countryCode: string;
  countryName: string;
  stateCode: string;
  stateName: string;
  district: string;
  city: string;
  address: string;
  panCard: string;
  aadharCard: string;
}

interface FinanceType {
  wantsFinance: boolean;
  existingCustomerModel: string;
  existingCustomerVariant: string;
  existingVehicleYear: string;
  customerExpectedPrice: string;
  marketPrice: string;

  chassisNo: string;
  companyShare: string;
  dealerShares: string;
  rcNo?: string;
  insurance?: string;
  vehicleNo?: string;
}

interface ReviewSummaryType {
  expectedPurchaseDate: string;
  expectedDeliveryDate: string;
  expectedDeliveryTime: string;
  purchaseType: string;
  profession: string;
  enquiryType: string;
  enquirySource: string;
  bookingDate: string;
  // customerRating: string;
  followUpDate: string;
  enquiryStatus: string;
  dmsEnquiryNo: string;
  dmsEnquiryDate: string;
  otherModel: string;
  competitorTestRide: string;
  salesManagerRemarks: string;
  dealerRemarks: string;
  exWarranty23: boolean;
  exWarranty28: boolean;
  advancePayment: boolean;
  listOfBooking: string;
  paymentMode: "CASH" | "BANK" | "";
  bankMode: "NEFT" | "RTGS" | "IMPS" | "CHEQUE" | "UPI" | "";
  selectAccount: string;
  narration: string;
  chequeNo: string;
  chequeDate: string;
  chequeClearDate: string;
}
interface FinanceDetailsType {
  financeDoneBy: string;
  financeAmount: string;
  emi: string;
  tenureMonths: string;
  processingCharge: string;
  loanROI: string;
  marginMoney: string;
}
interface OptionType {
  id: number;
  name: string;
  mobile: string;
}

// Helper function to format date as dd-mm-yyyy
const formatDateToDDMMYYYY = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Helper function to get today's date in dd-mm-yyyy format
const getTodayDate = () => {
  return formatDateToDDMMYYYY(new Date());
};

// ─── Create Account Modal ──────────────────────────────────────────────────
function CreateAccountModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AccountForm) => void;
}) {
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);
  const [colors, setColors] = useState([]);
  // ─── React Hook Form ─────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AccountForm>({
    defaultValues: {
      accountName: "",
      mobile: "",
      countryCode: "",
      countryName: "",
      stateCode: "",
      stateName: "",
      district: "",
      city: "",
      address: "",
      panCard: "",
      aadharCard: "",
    },
    // ✅ Add validation rules here
    resolver: (values) => {
      const errors: Record<string, { type: string; message: string }> = {};

      if (!values.accountName?.trim())
        errors.accountName = {
          type: "required",
          message: "Account Name is required",
        };
      if (!values.mobile?.trim())
        errors.mobile = { type: "required", message: "Mobile is required" };
      if (!values.countryCode)
        errors.countryCode = {
          type: "required",
          message: "Country is required",
        };
      if (!values.stateCode)
        errors.stateCode = { type: "required", message: "State is required" };
      if (!values.district)
        errors.district = { type: "required", message: "District is required" };
      if (!values.city)
        errors.city = { type: "required", message: "City is required" };
      if (!values.address?.trim())
        errors.address = { type: "required", message: "Address is required" };
      if (!values.panCard?.trim())
        errors.panCard = { type: "required", message: "PAN Card is required" };
      if (!values.aadharCard?.trim())
        errors.aadharCard = {
          type: "required",
          message: "Aadhar Card is required",
        };

      return {
        values: Object.keys(errors).length === 0 ? values : {},
        errors,
      };
    },
  });
  // ─── Watch values ────────────────────────────────────────────────────────
  const countryCode = watch("countryCode");
  const stateCode = watch("stateCode");

  // ─── react-select custom styles ──────────────────────────────────────────
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

  // ─── Country, State, City Data ──────────────────────────────────────────
  const countryOptions = useMemo(() => {
    return Country.getAllCountries().map((c) => ({
      value: c.isoCode,
      label: c.name,
    }));
  }, []);

  const stateOptions = useMemo(() => {
    if (!countryCode) return [];
    return State.getStatesOfCountry(countryCode).map((s) => ({
      value: s.isoCode,
      label: s.name,
    }));
  }, [countryCode]);

  const cityOptions = useMemo(() => {
    if (!countryCode || !stateCode) return [];
    return City.getCitiesOfState(countryCode, stateCode).map((c) => ({
      value: c.name,
      label: c.name,
    }));
  }, [countryCode, stateCode]);

  const handleFormSubmit = (data: AccountForm) => {
    onSubmit(data);
    onClose();
  };

  const inputClass = (field: string, hasError?: boolean) =>
    `border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 ${
      hasError ? "border-orange-500 dark:border-orange-500" : "border-gray-300"
    }`;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[60]">
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60"
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <DialogPanel className="dark:bg-dark-700 flex h-full w-screen max-w-3xl flex-col bg-white shadow-xl">
          {/* Header */}
          <div className="dark:bg-dark-600 flex items-center justify-between bg-blue-700 px-4 py-3">
            <DialogTitle className="dark:text-dark-50 font-semibold text-white">
              Create Account
            </DialogTitle>
            <button
              onClick={onClose}
              className="dark:text-dark-200 text-white/80 hover:text-white dark:hover:text-white"
            >
              <XMarkIcon className="size-5" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="flex-1 overflow-y-auto p-6"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Account Name */}
              <div className="flex flex-col gap-1">
                <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                  Account Name <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="accountName"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      placeholder="Enter Account Name"
                      value={field.value}
                      onChange={field.onChange}
                      className={inputClass(
                        "accountName",
                        !!errors.accountName,
                      )}
                    />
                  )}
                />
                {errors.accountName && (
                  <span className="text-xs text-orange-500">
                    {errors.accountName.message}
                  </span>
                )}
              </div>

              {/* Mobile */}
              <div className="flex flex-col gap-1">
                <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                  Mobile <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="mobile"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      placeholder="Mobile"
                      value={field.value}
                      onChange={field.onChange}
                      className={inputClass("mobile", !!errors.mobile)}
                    />
                  )}
                />
                {errors.mobile && (
                  <span className="text-xs text-orange-500">
                    {errors.mobile.message}
                  </span>
                )}
              </div>

              {/* Country */}
              <div className="flex flex-col gap-1">
                <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                  Country <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="countryCode"
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={countryOptions}
                      styles={customSelectStyles}
                      classNamePrefix="react-select"
                      placeholder="Search Country"
                      value={
                        countryOptions.find(
                          (option) => option.value === field.value,
                        ) || null
                      }
                      onChange={(selected) => {
                        field.onChange(selected?.value || "");
                        setCountry(selected?.value || "");
                        setValue("stateCode", "");
                        setValue("stateName", "");
                        setValue("district", "");
                        setValue("city", "");
                      }}
                    />
                  )}
                />
                {errors.countryCode && (
                  <span className="text-xs text-orange-500">
                    {errors.countryCode.message}
                  </span>
                )}
              </div>

              {/* State */}
              <div className="flex flex-col gap-1">
                <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                  State <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="stateCode"
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={stateOptions}
                      styles={customSelectStyles}
                      classNamePrefix="react-select"
                      placeholder="Search State"
                      isDisabled={!countryCode}
                      value={
                        stateOptions.find(
                          (option) => option.value === field.value,
                        ) || null
                      }
                      onChange={(selected) => {
                        field.onChange(selected?.value || "");
                        setState(selected?.value || "");
                        setValue("district", "");
                        setValue("city", "");
                      }}
                    />
                  )}
                />
                {errors.stateCode && (
                  <span className="text-xs text-orange-500">
                    {errors.stateCode.message}
                  </span>
                )}
              </div>

              {/* State Code (auto-filled, read-only) */}
              <div className="flex flex-col gap-1">
                <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                  State Code
                </label>
                <Controller
                  name="stateCode"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      placeholder="Auto-filled"
                      value={field.value}
                      readOnly
                      className={
                        inputClass("stateCode") +
                        " cursor-not-allowed bg-gray-50"
                      }
                    />
                  )}
                />
              </div>

              {/* District */}
              <div className="flex flex-col gap-1">
                <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                  District <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="district"
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={cityOptions}
                      styles={customSelectStyles}
                      classNamePrefix="react-select"
                      placeholder="Search District"
                      isDisabled={!stateCode}
                      value={
                        cityOptions.find(
                          (option) => option.value === field.value,
                        ) || null
                      }
                      onChange={(selected) => {
                        field.onChange(selected?.value || "");
                      }}
                    />
                  )}
                />
                {errors.district && (
                  <span className="text-xs text-orange-500">
                    {errors.district.message}
                  </span>
                )}
              </div>

              {/* City */}
              <div className="flex flex-col gap-1">
                <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                  City <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={cityOptions}
                      styles={customSelectStyles}
                      classNamePrefix="react-select"
                      placeholder="Search City"
                      isDisabled={!stateCode}
                      value={
                        cityOptions.find(
                          (option) => option.value === field.value,
                        ) || null
                      }
                      onChange={(selected) => {
                        field.onChange(selected?.value || "");
                      }}
                    />
                  )}
                />
                {errors.city && (
                  <span className="text-xs text-orange-500">
                    {errors.city.message}
                  </span>
                )}
              </div>

              {/* Address */}
              <div className="col-span-1 flex flex-col gap-1 md:col-span-2">
                <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                  Address <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      placeholder="Enter Address"
                      value={field.value}
                      onChange={field.onChange}
                      className={inputClass("address", !!errors.address)}
                    />
                  )}
                />
                {errors.address && (
                  <span className="text-xs text-orange-500">
                    {errors.address.message}
                  </span>
                )}
              </div>

              {/* PAN Card */}
              <div className="flex flex-col gap-1">
                <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                  PAN Card <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="panCard"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      placeholder="PAN Card Number"
                      value={field.value}
                      onChange={field.onChange}
                      className={inputClass("panCard", !!errors.panCard)}
                    />
                  )}
                />
                {errors.panCard && (
                  <span className="text-xs text-orange-500">
                    {errors.panCard.message}
                  </span>
                )}
              </div>

              {/* Aadhar Card */}
              <div className="flex flex-col gap-1">
                <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                  Aadhar Card No <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="aadharCard"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      placeholder="Aadhar Number"
                      value={field.value}
                      onChange={field.onChange}
                      className={inputClass("aadharCard", !!errors.aadharCard)}
                    />
                  )}
                />
                {errors.aadharCard && (
                  <span className="text-xs text-orange-500">
                    {errors.aadharCard.message}
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
          </form>
          <div className="dark:border-dark-500 mt-6 flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="dark:border-dark-500 dark:text-dark-200 dark:hover:bg-dark-600 rounded-lg border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit(handleFormSubmit)}
              className="bg-primary-500 hover:bg-primary-500 rounded-lg px-6 py-2 text-sm font-semibold text-white"
            >
              Create Account
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

// ─── Step 3: Lead Info ──────────────────────────────────────────────────────
function LeadInfoStep({
  financeData,
  setFinanceData,
  onValidationChange,
}: {
  financeData: FinanceType;
  setFinanceData: React.Dispatch<React.SetStateAction<FinanceType>>;
  onValidationChange: (fn: () => boolean) => void;
}) {
  const [wantsFinance, setWantsFinance] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const finance = financeData;
  const setFinance = setFinanceData;

  const handleFinance = (field: keyof FinanceType, value: any) => {
    setFinance((p) => ({ ...p, [field]: value }));
    const errorKey = `finance_${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (wantsFinance) {
      if (!finance.existingCustomerModel?.trim())
        newErrors.finance_existingCustomerModel =
          "Existing Customer Model is required";

      if (!finance.existingCustomerVariant?.trim())
        newErrors.finance_existingCustomerVariant =
          "Existing Customer Variant is required";

      if (!finance.existingVehicleYear?.trim())
        newErrors.finance_existingVehicleYear =
          "Existing Vehicle Year is required";

      if (!finance.customerExpectedPrice?.trim())
        newErrors.finance_customerExpectedPrice =
          "Customer Expected Price is required";

      if (!finance.marketPrice?.trim())
        newErrors.finance_marketPrice = "Market Price is required";

      if (!finance.chassisNo?.trim())
        newErrors.finance_chassisNo = "Chassis No is required";

      if (!finance.companyShare?.trim())
        newErrors.finance_companyShare = "Company Share is required";

      if (!finance.dealerShares?.trim())
        newErrors.finance_dealerShares = "Dealer Share is required";

      if (!finance.rcNo?.trim()) newErrors.finance_rcNo = "RC No is required";

      if (!finance.vehicleNo?.trim())
        newErrors.finance_vehicleNo = "Vehicle No is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    onValidationChange(validate);
  }, [wantsFinance, finance]);

  const inputClass = (field: string) =>
    `border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 ${
      errors[field]
        ? "border-orange-500 dark:border-orange-500"
        : "border-gray-300"
    }`;

  return (
    <div className="space-y-4">
      {/* Single Checkbox */}
      {/* Single Checkbox - Make the entire label clickable */}
      <label className="flex cursor-pointer items-center gap-1.5">
        <Checkbox
          checked={wantsFinance}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const checked = e.target.checked;

            setWantsFinance(checked);

            setFinanceData((prev) => ({
              ...prev,
              wantsFinance: checked,
            }));
          }}
        />
        <span className="dark:text-dark-200 text-sm text-gray-700 select-none">
          Change Current Vehicle?
        </span>
      </label>

      {/* Change Current Vehicle? - Only show when checkbox is checked */}
      {wantsFinance && (
        <div className="dark:border-dark-600 dark:bg-dark-800 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Existing Customer Model */}
            <div className="flex flex-col gap-1">
              <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Existing Customer Model
              </label>
              <input
                type="text"
                placeholder="Enter Existing Customer Model"
                value={finance.existingCustomerModel}
                onChange={(e) =>
                  handleFinance("existingCustomerModel", e.target.value)
                }
                className={inputClass(`finance_existingCustomerModel`)}
              />
              {errors.finance_existingCustomerModel && (
                <span className="text-xs text-orange-500">
                  {errors.finance_existingCustomerModel}
                </span>
              )}
            </div>

            {/* Existing Customer Variant */}
            <div className="flex flex-col gap-1">
              <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Existing Customer Variant
              </label>
              <input
                type="text"
                placeholder="Enter Existing Customer Variant"
                value={finance.existingCustomerVariant}
                onChange={(e) =>
                  handleFinance("existingCustomerVariant", e.target.value)
                }
                className={inputClass(`finance_existingCustomerVariant`)}
              />
              {errors.finance_existingCustomerVariant && (
                <span className="text-xs text-orange-500">
                  {errors.finance_existingCustomerVariant}
                </span>
              )}
            </div>
            {/* Existing Vehicle Year */}
            <div className="flex flex-col gap-1">
              <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Existing Vehicle Year
              </label>
              <input
                type="text"
                placeholder="Enter Vehicle Year"
                value={finance.existingVehicleYear}
                onChange={(e) =>
                  handleFinance("existingVehicleYear", e.target.value)
                }
                className={inputClass(`finance_existingVehicleYear`)}
              />
              {errors.finance_existingVehicleYear && (
                <span className="text-xs text-orange-500">
                  {errors.finance_existingVehicleYear}
                </span>
              )}
            </div>

            {/* Customer Expected Price */}
            <div className="flex flex-col gap-1">
              <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Customer Expected Price
              </label>
              <input
                type="text"
                placeholder="Enter Expected Price"
                value={finance.customerExpectedPrice}
                onChange={(e) =>
                  handleFinance("customerExpectedPrice", e.target.value)
                }
                className={inputClass(`finance_customerExpectedPrice`)}
              />
              {errors.finance_customerExpectedPrice && (
                <span className="text-xs text-orange-500">
                  {errors.finance_customerExpectedPrice}
                </span>
              )}
            </div>

            {/* Market Price */}
            <div className="flex flex-col gap-1">
              <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Market Price
              </label>
              <input
                type="text"
                placeholder="Enter Market Price"
                value={finance.marketPrice}
                onChange={(e) => handleFinance("marketPrice", e.target.value)}
                className={inputClass(`finance_marketPrice`)}
              />
              {errors.finance_marketPrice && (
                <span className="text-xs text-orange-500">
                  {errors.finance_marketPrice}
                </span>
              )}
            </div>

            {/* Exchange Bonus */}
            <div className="flex flex-col gap-1">
              <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Chassis No
              </label>
              <input
                type="text"
                placeholder="0"
                value={finance.chassisNo}
                onChange={(e) => handleFinance("chassisNo", e.target.value)}
                className={inputClass(`finance_chassisNo`)}
              />
              {errors.finance_chassisNo && (
                <span className="text-xs text-orange-500">
                  {errors.finance_chassisNo}
                </span>
              )}
            </div>

            {/* SMIPL Shares */}
            <div className="flex flex-col gap-1">
              <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Company Share
              </label>
              <input
                type="text"
                placeholder="0"
                value={finance.companyShare}
                onChange={(e) => handleFinance("companyShare", e.target.value)}
                className={inputClass(`finance_companyShare`)}
              />
              {errors.finance_companyShare && (
                <span className="text-xs text-orange-500">
                  {errors.finance_companyShare}
                </span>
              )}
            </div>

            {/* Dealer Shares */}
            <div className="flex flex-col gap-1">
              <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Dealer Shares
              </label>
              <input
                type="text"
                placeholder="0"
                value={finance.dealerShares}
                onChange={(e) => handleFinance("dealerShares", e.target.value)}
                className={inputClass(`finance_dealerShares`)}
              />
              {errors.finance_dealerShares && (
                <span className="text-xs text-orange-500">
                  {errors.finance_dealerShares}
                </span>
              )}
            </div>

            {/* Value Add Accessories */}
            <div className="flex flex-col gap-1">
              <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                RC No
              </label>
              <input
                type="text"
                placeholder="Enter Value Add Accessories"
                value={finance.rcNo}
                onChange={(e) => handleFinance("rcNo", e.target.value)}
                className={inputClass(`finance_rcNo`)}
              />
              {errors.finance_rcNo && (
                <span className="text-xs text-orange-500">
                  {errors.finance_rcNo}
                </span>
              )}
            </div>

            {/* Insurance */}
            <div className="flex flex-col gap-1">
              <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Insurance
              </label>
              <input
                type="text"
                placeholder="Enter Insurance"
                value={finance.insurance || ""}
                onChange={(e) => handleFinance("insurance", e.target.value)}
                className={inputClass(`finance_insurance`)}
              />
            </div>

            {/* Total Value - Full width */}
            <div className="col-span-1 flex flex-col gap-1 sm:col-span-2">
              <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Vehicle No
              </label>
              <input
                type="text"
                placeholder="0"
                value={finance.vehicleNo}
                onChange={(e) => handleFinance("vehicleNo", e.target.value)}
                className={inputClass(`finance_vehicleNo`) + " max-w-xs"}
              />
              {errors.finance_vehicleNo && (
                <span className="text-xs text-orange-500">
                  {errors.finance_vehicleNo}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Review Lead Summary Step ──────────────────────────────────────────────
function ReviewLeadSummaryStep({
  reviewData,
  setReviewData,
  onValidationChange,
}: {
  reviewData: ReviewSummaryType;
  setReviewData: React.Dispatch<React.SetStateAction<ReviewSummaryType>>;
  onValidationChange: (fn: () => boolean) => void;
}) {
  const form = reviewData;
  const setForm = setReviewData;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof ReviewSummaryType, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.expectedPurchaseDate)
      newErrors.expectedPurchaseDate = "Expected Purchase Date is required";
    if (!form.expectedDeliveryDate)
      newErrors.expectedDeliveryDate = "Expected Delivery Date is required";
    if (!form.expectedDeliveryTime)
      newErrors.expectedDeliveryTime = "Expected Delivery Time is required";
    if (!form.purchaseType)
      newErrors.purchaseType = "Purchase Type is required";
    if (!form.profession) newErrors.profession = "Profession is required";
    if (!form.enquiryType) newErrors.enquiryType = "Enquiry Type is required";
    if (!form.enquirySource)
      newErrors.enquirySource = "Enquiry Source is required";
    if (!form.bookingDate) newErrors.bookingDate = "Booking Date is required";
    // if (!form.customerRating)
    //   newErrors.customerRating = "Customer Rating is required";
    if (!form.followUpDate)
      newErrors.followUpDate = "Follow Up Date is required";
    if (!form.enquiryStatus)
      newErrors.enquiryStatus = "Enquiry Status is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    onValidationChange(validate);
  }, [form]);

  const inputClass = (field: string) =>
    `border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 ${
      errors[field]
        ? "border-orange-500 dark:border-orange-500"
        : "border-gray-300"
    }`;

  // Options for dropdowns
  const purchaseTypeOptions = [
    { label: "Cash", value: "Cash" },
    { label: "Finance", value: "Finance" },
    { label: "Bank", value: "Bank" },
  ];

  const [professions, setProfessions] = useState([]);
  const [enquiryTypes, setEnquiryTypes] = useState([]);
  const [enquirySources, setEnquirySources] = useState([]);
  const [enquiryStatuses, setEnquiryStatuses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const fetchProfessions = async () => {
    const res = await apiHelper.get("/professions");



    const data = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data)
        ? res.data
        : [];

    setProfessions(
      data.map((item: any) => ({
        id: item.id,
        label: item.profession, // <-- FIX
        value: item.id, // <-- FIX
      })),
    );
  };
  const fetchAccounts = async () => {
    try {
      const res = await apiHelper.get("/accounts");

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      setAccounts(
        data.map((item: any) => ({
          id: item.id,
          name: item.accountName,
          group: item.group,
        })),
      );
    } catch (error) {
      console.error("Account Error:", error);
    }
  };
  const fetchEnquiryTypes = async () => {
    const res = await apiHelper.get("/enquiry-types");

    const data = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data)
        ? res.data
        : [];

    setEnquiryTypes(
      data.map((item: any) => ({
        id: item.id,
        label: item.enquiryType,
        value: item.id,
      })),
    );
  };

  const fetchEnquirySources = async () => {
    const res = await apiHelper.get("/enquiry-sources");

    const data = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data)
        ? res.data
        : [];
    setEnquirySources(
      data.map((item: any) => ({
        id: item.id,
        label: item.enquirySource,
        value: item.id,
      })),
    );
  };

  const fetchEnquiryStatuses = async () => {
    const res = await apiHelper.get("/enquiry-statuses");

    const data = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data)
        ? res.data
        : [];

    setEnquiryStatuses(
      data.map((item: any) => ({
        id: item.id,
        label: item.enquiryStatus,
        value: item.id,
      })),
    );
  };
  useEffect(() => {
    fetchProfessions();
    fetchEnquiryTypes();
    fetchEnquirySources();
    fetchEnquiryStatuses();
    fetchAccounts();
  }, []);
  const filteredAccounts = accounts.filter((acc: any) => {
    if (form.paymentMode === "CASH") {
      return acc.group === "Cash-in-Hand";
    }

    if (form.paymentMode === "BANK") {
      return acc.group === "Bank Accounts";
    }

    return false;
  });
  return (
    <div className="space-y-6">
      <h3 className="dark:text-dark-50 text-lg font-bold text-gray-800">
        Review Lead Summary
      </h3>

      {/* Top 3-Column Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Expected Purchase Date - Only ONE instance */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
            Expected Purchase Date <span className="text-red-500">*</span>
          </label>
          <DatePicker
            value={form.expectedPurchaseDate}
            onChange={(val) => handleChange("expectedPurchaseDate", val)}
            placeholder="DD-MM-YYYY"
            options={{ dateFormat: "d-m-Y", disableMobile: true }}
          />
          {errors.expectedPurchaseDate && (
            <span className="text-xs text-orange-500">
              {errors.expectedPurchaseDate}
            </span>
          )}
        </div>

        {/* Expected Delivery Date */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
            Expected Delivery Date <span className="text-red-500">*</span>
          </label>
          <DatePicker
            value={form.expectedDeliveryDate}
            onChange={(val) => handleChange("expectedDeliveryDate", val)}
            placeholder="DD-MM-YYYY"
            options={{ dateFormat: "d-m-Y", disableMobile: true }}
          />
          {errors.expectedDeliveryDate && (
            <span className="text-xs text-orange-500">
              {errors.expectedDeliveryDate}
            </span>
          )}
        </div>

        {/* Expected Delivery Time */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
            Expected Delivery Time <span className="text-red-500">*</span>
          </label>
          <Timepicker
            value={form.expectedDeliveryTime}
            onChange={(val) => handleChange("expectedDeliveryTime", val)}
            placeholder="Select time"
          />
          {errors.expectedDeliveryTime && (
            <span className="text-xs text-orange-500">
              {errors.expectedDeliveryTime}
            </span>
          )}
        </div>

        {/* Purchase Type */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
            Purchase Type <span className="text-red-500">*</span>
          </label>
          <Combobox
            data={purchaseTypeOptions}
            displayField="label"
            value={
              form.purchaseType
                ? { label: form.purchaseType, value: form.purchaseType }
                : null
            }
            onChange={(val: { label: string; value: string } | null) =>
              handleChange("purchaseType", val?.value || "")
            }
            placeholder="Select Purchase Type"
          />
          {errors.purchaseType && (
            <span className="text-xs text-orange-500">
              {errors.purchaseType}
            </span>
          )}
        </div>

        {/* Profession */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
            Profession <span className="text-red-500">*</span>
          </label>
          <Combobox
            data={professions}
            displayField="label"
            value={
              form.profession
                ? professions.find((p: any) => p.value === form.profession)
                : null
            }
            onChange={(val: any) =>
              handleChange("profession", val?.value || "")
            }
            placeholder="Select Profession"
          />
          {errors.profession && (
            <span className="text-xs text-orange-500">{errors.profession}</span>
          )}
        </div>

        {/* Enquiry Type */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
            Enquiry Type <span className="text-red-500">*</span>
          </label>
          <Combobox
            data={enquiryTypes}
            displayField="label"
            value={
              form.enquiryType
                ? enquiryTypes.find((p: any) => p.value === form.enquiryType)
                : null
            }
            onChange={(val: any) =>
              handleChange("enquiryType", val?.value || "")
            }
            placeholder="Select Enquiry Type"
          />
          {errors.enquiryType && (
            <span className="text-xs text-orange-500">
              {errors.enquiryType}
            </span>
          )}
        </div>

        {/* Enquiry Source */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
            Enquiry Source <span className="text-red-500">*</span>
          </label>
          <Combobox
            data={enquirySources}
            displayField="label"
            value={
              form.enquirySource
                ? enquirySources.find(
                    (p: any) => p.value === form.enquirySource,
                  )
                : null
            }
            onChange={(val: any) =>
              handleChange("enquirySource", val?.value || "")
            }
            placeholder="Select Enquiry Source"
          />
          {errors.enquirySource && (
            <span className="text-xs text-orange-500">
              {errors.enquirySource}
            </span>
          )}
        </div>

        {/* Booking Date */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
            Booking Date <span className="text-red-500">*</span>
          </label>
          <DatePicker
            value={form.bookingDate}
            onChange={(val) => handleChange("bookingDate", val)}
            placeholder="DD-MM-YYYY"
            options={{ dateFormat: "d-m-Y", disableMobile: true }}
          />
          {errors.bookingDate && (
            <span className="text-xs text-orange-500">
              {errors.bookingDate}
            </span>
          )}
        </div>
      </div>

      {/* Middle 2-Column Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Follow Up Date */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
            Follow Up Date <span className="text-red-500">*</span>
          </label>
          <DatePicker
            value={form.followUpDate}
            onChange={(val) => handleChange("followUpDate", val)}
            placeholder="DD-MM-YYYY"
            options={{ dateFormat: "d-m-Y", disableMobile: true }}
          />
          {errors.followUpDate && (
            <span className="text-xs text-orange-500">
              {errors.followUpDate}
            </span>
          )}
        </div>

        {/* Enquiry Status */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
            Enquiry Status <span className="text-red-500">*</span>
          </label>
          <Combobox
            data={enquiryStatuses}
            displayField="label"
            value={
              form.enquiryStatus
                ? enquiryStatuses.find(
                    (p: any) => p.value === form.enquiryStatus,
                  )
                : null
            }
            onChange={(val: any) =>
              handleChange("enquiryStatus", val?.value || "")
            }
            placeholder="Select Enquiry Status"
          />
          {errors.enquiryStatus && (
            <span className="text-xs text-orange-500">
              {errors.enquiryStatus}
            </span>
          )}
        </div>

        {/* DMS Enquiry No */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
            DMS Enquiry No
          </label>
          <input
            type="text"
            placeholder="Enter DMS Enquiry No"
            value={form.dmsEnquiryNo}
            onChange={(e) => handleChange("dmsEnquiryNo", e.target.value)}
            className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* DMS Enquiry Date */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
            DMS Enquiry Date
          </label>
          <DatePicker
            value={form.dmsEnquiryDate}
            onChange={(val) => handleChange("dmsEnquiryDate", val)}
            placeholder="DD-MM-YYYY"
            options={{
              dateFormat: "d-m-Y",
              disableMobile: true,
            }}
          />
        </div>

        {/* Other Model in consideration */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
            Other Model in consideration
          </label>
          <Textarea
            placeholder="Enter other model"
            value={form.otherModel}
            onChange={(e) => handleChange("otherModel", e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Any Competitor model test ride taken */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
            Any Competitor model test ride taken
          </label>
          <Textarea
            placeholder="Enter competitor model"
            value={form.competitorTestRide}
            onChange={(e) => handleChange("competitorTestRide", e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Sales Manager Remarks */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
            Sales Manager Remarks
          </label>
          <Textarea
            placeholder="Enter remarks"
            value={form.salesManagerRemarks}
            onChange={(e) =>
              handleChange("salesManagerRemarks", e.target.value)
            }
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Dealer Remarks */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
            Dealer Remarks
          </label>
          <Textarea
            placeholder="Enter dealer remarks"
            value={form.dealerRemarks}
            onChange={(e) => handleChange("dealerRemarks", e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      {/* Advance Payment Box */}
      <div className="space-y-4 rounded-lg border-2 border-blue-200 bg-blue-50/30 p-4">
        {/* Checkbox */}
        <label className="dark:text-dark-100 flex items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={form.advancePayment}
            onChange={(e) => {
              handleChange("advancePayment", e.target.checked);
              // Reset payment fields when unchecked
              if (!e.target.checked) {
                handleChange("paymentMode", "");
                handleChange("bankMode", "");
                handleChange("listOfBooking", "");
                handleChange("selectAccount", "");
                handleChange("narration", "");
                handleChange("chequeNo", "");
                handleChange("chequeDate", "");
                handleChange("chequeClearDate", "");
              } else {
                // Default to CASH when checked
                handleChange("paymentMode", "CASH");
              }
            }}
          />
          Advance Payment
        </label>

        {form.advancePayment && (
          <div className="grid grid-cols-3 gap-4">
            {/* List of Booking */}
            <div className="flex flex-col gap-1">
              <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                List of Booking ($)
              </label>
              <input
                type="text"
                placeholder="Enter List of Booking"
                value={form.listOfBooking || ""}
                onChange={(e) => handleChange("listOfBooking", e.target.value)}
                className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Payment Mode */}
            <div className="flex flex-col gap-1">
              <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                Payment Mode:
              </label>
              <div className="mt-1 flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    name="paymentMode"
                    value="CASH"
                    checked={form.paymentMode === "CASH"}
                    onChange={() => {
                      handleChange("paymentMode", "CASH");
                      handleChange("bankMode", "");
                      handleChange("chequeNo", "");
                      handleChange("chequeDate", "");
                      handleChange("chequeClearDate", "");
                    }}
                    className="accent-blue-600"
                  />
                  CASH
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    name="paymentMode"
                    value="BANK"
                    checked={form.paymentMode === "BANK"}
                    onChange={() => {
                      handleChange("paymentMode", "BANK");
                      handleChange("bankMode", "NEFT");
                    }}
                    className="accent-blue-600"
                  />
                  BANK
                </label>
              </div>
            </div>

            {/* CASH mode: Select Account + Narration */}
            {form.paymentMode === "CASH" && (
              <>
                <div className="flex flex-col gap-1">
                  {/* empty col to maintain 3-col grid */}
                </div>

                {/* Select Account */}
                <div className="flex flex-col gap-1">
                  <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                    Select Account
                  </label>
                  <Combobox
                    data={filteredAccounts}
                    displayField="name"
                    value={
                      filteredAccounts.find(
                        (a: any) => String(a.id) === String(form.selectAccount),
                      ) || null
                    }
                    onChange={(val: any) =>
                      handleChange("selectAccount", val?.id || "")
                    }
                    placeholder="Select Account"
                  />
                </div>

                {/* Narration */}
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                    Narration
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Narration"
                    value={form.narration || ""}
                    onChange={(e) => handleChange("narration", e.target.value)}
                    className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {/* BANK mode */}
            {form.paymentMode === "BANK" && (
              <>
                {/* Select Account */}
                <div className="flex flex-col gap-1">
                  <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                    Select Account
                  </label>
                  <Combobox
                    data={filteredAccounts}
                    displayField="name"
                    value={
                      filteredAccounts.find(
                        (a: any) => String(a.id) === String(form.selectAccount),
                      ) || null
                    }
                    onChange={(val: any) =>
                      handleChange("selectAccount", val?.id || "")
                    }
                    placeholder="Select Account"
                  />
                </div>

                {/* Bank Mode Radio Group */}
                <div className="flex flex-col gap-1">
                  <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                    Mode:
                  </label>
                  <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-2">
                    {(["NEFT", "RTGS", "IMPS", "CHEQUE", "UPI"] as const).map(
                      (mode) => (
                        <label
                          key={mode}
                          className="flex cursor-pointer items-center gap-1.5 text-sm"
                        >
                          <input
                            type="radio"
                            name="bankMode"
                            value={mode}
                            checked={form.bankMode === mode}
                            onChange={() => {
                              handleChange("bankMode", mode);
                              // Reset cheque fields if switching away from CHEQUE
                              if (mode !== "CHEQUE") {
                                handleChange("chequeNo", "");
                                handleChange("chequeDate", "");
                                handleChange("chequeClearDate", "");
                              }
                            }}
                            className="accent-blue-600"
                          />
                          {mode}
                        </label>
                      ),
                    )}
                  </div>
                </div>

                {/* CHEQUE selected: show Cheque No. + dates */}
                {form.bankMode === "CHEQUE" ? (
                  <>
                    {/* Cheque No */}
                    <div className="flex flex-col gap-1">
                      <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                        Cheque No.
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Cheque No"
                        value={form.chequeNo || ""}
                        onChange={(e) =>
                          handleChange("chequeNo", e.target.value)
                        }
                        className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Cheque Date */}
                    <div className="flex flex-col gap-1">
                      <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                        Cheque Date
                      </label>
                      <DatePicker
                        value={form.chequeDate || ""}
                        onChange={(val) => handleChange("chequeDate", val)}
                        placeholder="Select Date"
                        options={{ dateFormat: "d-m-Y", disableMobile: true }}
                      />
                    </div>

                    {/* Cheque Clear Date */}
                    <div className="flex flex-col gap-1">
                      <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                        Cheque Clear Date
                      </label>
                      <DatePicker
                        value={form.chequeClearDate || ""}
                        onChange={(val) => handleChange("chequeClearDate", val)}
                        placeholder="Select Date"
                        options={{ dateFormat: "d-m-Y", disableMobile: true }}
                      />
                    </div>

                    {/* Narration - full width */}
                    <div className="col-span-3 flex flex-col gap-1">
                      <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                        Narration
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Narration"
                        value={form.narration || ""}
                        onChange={(e) =>
                          handleChange("narration", e.target.value)
                        }
                        className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </>
                ) : (
                  /* Non-CHEQUE bank mode: just Narration */
                  <div className="flex flex-col gap-1">
                    <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                      Narration
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Narration"
                      value={form.narration || ""}
                      onChange={(e) =>
                        handleChange("narration", e.target.value)
                      }
                      className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
function FinanceDetailsStep({
  financeDetails,
  setFinanceDetails,
  financeOptions,
}: {
  financeDetails: FinanceDetailsType;

  setFinanceDetails: React.Dispatch<React.SetStateAction<FinanceDetailsType>>;

  financeOptions: any[];
}) {
  const handleChange = (field: keyof FinanceDetailsType, value: string) => {
    setFinanceDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const inputClass =
    "dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 " +
    "w-full rounded-md border border-gray-300 px-3 py-2 " +
    "text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none";

  return (
    <div className="space-y-6">
      <h3 className="dark:text-dark-50 text-lg font-bold text-gray-800">
        Finance Details
      </h3>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Finance Done By */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium">
            Finance Done By
          </label>

          <Combobox
            data={financeOptions}
            value={
              financeOptions.find(
                (item: any) =>
                  String(item.id) === String(financeDetails.financeDoneBy),
              ) || null
            }
            onChange={(item: any) => {
              handleChange("financeDoneBy", item?.id ? String(item.id) : "");
            }}
            displayField="name"
            placeholder="Select Finance"
            searchFields={["name", "employeeName"]}
            columns={[
              {
                header: "Finance Name",
                field: "name",
                width: "2fr",
              },
              {
                header: "Employee Name",
                field: "employeeName",
                width: "1.5fr",
              },
            ]}
          />
        </div>

        {/* Finance Amount */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium">
            Finance Amount
          </label>

          <input
            type="number"
            min="0"
            placeholder="0"
            value={financeDetails.financeAmount}
            onChange={(e) => handleChange("financeAmount", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* EMI */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium">EMI</label>

          <input
            type="number"
            min="0"
            placeholder="0"
            value={financeDetails.emi}
            onChange={(e) => handleChange("emi", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Tenure */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium">
            Tenure (Months)
          </label>

          <input
            type="number"
            min="0"
            placeholder="0"
            value={financeDetails.tenureMonths}
            onChange={(e) => handleChange("tenureMonths", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Processing Charge */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium">
            Processing Charge
          </label>

          <input
            type="number"
            min="0"
            placeholder="0"
            value={financeDetails.processingCharge}
            onChange={(e) => handleChange("processingCharge", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Loan ROI */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium">
            Loan ROI
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0"
            value={financeDetails.loanROI}
            onChange={(e) => handleChange("loanROI", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Margin Money */}
        <div className="flex flex-col gap-1">
          <label className="dark:text-dark-200 text-sm font-medium">
            Margin Money (Down Payment)
          </label>

          <input
            type="number"
            min="0"
            placeholder="0"
            value={financeDetails.marginMoney}
            onChange={(e) => handleChange("marginMoney", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
// ─── Main Lead Details Drawer ────────────────────────────────────────────────
export function LeadDetailsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [selectedModel, setSelectedModel] = useState<OptionType | null>(null);
  const [selectedShowroomVariant, setSelectedShowroomVariant] =
    useState<OptionType | null>(null);

  const [showroomVariants, setShowroomVariants] = useState([]);

  const [filteredShowroomVariants, setFilteredShowroomVariants] = useState<
    any[]
  >([]);
  const [selectedColor, setSelectedColor] = useState<OptionType | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<OptionType | null>(
    null,
  );
  const [selectedExecutive, setSelectedExecutive] = useState<OptionType | null>(
    null,
  );
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const leadInfoValidateRef = useRef<(() => boolean) | null>(null);
  const reviewSummaryValidateRef = useRef<(() => boolean) | null>(null);

  const [models, setModels] = useState([]);
  // const [variants, setVariants] = useState([]);
  const [colors, setColors] = useState([]);

  // const [filteredVariants, setFilteredVariants] = useState([]);
  const [filteredColors, setFilteredColors] = useState([]);
  const [customers, setCustomers] = useState<OptionType[]>([]);

  const [executives, setExecutives] = useState<OptionType[]>([]);
  const companyId = Number(sessionStorage.getItem("companyId"));

  const financialYearId = Number(sessionStorage.getItem("financialYearId"));
  const fetchExecutives = async () => {
    try {
      const res = await apiHelper.get("/employees");

      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];

      setExecutives(
        data
          .filter((item: any) => item.role?.toLowerCase().includes("executive"))
          .map((item: any) => ({
            id: item.id,
            name: item.employeeName,
            role: item.role,
          })),
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchExecutives();
  }, []);
  const [financeData, setFinanceData] = useState<FinanceType>({
    wantsFinance: false,
    existingCustomerModel: "",
    existingCustomerVariant: "",
    existingVehicleYear: "",
    customerExpectedPrice: "",
    marketPrice: "",

    chassisNo: "",
    companyShare: "",
    dealerShares: "",
    rcNo: "",
    insurance: "",
    vehicleNo: "",
  });

  const [reviewData, setReviewData] = useState<ReviewSummaryType>({
    expectedPurchaseDate: "",
    expectedDeliveryDate: "",
    expectedDeliveryTime: "",
    purchaseType: "",
    profession: "",
    enquiryType: "",
    enquirySource: "",
    bookingDate: "",
    // customerRating: "",
    followUpDate: "",
    enquiryStatus: "",
    dmsEnquiryNo: "",
    dmsEnquiryDate: "",
    otherModel: "",
    competitorTestRide: "",
    salesManagerRemarks: "",
    dealerRemarks: "",
    exWarranty23: false,
    exWarranty28: false,
    advancePayment: false,
    listOfBooking: "",
    paymentMode: "",
    bankMode: "",
    selectAccount: "",
    narration: "",
    chequeNo: "",
    chequeDate: "",
    chequeClearDate: "",
  });
  const [financeDetails, setFinanceDetails] = useState<FinanceDetailsType>({
    financeDoneBy: "",
    financeAmount: "",
    emi: "",
    tenureMonths: "",
    processingCharge: "",
    loanROI: "",
    marginMoney: "",
  });
  const isFinancePurchase = reviewData.purchaseType === "Finance";
  const [financeOptions, setFinanceOptions] = useState<any[]>([]);
  const totalSteps = isFinancePurchase ? 5 : 4;
  const validateStep1And2 = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!selectedModel) newErrors.model = "Please select a model";
      if (!selectedShowroomVariant)
        newErrors.showroomVariant = "Please select showroom variant";
      if (!selectedColor) newErrors.color = "Please select a color";
    }
    if (currentStep === 2) {
      if (!selectedCustomer) newErrors.customer = "Please select a customer";
      if (!selectedExecutive)
        newErrors.executive = "Please select a sales executive";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 || step === 2) {
      if (!validateStep1And2(step)) return;
    }

    if (step === 3 && leadInfoValidateRef.current) {
      const isValid = leadInfoValidateRef.current();

      if (!isValid) return;
    }

    // Step 4 validation
    if (step === 4 && reviewSummaryValidateRef.current) {
      const isValid = reviewSummaryValidateRef.current();

      if (!isValid) return;
    }

    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

const handleSubmit = async () => {

  if (!companyId || !financialYearId) {
    toast.error("Company or financial year is not selected");
    return;
  }
  if (reviewSummaryValidateRef.current) {
    const isValid = reviewSummaryValidateRef.current();

    if (!isValid) return;
  }

  try {
    const payload = {
      companyId,
      financialYearId,
      modelId: selectedModel?.id,
      showroomVariantId: selectedShowroomVariant?.id,
      colourId: selectedColor?.id,
      customerId: selectedCustomer?.id,
      executiveId: selectedExecutive?.id,
      ...financeData,
      ...reviewData,

      customerExpectedPrice: financeData.customerExpectedPrice
        ? Number(financeData.customerExpectedPrice)
        : null,
      marketPrice: financeData.marketPrice
        ? Number(financeData.marketPrice)
        : null,
      chassisNo: financeData.chassisNo || null,
      companyShare: financeData.companyShare
        ? Number(financeData.companyShare)
        : null,
      dealerShares: financeData.dealerShares
        ? Number(financeData.dealerShares)
        : null,
      rcNo: financeData.rcNo || null,
      insurance: financeData.insurance ? Number(financeData.insurance) : null,
      vehicleNo: financeData.vehicleNo || null,
      expectedPurchaseDate: reviewData.expectedPurchaseDate?.[0] || null,
      expectedDeliveryDate: reviewData.expectedDeliveryDate?.[0] || null,
      bookingDate: reviewData.bookingDate?.[0] || null,
      followUpDate: reviewData.followUpDate?.[0] || null,
      dmsEnquiryDate: reviewData.dmsEnquiryDate?.[0] || null,
      chequeNo: reviewData.chequeNo,
      chequeDate: reviewData.chequeDate?.[0] || null,
      chequeClearDate: reviewData.chequeClearDate?.[0] || null,
      financeDoneBy: financeDetails.financeDoneBy || null,

      financeAmount: financeDetails.financeAmount
        ? Number(financeDetails.financeAmount)
        : null,

      emi: financeDetails.emi ? Number(financeDetails.emi) : null,

      tenureMonths: financeDetails.tenureMonths
        ? Number(financeDetails.tenureMonths)
        : null,

      processingCharge: financeDetails.processingCharge
        ? Number(financeDetails.processingCharge)
        : null,

      loanROI: financeDetails.loanROI ? Number(financeDetails.loanROI) : null,

      marginMoney: financeDetails.marginMoney
        ? Number(financeDetails.marginMoney)
        : null,
    };

    await apiHelper.post("/leads", payload);

    toast.success("Lead created successfully!");
    onClose();
  } catch (error: any) {
    console.error("API ERROR", error);
    toast.error(
      error.response?.data?.message ||
        "Failed to create lead. Please try again.",
    );
  }
};

const handleCreateAccount = async (formData: AccountForm) => {
  try {
    await apiHelper.post("/accounts", {
      accountName: formData.accountName,
      printName: formData.accountName,
      mobile: formData.mobile,
      country: formData.countryName,
      countryCode: formData.countryCode,
      state: formData.stateName,
      stateCode: formData.stateCode,
      district: formData.district,
      city: formData.city,
      address1: formData.address,
      panCard: formData.panCard,
      aadharNo: formData.aadharCard,
      group: "Customer",
      drCr: "Dr",
    });

    toast.success("Account created successfully!");

    await fetchCustomers();
    setIsCreateAccountOpen(false);
  } catch (error: any) {
    console.error(error);
    toast.error(
      error.response?.data?.message ||
        "Failed to create account. Please try again.",
    );
  }
};
  const fetchCustomers = async () => {
    try {
      const res = await apiHelper.get("/accounts");

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      const filteredCustomers = data.filter(
        (item: any) =>
          item.group === "Customer" || item.group === "Sundry Debtors",
      );

      setCustomers(
        filteredCustomers.map((item: any) => ({
          id: item.id,
          name: item.accountName,
          mobile: item.mobile,
        })),
      );
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };
  const fetchModels = async () => {
    const res = await apiHelper.get("/model");
    const data = Array.isArray(res.data) ? res.data : [];

    setModels(
      data.map((item: any) => ({
        id: item.id,
        name: item.modelName,
      })),
    );
  };
  const fetchFinances = async () => {
    try {
      const res = await apiHelper.get("/finances");

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      const activeFinances = data
        .filter((item: any) => item.status === "ACTIVE")
        .map((item: any) => ({
          id: item.id,

          // Finance company/account name
          name: item.account?.accountName || "",

          // Employee/person handling finance
          employeeName: item.employeeName || "",
        }));

      setFinanceOptions(activeFinances);
    } catch (error) {
      console.error("Failed to fetch finances:", error);
      setFinanceOptions([]);
    }
  };
  const fetchShowroomVariants = async () => {
    try {
      const res = await apiHelper.get("/showroom-variant");

      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];

  

      setShowroomVariants(data);
    } catch (err) {
      console.log(err);
    }
  };
  const fetchColors = async () => {
    const res = await apiHelper.get("/colours");
    const data = Array.isArray(res.data) ? res.data : [];

    setColors(
      data.map((item: any) => ({
        id: item.id,
        name: item.colourName,
        showroomVariantId: item.showroomVariantId,
      })),
    );
  };
  useEffect(() => {
    fetchModels();
    fetchShowroomVariants();
    fetchColors();
    fetchCustomers();
    fetchFinances();
  }, []);
  const handleModelChange = (model: any) => {
    setSelectedModel(model);

    const filtered = showroomVariants.filter(
      (v: any) => Number(v.modelId) === Number(model.id),
    );



    setFilteredShowroomVariants(
      filtered.map((item: any) => ({
        id: item.id,
        name: item.variantName,
        modelId: item.modelId,
      })),
    );

    setSelectedShowroomVariant(null);
    setSelectedColor(null);
  };

  const handleShowroomVariantChange = (variant: any) => {
    setSelectedShowroomVariant(variant);

    if (!variant) {
      setFilteredColors([]);
      return;
    }

    const filtered = colors.filter(
      (c: any) => Number(c.showroomVariantId) === Number(variant.id),
    );

    setFilteredColors(filtered);
  };

  const handleColorChange = (val: OptionType | null) => {
    setSelectedColor(val);
    if (errors.color) {
      const newErrors = { ...errors };
      delete newErrors.color;
      setErrors(newErrors);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Vehicle Selection";

      case 2:
        return "Customer Detail";

      case 3:
        return "Lead Info";

      case 4:
        return "Review Lead Summary";

      case 5:
        return "Finance Details";

      default:
        return "";
    }
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div
          className="fixed inset-0 bg-black/30 dark:bg-black/60"
          aria-hidden="true"
        />
        <div className="fixed inset-y-0 right-0 flex max-w-full">
          <DialogPanel
            className={`dark:bg-dark-700 flex h-full w-screen max-w-3xl flex-col bg-white shadow-xl transition-all duration-300`}
          >
            {/* Header */}
            <div className="dark:bg-dark-600 flex items-center justify-between bg-blue-700 px-4 py-3">
              <DialogTitle className="dark:text-dark-50 font-semibold text-white">
                {getStepTitle()} ({step}/{totalSteps})
              </DialogTitle>
              <button
                onClick={onClose}
                className="dark:text-dark-200 text-white/80 hover:text-white dark:hover:text-white"
              >
                <XMarkIcon className="size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="dark:text-dark-50 text-lg font-bold text-gray-800">
                    Vehicle Selection
                  </h3>

                  <div className="flex flex-col gap-1">
                    <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                      Select Model
                    </label>
                    <Combobox
                      data={models}
                      displayField="name"
                      value={selectedModel}
                      onChange={handleModelChange}
                      placeholder="Select Model"
                      searchFields={["name"]}
                    />
                    {errors.model && (
                      <span className="text-xs text-orange-500">
                        {errors.model}
                      </span>
                    )}
                  </div>

                  {selectedModel && (
                    <div className="flex flex-col gap-1">
                      <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                        Select Showroom Variant
                      </label>
                      <Combobox
                        displayField="name"
                        data={filteredShowroomVariants}
                        value={selectedShowroomVariant}
                        onChange={handleShowroomVariantChange}
                        placeholder="Select Variant"
                        searchFields={["name"]}
                      />
                      {errors.variant && (
                        <span className="text-xs text-orange-500">
                          {errors.variant}
                        </span>
                      )}
                    </div>
                  )}

                  {selectedShowroomVariant && (
                    <div className="flex flex-col gap-1">
                      <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                        Select Color
                      </label>
                      <Combobox
                        data={filteredColors}
                        displayField="name"
                        value={selectedColor}
                        onChange={handleColorChange}
                        placeholder="Select Color"
                        searchFields={["name"]}
                      />
                      {errors.color && (
                        <span className="text-xs text-orange-500">
                          {errors.color}
                        </span>
                      )}
                    </div>
                  )}

                  {selectedModel &&
                    selectedShowroomVariant &&
                    selectedColor && (
                      <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                          Selected: {selectedModel.name} -{" "}
                          {selectedShowroomVariant.name} - {selectedColor.name}
                        </p>
                      </div>
                    )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="dark:text-dark-50 text-lg font-bold text-gray-800">
                    Customer Detail
                  </h3>
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <label className="dark:text-dark-200 mb-1 inline-block text-sm font-medium text-gray-700">
                        Customer Name
                      </label>
                      <Combobox
                        data={customers}
                        value={selectedCustomer}
                        onChange={(val: any) => {
                       
                          setSelectedCustomer(val);

                          if (errors.customer) {
                            const newErrors = { ...errors };
                            delete newErrors.customer;
                            setErrors(newErrors);
                          }
                        }}
                        displayField="name"
                        placeholder="Search Customer"
                        searchFields={["label", "mobile"]}
                        columns={[
                          {
                            header: "Customer",
                            field: "name",
                            width: "2fr",
                          },
                          {
                            header: "Mobile",
                            field: "mobile",
                            width: "1.5fr",
                          },
                        ]}
                      />
                      {errors.customer && (
                        <span className="text-xs text-orange-500">
                          {errors.customer}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setIsCreateAccountOpen(true)}
                      className="dark:border-dark-500 dark:hover:bg-dark-600 mt-6 shrink-0 rounded-md border border-blue-900 p-2 hover:bg-gray-100"
                    >
                      <PlusIcon className="dark:text-dark-200 size-6 text-blue-900" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                      Sales Executive
                    </label>
                    <Combobox
                      data={executives.map((item: any) => ({
                        id: item.id,
                        name: item.name,
                        role: item.role,
                      }))}
                      displayField="name"
                      value={selectedExecutive}
                      onChange={(val: any) => {
                        setSelectedExecutive(val);

                        if (errors.executive) {
                          const newErrors = { ...errors };
                          delete newErrors.executive;
                          setErrors(newErrors);
                        }
                      }}
                      placeholder="Select Sales Executive"
                      searchFields={["name", "role"]}
                      columns={[
                        {
                          header: "Name",
                          field: "name",
                          width: "2fr",
                        },
                        {
                          header: "Role",
                          field: "role",
                          width: "1fr",
                        },
                      ]}
                    />
                    {errors.executive && (
                      <span className="text-xs text-orange-500">
                        {errors.executive}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <LeadInfoStep
                  financeData={financeData}
                  setFinanceData={setFinanceData}
                  onValidationChange={(validateFn) => {
                    leadInfoValidateRef.current = validateFn;
                  }}
                />
              )}

              {step === 4 && (
                <ReviewLeadSummaryStep
                  reviewData={reviewData}
                  setReviewData={setReviewData}
                  onValidationChange={(validateFn) => {
                    reviewSummaryValidateRef.current = validateFn;
                  }}
                />
              )}
              {step === 5 && (
                <FinanceDetailsStep
                  financeDetails={financeDetails}
                  setFinanceDetails={setFinanceDetails}
                  financeOptions={financeOptions}
                />
              )}
            </div>

            {/* Footer */}
            <div className="dark:border-dark-500 flex justify-between border-t border-gray-200 p-4">
              <button
                onClick={handlePrevious}
                disabled={step === 1}
                className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-0 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              {/* Step 1, 2 and 3 */}
              {step < 4 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Next
                </button>
              )}

              {/* Step 4 + Finance = Next */}
              {step === 4 && reviewData.purchaseType === "Finance" && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Next
                </button>
              )}

              {/* Step 4 + Cash/Bank = Submit */}
              {step === 4 && reviewData.purchaseType !== "Finance" && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Submit
                </button>
              )}

              {/* Step 5 Finance Details = Submit */}
              {step === 5 && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Submit
                </button>
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <CreateAccountModal
        isOpen={isCreateAccountOpen}
        onClose={() => setIsCreateAccountOpen(false)}
        onSubmit={handleCreateAccount}
      />
    </>
  );
}
