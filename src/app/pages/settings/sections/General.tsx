// Import Dependencies
import { PhoneIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { EnvelopeIcon, UserIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { HiPencil } from "react-icons/hi";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
// Local Imports
import { PreviewImg } from "@/components/shared/PreviewImg";
import { Avatar, Button, Input, Upload } from "@/components/ui";
import axios from "@/utils/axios";
import apiHelper from "@/utils/apiHelper";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import TextEditor from "@/components/shared/TextEditor";
import Quill from "quill";
import { toast } from "sonner";

const Delta = Quill.import("delta");
export default function General() {
  const [avatar, setAvatar] = useState<File | null>(null);
  const [company, setCompany] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [prefixes, setPrefixes] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingTerms, setSavingTerms] = useState(false);
  const [termsValue, setTermsValue] = useState(new Delta());
  const [newPrefix, setNewPrefix] = useState({
    prefixFor: "",
    prefix: "",
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
  const prefixForOptions = [
    { value: "CUSTOMER", label: "CUSTOMER" },
    { value: "CASH_RECEIPT", label: "CASH_RECEIPT" },
    { value: "VEHICLE_STOCK_TRANSFER", label: "VEHICLE_STOCK_TRANSFER" },
    { value: "BANK_RECEIPT", label: "BANK_RECEIPT" },
    { value: "CONTRA", label: "CONTRA" },
    { value: "ACCESSORIES_PURCHASE", label: "ACCESSORIES_PURCHASE" },
    { value: "BANK_PAYMENT", label: "BANK_PAYMENT" },
    { value: "CASH_PAYMENT", label: "CASH_PAYMENT" },
    { value: "PURCHASE", label: "PURCHASE" },
    { value: "VEHICLE", label: "VEHICLE" },
    { value: "QUOTATION", label: "QUOTATION" },
    { value: "LEAD", label: "LEAD" },
    { value: "JOBCARD", label: "JOB CARD" },
    { value: "ACCESSORIES_INVOICE", label: "ACCESSORIES_INVOICE" },
  ];

  useEffect(() => {
    fetchCompany();
    fetchPrefixes();
  }, []);
  // const fetchPrefixes = async () => {
  //   try {
  //     const res = await axios.get("/profile-prefix");

  //     setPrefixes(res.data.data || []);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
  // const fetchCompany = async () => {
  //   try {
  //     const response = await axios.get("/company");

  //     const data = response.data.data[0];

  //     console.log("Company:", data);

  //     console.log("Saved quotation terms:", data?.quotationTerms);

  //     setCompany(data);

  //     setCountry(data.country || "");
  //     setState(data.state || "");
  //     setCity(data.city || "");
  //     setDistrict(data.district || "");
  //     setStateCode(data.stateCode || "");
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
  // const handleSaveTerms = async () => {
  //   try {
  //     if (!company?.id) return;

  //     setSavingTerms(true);

  //     const formData = new FormData();

  //     formData.append("quotationTerms", company?.quotationTerms || "");

  //     await axios.put(`/company/${company.id}`, formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });

  //     await fetchCompany();
  //     toast.success("Quotation terms saved successfully");
  //   } catch (error) {
  //     console.error("Save quotation terms error:", error);
  //     toast.error("Failed to save quotation terms");
  //   } finally {
  //     setSavingTerms(false);
  //   }
  // };

  // const handleSavePrefix = async () => {
  //   try {
  //     if (editingId) {
  //       await axios.put(`/profile-prefix/${editingId}`, newPrefix);
  //       toast.success("Prefix updated successfully");
  //     } else {
  //       await axios.post("/profile-prefix", newPrefix);
  //       toast.success("Prefix added successfully");
  //     }

  //     setNewPrefix({
  //       prefixFor: "",
  //       prefix: "",
  //     });

  //     setEditingId(null);

  //     fetchPrefixes();
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Failed to save prefix");
  //   }
  // };

  // const handleEditPrefix = (item: any) => {
  //   setEditingId(item.id);
  //   setNewPrefix({
  //     prefixFor: item.prefixFor,
  //     prefix: item.prefix,
  //   });
  //   toast.info(`Editing prefix for ${item.prefixFor}`);
  // };

  // const handleSave = async () => {
  //   try {
  //     const formData = new FormData();

  //     Object.keys(company).forEach((key) => {
  //       if (company[key] !== undefined && company[key] !== null) {
  //         formData.append(key, company[key]);
  //       }
  //     });

  //     if (avatar) {
  //       formData.append("logo", avatar);
  //     }

  //     await axios.put(`/company/${company.id}`, formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });

  //     setIsEditing(false);
  //     setAvatar(null);

  //     fetchCompany();
  //     toast.success("Company updated successfully");
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Failed to update company");
  //   }
  // };

  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "transparent",

      borderColor: state.isFocused
        ? "var(--color-primary-600)"
        : "var(--color-dark-450)",

      boxShadow: "none",
      minHeight: "42px",

      "&:hover": {
        borderColor: state.isFocused
          ? "var(--color-primary-600)"
          : "var(--color-dark-400)",
      },
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
      border: "1px solid var(--color-dark-450)",
      borderRadius: "0.75rem",
    }),

    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "var(--color-primary-600)"
        : state.isFocused
          ? "var(--color-dark-600)"
          : "var(--color-dark-700)",
      color: "#fff",
    }),

    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: "var(--color-gray-400)",
    }),

    indicatorSeparator: () => ({
      display: "none",
    }),
  };
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h5 className="dark:text-dark-50 read-only: text-lg font-medium text-gray-800">
          {company?.companyName || "Company Name"}
        </h5>

        <div className="mt-4 flex flex-col space-y-1.5">
          <Avatar
            size={20}
            src={
              avatar
                ? URL.createObjectURL(avatar)
                : company?.logo
                  ? apiHelper.getImageUrl(company.logo)
                  : "/images/avatar/avatar-20.jpg"
            }
            classNames={{
              root: "ring-primary-600 dark:ring-primary-500 dark:ring-offset-dark-700 rounded-xl ring-offset-[3px] ring-offset-white transition-all hover:ring-3",
              display: "rounded-xl",
            }}
            indicator={
              isEditing && (
                <div className="dark:bg-dark-700 absolute right-0 bottom-0 -m-1 flex items-center justify-center rounded-full bg-white">
                  {avatar ? (
                    <Button
                      onClick={() => setAvatar(null)}
                      isIcon
                      className="size-6 rounded-full"
                    >
                      <XMarkIcon className="size-4" />
                    </Button>
                  ) : (
                    <Upload
                      name="avatar"
                      onChange={(files) => setAvatar(files[0])}
                      accept="image/*"
                    >
                      {(props) => (
                        <Button
                          isIcon
                          className="size-6 rounded-full"
                          {...props}
                        >
                          <HiPencil className="size-3.5" />
                        </Button>
                      )}
                    </Upload>
                  )}
                </div>
              )
            }
          />
        </div>
      </div>
      <div className="dark:bg-dark-500 my-5 h-px bg-gray-200" />

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 [&_.prefix]:pointer-events-none">
        <Input
          label="Company Name"
          value={company?.companyName || ""}
          readOnly={!isEditing}
          onChange={(e) =>
            setCompany({
              ...company,
              companyName: e.target.value,
            })
          }
          className="rounded-xl"
          prefix={<UserIcon className="size-4.5" />}
        />
        <Input
          label="Mobile Number"
          value={company?.mobileNumber || ""}
          readOnly={!isEditing}
          onChange={(e) =>
            setCompany({
              ...company,
              mobileNumber: e.target.value,
            })
          }
          className="rounded-xl"
          prefix={<PhoneIcon className="size-4.5" />}
        />

        <Input
          label="Phone Number"
          value={company?.phoneNumber || ""}
          readOnly={!isEditing}
          onChange={(e) =>
            setCompany({
              ...company,
              phoneNumber: e.target.value,
            })
          }
          className="rounded-xl"
          prefix={<PhoneIcon className="size-4.5" />}
        />
        <Input
          label="Email"
          type="email"
          value={company?.email || ""}
          readOnly={!isEditing}
          onChange={(e) =>
            setCompany({
              ...company,
              email: e.target.value,
            })
          }
          className="rounded-xl"
          prefix={<EnvelopeIcon className="size-4.5" />}
        />
        <Input
          label="GST Number"
          value={company?.gstNumber || ""}
          readOnly={!isEditing}
          onChange={(e) =>
            setCompany({
              ...company,
              gstNumber: e.target.value,
            })
          }
          className="rounded-xl"
        />

        <Input
          label="PAN Number"
          value={company?.panNumber || ""}
          readOnly={!isEditing}
          onChange={(e) =>
            setCompany({
              ...company,
              panNumber: e.target.value,
            })
          }
          className="rounded-xl"
        />

        <div>
          <label className="mb-1 inline-block">Country</label>
          <Select
            isDisabled={!isEditing}
            classNamePrefix="react-select"
            options={countryOptions}
            styles={customSelectStyles}
            value={countryOptions.find((c) => c.value === company?.country)}
            onChange={(selected: any) => {
              setCountry(selected?.value || "");

              setCompany({
                ...company,
                country: selected?.value || "",
                state: "",
                district: "",
                city: "",
              });
            }}
          />
        </div>

        <div>
          <label className="mb-1 inline-block">State</label>
          <Select
            isDisabled={!isEditing}
            classNamePrefix="react-select"
            options={stateOptions}
            styles={customSelectStyles}
            value={stateOptions.find((s) => s.value === company?.state)}
            onChange={(selected: any) => {
              setState(selected?.value || "");
              setStateCode(selected?.state?.isoCode || "");

              setCompany({
                ...company,
                state: selected?.value || "",
                stateCode: selected?.state?.isoCode || "",
              });
            }}
          />
        </div>

        <Input
          label="State Code"
          value={company?.stateCode || ""}
          readOnly
          className="rounded-xl"
        />

        <div>
          <label className="mb-1 inline-block">District</label>
          <Select
            isDisabled={!isEditing}
            classNamePrefix="react-select"
            options={cityOptions}
            styles={customSelectStyles}
            value={cityOptions.find((d) => d.value === company?.district)}
            onChange={(selected: any) => {
              setDistrict(selected?.value || "");

              setCompany({
                ...company,
                district: selected?.value || "",
              });
            }}
          />
        </div>

        <div>
          <label className="mb-1 inline-block">City</label>
          <Select
            isDisabled={!isEditing}
            classNamePrefix="react-select"
            options={cityOptions}
            styles={customSelectStyles}
            value={cityOptions.find((c) => c.value === company?.city)}
            onChange={(selected: any) => {
              setCity(selected?.value || "");

              setCompany({
                ...company,
                city: selected?.value || "",
              });
            }}
          />
        </div>
        <Input
          label="Pincode"
          value={company?.pincode || ""}
          readOnly={!isEditing}
          onChange={(e) =>
            setCompany({
              ...company,
              pincode: e.target.value,
            })
          }
          className="rounded-xl"
        />

        <Input
          label="Address Line 1"
          value={company?.addressLine1 || ""}
          readOnly={!isEditing}
          onChange={(e) =>
            setCompany({
              ...company,
              addressLine1: e.target.value,
            })
          }
          className="rounded-xl"
        />

        <Input
          label="Address Line 2"
          value={company?.addressLine2 || ""}
          readOnly={!isEditing}
          onChange={(e) =>
            setCompany({
              ...company,
              addressLine2: e.target.value,
            })
          }
          className="rounded-xl"
        />

        <Input
          label="Bank Name"
          value={company?.bankName || ""}
          readOnly={!isEditing}
          onChange={(e) =>
            setCompany({
              ...company,
              bankName: e.target.value,
            })
          }
          className="rounded-xl"
        />

        <Input
          label="Bank Holder Name"
          value={company?.bankHolderName || ""}
          readOnly={!isEditing}
          onChange={(e) =>
            setCompany({
              ...company,
              bankHolderName: e.target.value,
            })
          }
          className="rounded-xl"
        />
        <Input
          label="Account Number"
          type="text"
          inputMode="numeric"
          value={company?.accountNumber || ""}
          readOnly={!isEditing}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");

            setCompany({
              ...company,
              accountNumber: value,
            });
          }}
          className="rounded-xl"
        />
        <Input
          label="IFSC Code"
          value={company?.ifscCode || ""}
          readOnly={!isEditing}
          onChange={(e) =>
            setCompany({
              ...company,
              ifscCode: e.target.value,
            })
          }
          className="rounded-xl"
        />

        <Input
          label="Branch Location"
          value={company?.branchLocation || ""}
          readOnly={!isEditing}
          onChange={(e) =>
            setCompany({
              ...company,
              branchLocation: e.target.value,
            })
          }
          className="rounded-xl"
        />

        <Input
          label="Created At"
          value={
            company?.createdAt
              ? new Date(company.createdAt).toLocaleDateString()
              : ""
          }
          readOnly
          className="rounded-xl"
        />
        <Input
          label="Financial Year"
          value={company?.financialYears?.[0]?.financialYear || ""}
          readOnly
          className="rounded-xl"
        />
      </div>

      <div className="mt-8 flex justify-end gap-3">
        {!isEditing ? (
          <Button color="primary" onClick={() => setIsEditing(true)}>
            <PencilSquareIcon className="size-4" />
          </Button>
        ) : (
          <>
            <Button
              onClick={() => {
                setIsEditing(false);
                fetchCompany(); // restore original data
              }}
            >
              Cancel
            </Button>

            <Button color="primary" onClick={handleSave}>
              Save
            </Button>
          </>
        )}
      </div>
      <div className="dark:bg-dark-500 my-7 h-px bg-gray-200" />
      <div className="mt-8">
        <h3 className="mb-4 text-lg font-semibold">Prefix Settings</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* <Input
            label="Prefix For"
            value={newPrefix.prefixFor}
            onChange={(e) =>
              setNewPrefix({
                ...newPrefix,
                prefixFor: e.target.value.toUpperCase(),
              })
            }
            placeholder="CUSTOMER"
          /> */}
          <div>
            <label className="mb-1 inline-block">Prefix For</label>

            <Select
              classNamePrefix="react-select"
              styles={customSelectStyles}
              options={prefixForOptions}
              value={prefixForOptions.find(
                (item) => item.value === newPrefix.prefixFor,
              )}
              onChange={(selected: any) =>
                setNewPrefix({
                  ...newPrefix,
                  prefixFor: selected?.value || "",
                })
              }
              placeholder="Select Prefix"
            />
          </div>

          <Input
            label="Prefix"
            value={newPrefix.prefix}
            onChange={(e) =>
              setNewPrefix({
                ...newPrefix,
                prefix: e.target.value.toUpperCase(),
              })
            }
            placeholder="CUS"
          />

          <div className="flex items-end">
            <Button color="primary" onClick={handleSavePrefix}>
              {editingId ? "Update Prefix" : "Add Prefix"}
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-6 max-h-125 overflow-auto rounded-lg border border-gray-700">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-0 bg-white dark:bg-gray-900">
            <tr>
              <th className="sticky top-0 border border-gray-700 bg-white p-3 text-left dark:bg-gray-900">
                Prefix For
              </th>

              <th className="sticky top-0 border border-gray-700 bg-white p-3 text-left dark:bg-gray-900">
                Prefix
              </th>

              <th className="sticky top-0 border border-gray-700 bg-white p-3 text-center dark:bg-gray-900">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {prefixes.map((item) => (
              <tr key={item.id}>
                <td className="border border-gray-700 p-3">{item.prefixFor}</td>

                <td className="border border-gray-700 p-3">{item.prefix}</td>

                <td className="border border-gray-700 p-3 text-center">
                  <Button
                    isIcon
                    color="primary"
                    onClick={() => handleEditPrefix(item)}
                    className="size-8 rounded-lg"
                  >
                    <PencilSquareIcon className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8">
        <h3 className="mb-4 text-lg font-semibold">
          Quotation Terms & Conditions
        </h3>

        <TextEditor
          value={company?.quotationTerms || ""}
          onChange={(html) => {
            console.log("Updated terms:", html);

            setCompany((prev: any) => ({
              ...prev,
              quotationTerms: html,
            }));
          }}
        />

        <div className="mt-4 flex justify-end">
          <Button
            color="primary"
            onClick={handleSaveTerms}
            disabled={savingTerms}
          >
            {savingTerms ? "Saving..." : "Save Terms & Conditions"}
          </Button>
        </div>
      </div>
    </div>
  );
}
{
  /* <div>
        <div>
          <p className="dark:text-dark-100 text-base font-medium text-gray-800">
            Linked Accounts
          </p>
          <p className="mt-0.5">
            Manage your linked accounts and their permissions.
          </p>
        </div>
        <div>
          <div className="mt-4 flex items-center justify-between space-x-2">
            <div className="flex min-w-0 items-center space-x-4">
              <div className="size-12">
                <img
                  className="h-full w-full"
                  src="/images/logos/google.svg"
                  alt="logo"
                />
              </div>
              <p className="truncate font-medium">Sign In with Google</p>
            </div>
            <Button
              className="text-xs-plus h-8 rounded-full px-3"
              variant="outlined"
            >
              Connect
            </Button>
          </div>
          <div className="mt-4 flex items-center justify-between space-x-2">
            <div className="flex min-w-0 items-center space-x-4">
              <div className="size-12">
                <img
                  className="h-full w-full"
                  src="/images/logos/github-round.svg"
                  alt="logo"
                />
              </div>
              <p className="truncate font-medium">Sign In with Github</p>
            </div>
            <Button
              className="text-xs-plus h-8 rounded-full px-3"
              variant="outlined"
            >
              Connect
            </Button>
          </div>
          <div className="mt-4 flex items-center justify-between space-x-2">
            <div className="flex min-w-0 items-center space-x-4">
              <div className="size-12">
                <img
                  className="h-full w-full"
                  src="/images/logos/instagram-round.svg"
                  alt="logo"
                />
              </div>
              <p className="truncate font-medium">Sign In with Instagram</p>
            </div>
            <Button
              className="text-xs-plus h-8 rounded-full px-3"
              variant="outlined"
            >
              Connect
            </Button>
          </div>
          <div className="mt-4 flex items-center justify-between space-x-2">
            <div className="flex min-w-0 items-center space-x-4">
              <div className="size-12">
                <img
                  className="h-full w-full"
                  src="/images/logos/discord-round.svg"
                  alt="logo"
                />
              </div>
              <p className="truncate font-medium">Sign In with Discord</p>
            </div>
            <Button
              className="text-xs-plus h-8 rounded-full px-3"
              variant="outlined"
            >
              {" "}
              Connect
            </Button>
          </div>
        </div>
      </div> */
}
