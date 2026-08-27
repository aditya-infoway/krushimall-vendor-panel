import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useForm, Controller } from "react-hook-form";
import { Country, State, City } from "country-state-city";
import Select from "react-select";
import apiHelper from "@/utils/apiHelper";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { GroupCombobox } from "@/components/shared/form/GroupCombobox";
import { toast } from "sonner";

type FormValues = {
  accountName: string;
  printName: string;
  group: string;
  openingBalance: string;
  drCr: string;
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
  district: string;
  taluka: string;
  city: string;
  area: string;
  address1: string;
  address2: string;
  pincode: string;
  phone: string;
  mobile: string;
  email: string;
  contactPerson: string;
  birthday: string;
  anniversary: string;
  bankAccountNo: string;
  bankName: string;
  ifscCode: string;
  branch: string;
  gstNo: string;
  panCard: string;
  aadharNo: string;
};

const NewAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.state?.item ? true : false;
  const editData = location.state?.item || null;

  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      accountName: "",
      printName: "",
      openingBalance: "",
      group: "",
      drCr: "",
      country: "",
      countryCode: "",
      state: "",
      stateCode: "",
      district: "",
      taluka: "",
      city: "",
      area: "",
      address1: "",
      address2: "",
      pincode: "",
      phone: "",
      mobile: "",
      email: "",
      contactPerson: "",
      birthday: "",
      anniversary: "",
      bankAccountNo: "",
      bankName: "",
      ifscCode: "",
      branch: "",
      gstNo: "",
      panCard: "",
      aadharNo: "",
    },
  });

  // Watch values
  const watchedCountryCode = watch("countryCode");
  const watchedStateCode = watch("stateCode");
  const groupOptions = [
    {
      label: "Bank Accounts (Bank)",
      value: "Bank Accounts",
      effect: "Balance Sheet",
    },
    { label: "Bank OCC A/C", value: "Bank OCC A/C", effect: "Balance Sheet" },
    {
      label: "Capital Account",
      value: "Capital Account",
      effect: "Balance Sheet",
    },
    { label: "Cash-in-Hand", value: "Cash-in-Hand", effect: "Balance Sheet" },
    {
      label: "Currant Assets",
      value: "Currant Assets",
      effect: "Balance Sheet",
    },
    {
      label: "Duites & Taxes",
      value: "Duites & Taxes",
      effect: "Balance Sheet",
    },
    {
      label: "Expense Account",
      value: "Expense Account",
      effect: "Profit & Loss",
    },
    { label: "Purchase Account", value: "Purchase Account", effect: "Trading" },
    { label: "Sales Account", value: "Sales Account", effect: "Trading" },
    { label: "Stock in Hand", value: "Stock in Hand", effect: "Balance Sheet" },
    {
      label: "Sundry Creditors",
      value: "Sundry Creditors",
      effect: "Balance Sheet",
    },
    {
      label: "Sundry Debitors",
      value: "Sundry Debtors",
      effect: "Balance Sheet",
    },
    { label: "Supplier", value: "Supplier", effect: "Balance Sheet" },
    { label: "Customer", value: "Customer", effect: "Balance Sheet" },
    {
      label: "Sundry Debitor (finance)",
      value: "Sundry Debitor (finance)",
      effect: "Balance Sheet",
    },
    {
      label: "Sundry Credito (finance)",
      value: "Sundry Credito (finance)",
      effect: "Balance Sheet",
    },
    {
      label: "Sundry Debitor (internal)",
      value: "Sundry Debitor (internal)",
      effect: "Balance Sheet",
    },
    {
      label: "Sundry Creditor (internal)",
      value: "Sundry Creditor (internal)",
      effect: "Balance Sheet",
    },
  ];
  const drCrOptions = [
    { label: "Dr", value: "Dr" },
    { label: "Cr", value: "Cr" },
  ];
  useEffect(() => {
    if (isEditMode && editData) {
      // Reset form with edit data
      Object.keys(editData).forEach((key) => {
        setValue(key as keyof FormValues, editData[key]);
      });
    }
  }, [isEditMode, editData, setValue]);

  const formValidationRules = {
    accountName: { required: "Account name is required" },
    printName: { required: "Print name is required" },
    openingBalance: { required: "Opening balance is required" },
    group: { required: "Group is required" },
    drCr: { required: "Dr./Cr. is required" },
    country: { required: "Country is required" },
    state: { required: "State is required" },
    city: { required: "City is required" },
    mobile: {
      required: "Mobile number is required",
      pattern: {
        value: /^[0-9]{10}$/,
        message: "Mobile number must be 10 digits",
      },
    },
    email: {
      required: "Email is required",
      pattern: {
        value: /\S+@\S+\.\S+/,
        message: "Email is invalid",
      },
    },
  };

  const handleBack = () => {
    navigate("/usermaster/account");
  };

  const onFormSubmit = async (data: FormValues) => {
    try {
      const finalPayload = {
        ...data,
        birthday: data.birthday || null,
        anniversary: data.anniversary || null,
        openingBalance: Number(data.openingBalance) || 0,
      };

      if (isEditMode) {
        await apiHelper.put(`/accounts/${editData.id}`, finalPayload);
        toast.success("Account updated successfully!");
      } else {
        await apiHelper.post("/accounts", finalPayload);
        toast.success("Account created successfully!");
      }

      navigate("/usermaster/account");
    } catch (error: any) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
          "Failed to save account. Please try again.",
      );
    }
  };

  // ─── Dynamic Location Data ──────────────────────────────────────────────────
  const countryOptions = useMemo(() => {
    return Country.getAllCountries().map((c) => ({
      value: c.isoCode,
      label: c.name,
    }));
  }, []);

  const stateOptions = useMemo(() => {
    if (!watchedCountryCode) return [];
    return State.getStatesOfCountry(watchedCountryCode).map((s) => ({
      value: s.isoCode,
      label: s.name,
    }));
  }, [watchedCountryCode]);

  const cityOptions = useMemo(() => {
    if (!watchedCountryCode || !watchedStateCode) return [];
    return City.getCitiesOfState(watchedCountryCode, watchedStateCode).map(
      (c) => ({
        value: c.name,
        label: c.name,
      }),
    );
  }, [watchedCountryCode, watchedStateCode]);

  // Use cityOptions for both district and city
  const districtOptions = cityOptions;
  const talukaOptions = cityOptions;

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


  
  return (
    <div className="min-h-screen bg-white p-6 transition-colors duration-200 dark:bg-gray-900">
      {/* Header with Back Button */}
      <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {isEditMode ? "Edit Account" : "Add New Account"}
        </h2>
        <button
          onClick={handleBack}
          className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-800 dark:hover:bg-primary-700 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors dark:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        {/* Full Page Form - 3 Columns */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Column 1 */}
          <div className="space-y-4">
            <div>
              <Input
                label={
                  <span>
                    Account Name <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Enter Account Name"
                {...register("accountName", {
                  ...formValidationRules.accountName,
                  onChange: (e) => {
                    setValue("printName", e.target.value);
                  },
                })}
                error={errors?.accountName && errors.accountName.message}
              />
            </div>

            <div>
              <Input
                label="Print Name"
                placeholder="Print Name"
                {...register("printName", formValidationRules.printName)}
                readOnly
                className="cursor-not-allowed bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Group <span className="text-red-500">*</span>
              </label>
              <Controller
                name="group"
                control={control}
                rules={{ required: "Group is required" }}
                render={({ field }) => (
                  <GroupCombobox
                    data={groupOptions}
                    displayField="label"
                    searchFields={["label", "effect"]}
                    value={
                      groupOptions.find((item) => item.value === field.value) ||
                      null
                    }
                    onChange={(val: any) => field.onChange(val?.value || "")}
                    placeholder="Search Group"
                    
                  />
                )}
              />

              {errors.group && (
                <span className="text-xs text-red-500">
                  {errors.group.message}
                </span>
              )}
            </div>
            <div>
              <Input
                label={
                  <span>
                    Openin Balance <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="100000"
                {...register(
                  "openingBalance",
                  formValidationRules.openingBalance,
                )}
                error={errors?.openingBalance && errors.openingBalance.message}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Dr / Cr <span className="text-red-500">*</span>
              </label>

              <Controller
                name="drCr"
                control={control}
                rules={{ required: "Dr / Cr is required" }}
                render={({ field }) => (
                  <Listbox
                    data={drCrOptions}
                    value={
                      drCrOptions.find((item) => item.value === field.value) ||
                      null
                    }
                    onChange={(val: any) => field.onChange(val?.value || "")}
                    placeholder="Select Dr / Cr"
                  />
                )}
              />

              {errors.drCr && (
                <span className="text-xs text-red-500">
                  {errors.drCr.message}
                </span>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
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
                      setValue("country", selected?.label || "");
                      setValue("stateCode", "");
                      setValue("state", "");
                      setValue("district", "");
                      setValue("taluka", "");
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
            <div>
              <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
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
                    isDisabled={!watchedCountryCode}
                    value={
                      stateOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(selected) => {
                      field.onChange(selected?.value || "");
                      setValue("state", selected?.label || "");
                      setValue("district", "");
                      setValue("taluka", "");
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

            {/* State Code - Auto-filled */}
            <div>
              <Input
                label="State Code"
                placeholder="Auto-filled"
                value={watchedStateCode || ""}
                readOnly
                className="cursor-not-allowed bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              />
            </div>

            {/* District */}
            <div>
              <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                District <span className="text-red-500">*</span>
              </label>
              <Controller
                name="district"
                control={control}
                render={({ field }) => (
                  <Select
                    options={districtOptions}
                    styles={customSelectStyles}
                    classNamePrefix="react-select"
                    placeholder="Search District"
                    isDisabled={!watchedStateCode}
                    value={
                      districtOptions.find(
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

            {/* Taluka */}
            <div>
              <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
                Taluka
              </label>
              <Controller
                name="taluka"
                control={control}
                render={({ field }) => (
                  <Select
                    options={talukaOptions}
                    styles={customSelectStyles}
                    classNamePrefix="react-select"
                    placeholder="Search Taluka"
                    isDisabled={!watchedStateCode}
                    value={
                      talukaOptions.find(
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

            {/* City */}
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <div>
              <label className="dark:text-dark-200 mb-1 block text-sm font-medium text-gray-700">
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
                    isDisabled={!watchedStateCode}
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

            <div>
              <Input
                label="Area"
                placeholder="Enter Area"
                {...register("area")}
              />
            </div>

            <div>
              <Input
                label="Address Line 1"
                placeholder="Enter Address Line 1"
                {...register("address1")}
              />
            </div>

            <div>
              <Input
                label="Address Line 2"
                placeholder="Enter Address Line 2"
                {...register("address2")}
              />
            </div>

            <div>
              <Input
                label="Pincode"
                placeholder="Enter Pincode"
                {...register("pincode")}
              />
            </div>

            <div>
              <Input
                label="Phone"
                placeholder="Enter Phone"
                {...register("phone")}
              />
            </div>

            <div>
              <Input
                label={
                  <span>
                    Mobile <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Mobile"
                {...register("mobile", formValidationRules.mobile)}
                error={errors?.mobile && errors.mobile.message}
              />
            </div>

            <div>
              <Input
                label={
                  <span>
                    Email <span className="text-red-500">*</span>
                  </span>
                }
                placeholder="Email"
                {...register("email", formValidationRules.email)}
                error={errors?.email && errors.email.message}
              />
            </div>

            <div>
              <Input
                label="Contact Person"
                placeholder="Contact Name"
                {...register("contactPerson")}
              />
            </div>
          </div>

          {/* Column 3 */}
          <div className="space-y-4">
            <div>
              <DatePicker
                label="Birthday On"
                placeholder="Select Date"
                options={{ disableMobile: true }}
                onChange={(val: Date[]) =>
                  setValue("birthday", val[0]?.toISOString() || "")
                }
              />
            </div>

            <div>
              <DatePicker
                label="Anniversary"
                placeholder="Select Date"
                options={{ disableMobile: true }}
                onChange={(val: Date[]) =>
                  setValue("anniversary", val[0]?.toISOString() || "")
                }
              />
            </div>

            <div>
              <Input
                label="Bank Account No."
                placeholder="Account Number"
                {...register("bankAccountNo")}
              />
            </div>

            <div>
              <Input
                label="Bank Name"
                placeholder="Bank Name"
                {...register("bankName")}
              />
            </div>

            <div>
              <Input
                label="IFSC Code"
                placeholder="IFSC Code"
                {...register("ifscCode")}
              />
            </div>

            <div>
              <Input
                label="Branch"
                placeholder="Branch Name"
                {...register("branch")}
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  label="GST No."
                  placeholder="GST Number"
                  {...register("gstNo")}
                />
              </div>
              <button className="mt-7 h-[42px] rounded border border-blue-500 px-4 text-blue-500 transition-colors hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20">
                Verify
              </button>
            </div>

            <div>
              <Input
                label="PAN Card"
                placeholder="PAN Card Number"
                {...register("panCard")}
              />
            </div>

            <div>
              <Input
                label="Aadhar Card No"
                placeholder="Aadhar Number"
                {...register("aadharNo")}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
          <button
            type="button"
            onClick={handleBack}
            className="rounded border cursor-pointer border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded bg-blue-600 cursor-pointer px-6 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isEditMode ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewAccount;
