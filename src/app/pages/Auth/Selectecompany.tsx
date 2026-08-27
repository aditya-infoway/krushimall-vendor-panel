import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Logo from "@/assets/appLogo.svg?react";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import { Input } from "@/components/ui";
import apiHelper from "@/utils/apiHelper"; 
interface Company {
  id: number;
  companyName: string;
  financialYears: {
        id: number;
financialYear: string;
    fyStartDate: string;
    fyEndDate: string;
  }[];
}

export default function Selectcomapny() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [stateCode, setStateCode] = useState("");

  const getCurrentFinancialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const fyStartYear = month >= 4 ? year : year - 1;
    const fyEndYear = fyStartYear + 1;

    return {
      startDate: `${fyStartYear}-04-01`,
      endDate: `${fyEndYear}-03-31`,
      financialYear: `${fyStartYear}-${fyEndYear}`,
    };
  };

  const fy = getCurrentFinancialYear();
  const [formData, setFormData] = useState({
    companyName: "",
    logo: null as File | null,
 email: "",
  accountNumber: "",
    country: "",
    state: "",
    stateCode: "",
    district: "",
    city: "",
    pincode: "",

    addressLine1: "",
    addressLine2: "",

    mobileNumber: "",
    phoneNumber: "",

    gstNumber: "",
    panNumber: "",

    bankName: "",
    bankHolderName: "",
    ifscCode: "",
    branchLocation: "",

    fyStartDate: fy.startDate,
    fyEndDate: fy.endDate,
    financialYear: fy.financialYear,
  });
  const countryOptions = Country.getAllCountries().map((country) => ({
    value: country.isoCode,
    label: country.name,
  }));
  const stateOptions = State.getStatesOfCountry(country).map((state) => ({
    value: state.isoCode,
    label: state.name,
    state,
  }));
  const cityOptions = City.getCitiesOfState(country, state).map((city) => ({
    value: city.name,
    label: city.name,
  }));
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const [errors, setErrors] = useState({
    companyName: "",
    country: "",
     email: "",
  accountNumber: "",
    state: "",
    district: "",
    city: "",
    pincode: "",
    addressLine1: "",
    mobileNumber: "",
    gstNumber: "",
    panNumber: "",
    bankName: "",
    bankHolderName: "",
    ifscCode: "",
    branchLocation: "",
  });
  const validateForm = () => {
    const newErrors = {
      companyName: !formData.companyName ? "Company Name is required" : "",
email: !formData.email
  ? "Email is required"
  : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ? "Enter a valid email"
    : "",

accountNumber: !formData.accountNumber
  ? "Account Number is required"
  : "",
      country: !country ? "Country is required" : "",

      state: !state ? "State is required" : "",

      district: !district ? "District is required" : "",

      city: !city ? "City is required" : "",

      pincode: !formData.pincode ? "Pincode is required" : "",

      addressLine1: !formData.addressLine1 ? "Address Line 1 is required" : "",

      mobileNumber: !formData.mobileNumber
        ? "Mobile Number is required"
        : formData.mobileNumber.length !== 10
          ? "Mobile Number must be 10 digits"
          : "",

      gstNumber: !formData.gstNumber ? "GST Number is required" : "",

      panNumber: !formData.panNumber ? "PAN Number is required" : "",

      bankName: !formData.bankName ? "Bank Name is required" : "",

      bankHolderName: !formData.bankHolderName
        ? "Bank Holder Name is required"
        : "",

      ifscCode: !formData.ifscCode ? "IFSC Code is required" : "",

      branchLocation: !formData.branchLocation
        ? "Branch Location is required"
        : "",
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some(Boolean);
  };
  useEffect(() => {
    fetchCompanies();
  }, []);

 const fetchCompanies = async () => {
  try {
    const response = await apiHelper.get("/company");   // response = response.data already
    setCompanies(response.data);                         // agar backend { data: [...] } bhejta hai
  } catch (error) {
    console.error(error);
  }
};

const handleSave = async () => {
  if (!validateForm()) return;

  try {
    const payload = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        payload.append(key, value as any);
      }
    });

    await apiHelper.post("/company", payload);   // ✅ badla

    await fetchCompanies();
    setShowForm(false);
    alert("Company Created Successfully");
  } catch (error) {
    console.error(error);
  }
};
 const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: "transparent",
    borderColor: state.isFocused
      ? "var(--color-primary-600)"
      : "var(--color-gray-300)",
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
const handleSelectCompany = (company: Company) => {
 

  const financialYear = company.financialYears?.[0];
 

  if (!financialYear) {
    alert("Financial year not found");
    return;
  }

  sessionStorage.setItem("companyId", String(company.id));
  sessionStorage.setItem("companyName", company.companyName);

  sessionStorage.setItem("financialYearId", String(financialYear.id));
  sessionStorage.setItem("financialYear", financialYear.financialYear);
  sessionStorage.setItem("fyStartDate", financialYear.fyStartDate);
  sessionStorage.setItem("fyEndDate", financialYear.fyEndDate);

 

  navigate("/dashboards/dashboard");
};
  return (
    <div className="dark:bg-dark-900 flex h-screen bg-gray-100">
      {/* Left Side */}
      <div className="dark:bg-dark-700 flex w-full flex-col bg-white p-8 xl:w-1/2">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo className="mx-auto size-16" />
        </div>

        {/* Heading */}
        <div className="mb-5 flex items-center gap-3">
          <div className="bg-primary-500 h-7 w-2 rounded"></div>

          <h2 className="dark:text-dark-50 text-2xl font-bold text-gray-800">
            Select Company
          </h2>
        </div>

        {/* Company Table */}
        {!showForm ? (
          <>
            {/* Company Table */}
          <div className="h-100 overflow-auto rounded-lg border">
              <table className="w-full ">
                <thead className="dark:bg-dark-600 sticky top-0 bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Company Name</th>
                    <th className="p-3 text-left">Fy Start Date</th>
                    <th className="p-3 text-left">Fy End Date</th>
                  </tr>
                </thead>

                <tbody>
                  {companies.length > 0 ? (
                    companies.map((company) => (
                     <tr
  key={company.id}
  onClick={() => handleSelectCompany(company)}
  className="cursor-pointer border-t hover:bg-gray-50"
>
                        <td className="p-3">{company.companyName}</td>

                        <td className="p-3">
                          {company.financialYears?.[0]?.fyStartDate
                            ? new Date(
                                company.financialYears[0].fyStartDate,
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="p-3">
                          {company.financialYears?.[0]?.fyEndDate
                            ? new Date(
                                company.financialYears[0].fyEndDate,
                              ).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-10 text-center text-gray-500"
                      >
                        No Companies Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {companies.length === 0 && (
              <div className="mt-5">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-primary-500 hover:bg-primary-600 w-full rounded-lg py-3 font-medium text-white"
                >
                  + Create Company
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 overflow-auto rounded-lg border p-6">
            <h3 className="mb-6 text-xl font-semibold">Create Company</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 inline-block">Company Name</label>
                <Input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Company Name"
                  className="w-full rounded border p-3"
                  error={errors.companyName}
                />
              </div>
              <div>
                <label className="mb-1 inline-block">Choose Logo</label>
                <Input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;

                    setFormData({
                      ...formData,
                      logo: file,
                    });
                  }}
                  className="w-full rounded border p-3"
                />
              </div>
              <div>
                <label className="mb-1 inline-block">Country</label>
                <Select
                  options={countryOptions}
                  styles={customSelectStyles}
                  placeholder="Search Country"
                  onChange={(selected) => {
                    setCountry(selected?.value || "");

                    setFormData({
                      ...formData,
                      country: selected?.value || "",
                    });

                    setState("");
                    setCity("");
                  }}
                />
                {errors.country && (
                  <p className="text-error dark:text-error-lighter mt-1 text-xs">
                    {errors.country}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 inline-block">State</label>
                <Select
                  options={stateOptions}
                  styles={customSelectStyles}
                  placeholder="Search State"
                  isDisabled={!country}
                  onChange={(selected: any) => {
                    setState(selected?.value || "");
                    setStateCode(selected?.state?.isoCode || "");

                    setFormData({
                      ...formData,
                      state: selected?.value || "",
                      stateCode: selected?.state?.isoCode || "",
                    });
                  }}
                />
                {errors.state && (
                  <p className="text-error dark:text-error-lighter mt-1 text-xs">
                    {errors.state}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 inline-block">State Code</label>
                <Input
                  type="text"
                  value={stateCode}
                  readOnly
                  className="w-full rounded border bg-gray-100 p-3"
                />
              </div>
              <div>
                <label className="mb-1 inline-block">District</label>
                <Select
                  options={cityOptions}
                  styles={customSelectStyles}
                  placeholder="Select District"
                  isDisabled={!state}
                  onChange={(selected: any) => {
                    setDistrict(selected?.value || "");

                    setFormData({
                      ...formData,
                      district: selected?.value || "",
                    });
                  }}
                />
                {errors.district && (
                  <p className="text-error dark:text-error-lighter mt-1 text-xs">
                    {errors.district}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 inline-block">City</label>
                <Select
                  options={cityOptions}
                  styles={customSelectStyles}
                  placeholder="Search City"
                  isDisabled={!state}
                  onChange={(selected) => {
                    setCity(selected?.value || "");

                    setFormData({
                      ...formData,
                      city: selected?.value || "",
                    });
                  }}
                />
                {errors.city && (
                  <p className="text-error dark:text-error-lighter mt-1 text-xs">
                    {errors.city}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 inline-block">Pincode</label>
                <Input
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="Pincode"
                  className="w-full rounded border p-3"
                  error={errors.pincode}
                />
              </div>
              <div>
                <label className="mb-1 inline-block">Address Line 1</label>
                <Input
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Address Line 1"
                  className="w-full rounded border p-3"
                  error={errors.addressLine1}
                />
              </div>
              <div>
                <label className="mb-1 inline-block">Address Line 2</label>
                <Input
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Address Line 2"
                  className="w-full rounded border p-3"
                />
              </div>
              <div>
                <label className="mb-1 inline-block">Mobile Number</label>
                <Input
                  type="text"
                  placeholder="Mobile Number"
                  value={formData.mobileNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");

                    setFormData({
                      ...formData,
                      mobileNumber: value,
                    });

                    setErrors({
                      ...errors,
                      mobileNumber:
                        value.length > 10
                          ? "Mobile Number cannot exceed 10 digits"
                          : "",
                    });
                  }}
                  error={errors.mobileNumber}
                />
              </div>
              <div>
                <label className="mb-1 inline-block">Phone Number</label>
                <Input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="Phone Number"
                  className="w-full rounded border p-3"
                />
              </div>
              <div>
  <label className="mb-1 inline-block">Email</label>

  <Input
    name="email"
    value={formData.email}
    onChange={handleInputChange}
    type="email"
    placeholder="Company Email"
    className="w-full rounded border p-3"
     error={errors.email}
  />
</div>
              <div>
                <label className="mb-1 inline-block">GST Number</label>
                <Input
                  type="text"
                  placeholder="GST Number"
                  value={formData.gstNumber}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();

                    setFormData({
                      ...formData,
                      gstNumber: value,
                    });

                    setErrors({
                      ...errors,
                      gstNumber:
                        value.length > 15
                          ? "GST Number cannot exceed 15 characters"
                          : "",
                    });
                  }}
                  error={errors.gstNumber}
                />
              </div>
              <div>
                <label className="mb-1 inline-block">PAN Number</label>
                <Input
                  type="text"
                  placeholder="PAN Number"
                  value={formData.panNumber}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();

                    setFormData({
                      ...formData,
                      panNumber: value,
                    });

                    setErrors({
                      ...errors,
                      panNumber:
                        value.length > 10
                          ? "PAN Number cannot exceed 10 characters"
                          : "",
                    });
                  }}
                  error={errors.panNumber}
                />
              </div>
              <div>
                <label className="mb-1 inline-block">Bank Name</label>
                <Input
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Bank Name"
                  className="w-full rounded border p-3"
                  error={errors.bankName}
                />
              </div>
              <div>
                <label className="mb-1 inline-block">Bank Holder Name</label>
                <Input
                  name="bankHolderName"
                  value={formData.bankHolderName}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Bank Holder Name"
                  className="w-full rounded border p-3"
                  error={errors.bankHolderName}
                />
              </div>
              <div>
  <label className="mb-1 inline-block">Account Number</label>

   <Input
    name="accountNumber"
    value={formData.accountNumber}
    onChange={(e) => {
      const value = e.target.value.replace(/\D/g, "");

      setFormData((prev) => ({
        ...prev,
        accountNumber: value,
      }));
    }}
    type="text"
    inputMode="numeric"
    placeholder="Bank Account Number"
    className="w-full rounded border p-3"
    error={errors.accountNumber}
  />
</div>
              <div>
                <label className="mb-1 inline-block">IFSC Code</label>
                <Input
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="IFSC Code"
                  className="w-full rounded border p-3"
                  error={errors.ifscCode}
                />
              </div>
              <div>
                <label className="mb-1 inline-block">Branch Location</label>
                <Input
                  name="branchLocation"
                  value={formData.branchLocation}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Branch Location"
                  className="w-full rounded border p-3"
                  error={errors.branchLocation}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm">FY Start Date</label>

                <Input type="date" value={fy.startDate} readOnly />
              </div>

              <div>
                <label className="mb-1 block text-sm">FY End Date</label>

                <Input type="date" value={fy.endDate} readOnly />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="rounded border px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="bg-primary-500 hover:bg-primary-600 rounded px-4 py-2 text-white"
              >
                Save Company
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="hidden h-full xl:block xl:w-1/2">
        {" "}
        <img
          src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a"
          alt="company"
          className="h-full w-full object-cover"
        />{" "}
      </div>
    </div>
  );
}
