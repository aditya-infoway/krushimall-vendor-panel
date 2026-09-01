// Import Dependencies
import { PhoneIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { EnvelopeIcon, UserIcon } from "@heroicons/react/24/outline";
import {
  PencilSquareIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { HiPencil } from "react-icons/hi";
import { useState, useEffect } from "react";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import { toast } from "sonner";

// Local Imports
import { Avatar, Button, Input, Upload } from "@/components/ui";
import apiHelper from "@/utils/apiHelper";

export default function General() {
  const [vendorInfo, setVendorInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const countryOptions = Country.getAllCountries().map((c) => ({
    value: c.isoCode,
    label: c.name,
  }));

  // Backend stores country/state as plain names, not ISO codes —
  // derive the ISO codes from the names so the selects can match & cascade.
  const countryIso =
    Country.getAllCountries().find((c) => c.name === vendorInfo?.country)
      ?.isoCode || "";

  const stateList = State.getStatesOfCountry(countryIso);
  const stateIso =
    stateList.find((s) => s.name === vendorInfo?.state)?.isoCode || "";

  const stateOptions = stateList.map((s) => ({
    value: s.isoCode,
    label: s.name,
    state: s,
  }));
  const cityOptions = City.getCitiesOfState(countryIso, stateIso).map((c) => ({
    value: c.name,
    label: c.name,
  }));

  useEffect(() => {
    fetchVendorInfo();
  }, []);

  const fetchVendorInfo = async () => {
    try {
      setLoading(true);
      const res = await apiHelper.get("/vendor/me");
      if (res.success) {
        setVendorInfo(res.vendor);
      } else {
        toast.error(res.message || "Failed to load vendor details");
      }
    } catch (error: any) {
      console.error("fetchVendorInfo error:", error);
      toast.error(
        error.response?.data?.message || "Failed to load vendor details",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const formData = new FormData();
      const editableFields = [
        "name",
        "number",
        "email",
        "country",
        "state",
        "district",
        "city",
        "address",
        "pincode",
      ];

      editableFields.forEach((key) => {
        if (vendorInfo?.[key] !== undefined && vendorInfo?.[key] !== null) {
          formData.append(key, vendorInfo[key]);
        }
      });

      if (avatar) {
        formData.append("avatar", avatar);
      }

      const res = await apiHelper.put("/vendor/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.success) {
        toast.success("Vendor details updated successfully");
        setIsEditing(false);
        setAvatar(null);
        fetchVendorInfo();
      } else {
        toast.error(res.message || "Failed to update vendor details");
      }
    } catch (error: any) {
      console.error("handleSave error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update vendor details",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatar(null);
    fetchVendorInfo(); // restore original data
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please fill all password fields");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    try {
      setChangingPassword(true);
      const res = await apiHelper.put("/vendor/update-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (res.success) {
        toast.success("Password updated successfully");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
      } else {
        toast.error(res.message || "Failed to update password");
      }
    } catch (error: any) {
      console.error("handleChangePassword error:", error);
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

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
        <div className="flex-col">
          <h5 className="dark:text-dark-50 text-lg font-medium text-gray-800">
            {vendorInfo?.name || "Vendor Profile"}
          </h5>
          <h1>Vendor Type : {vendorInfo?.vendorType}</h1>
        </div>
        <div className="mt-4 flex flex-col space-y-1.5">
          <Avatar
            size={20}
            src={
              avatar
                ? URL.createObjectURL(avatar)
                : vendorInfo?.avatar
                  ? apiHelper.getImageUrl(vendorInfo.avatar)
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

      {loading ? (
        <p className="text-sm text-gray-500">Loading vendor details...</p>
      ) : (
        <>
          {/* ===== Vendor Login Details ===== */}
          <div className="mt-5">
            <h3 className="mb-4 text-base font-semibold">
              Vendor Login Details
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Full Name"
                value={vendorInfo?.name || ""}
                readOnly={!isEditing}
                onChange={(e) =>
                  setVendorInfo({ ...vendorInfo, name: e.target.value })
                }
                className="rounded-xl"
                prefix={<UserIcon className="size-4.5" />}
              />
              <Input
                label="Login Email"
                value={vendorInfo?.email || ""}
                readOnly={!isEditing}
                onChange={(e) =>
                  setVendorInfo({ ...vendorInfo, email: e.target.value })
                }
                className="rounded-xl"
                prefix={<EnvelopeIcon className="size-4.5" />}
              />
              <Input
                label="Mobile Number"
                value={vendorInfo?.number || ""}
                readOnly={!isEditing}
                onChange={(e) =>
                  setVendorInfo({ ...vendorInfo, number: e.target.value })
                }
                className="rounded-xl"
                prefix={<PhoneIcon className="size-4.5" />}
              />

              <Input
                label="Vendor Type"
                value={vendorInfo?.vendorType || ""}
                readOnly
                className="rounded-xl"
              />
              {vendorInfo?.vehicleType && (
                <Input
                  label="Vehicle Type"
                  value={vendorInfo.vehicleType}
                  readOnly
                  className="rounded-xl"
                />
              )}
              <Input
                label="Vendor Status"
                value={vendorInfo?.status || ""}
                readOnly
                className="rounded-xl"
              />
              <Input
                label="Verified"
                value={vendorInfo?.isVerified ? "Yes" : "No"}
                readOnly
                className="rounded-xl"
              />

              <div>
                <label className="mb-1 inline-block">Country</label>
                <Select
                  isDisabled={!isEditing}
                  classNamePrefix="react-select"
                  options={countryOptions}
                  styles={customSelectStyles}
                  value={countryOptions.find((c) => c.value === countryIso)}
                  onChange={(selected: any) =>
                    setVendorInfo({
                      ...vendorInfo,
                      country: selected?.label || "",
                      state: "",
                      district: "",
                      city: "",
                    })
                  }
                />
              </div>

              <div>
                <label className="mb-1 inline-block">State</label>
                <Select
                  isDisabled={!isEditing}
                  classNamePrefix="react-select"
                  options={stateOptions}
                  styles={customSelectStyles}
                  value={stateOptions.find((s) => s.value === stateIso)}
                  onChange={(selected: any) =>
                    setVendorInfo({
                      ...vendorInfo,
                      state: selected?.label || "",
                      district: "",
                      city: "",
                    })
                  }
                />
              </div>

              <div>
                <label className="mb-1 inline-block">District</label>
                <Select
                  isDisabled={!isEditing}
                  classNamePrefix="react-select"
                  options={cityOptions}
                  styles={customSelectStyles}
                  value={cityOptions.find(
                    (d) => d.value === vendorInfo?.district,
                  )}
                  onChange={(selected: any) =>
                    setVendorInfo({
                      ...vendorInfo,
                      district: selected?.value || "",
                    })
                  }
                />
              </div>

              <div>
                <label className="mb-1 inline-block">City</label>
                <Select
                  isDisabled={!isEditing}
                  classNamePrefix="react-select"
                  options={cityOptions}
                  styles={customSelectStyles}
                  value={cityOptions.find((c) => c.value === vendorInfo?.city)}
                  onChange={(selected: any) =>
                    setVendorInfo({
                      ...vendorInfo,
                      city: selected?.value || "",
                    })
                  }
                />
              </div>

              <Input
                label="Pincode"
                value={vendorInfo?.pincode || ""}
                readOnly={!isEditing}
                onChange={(e) =>
                  setVendorInfo({ ...vendorInfo, pincode: e.target.value })
                }
                className="rounded-xl"
              />
              <Input
                label="Address"
                value={vendorInfo?.address || ""}
                readOnly={!isEditing}
                onChange={(e) =>
                  setVendorInfo({ ...vendorInfo, address: e.target.value })
                }
                className="rounded-xl sm:col-span-2"
              />
              <Input
                label="Joined On"
                value={
                  vendorInfo?.createdAt
                    ? new Date(vendorInfo.createdAt).toLocaleDateString()
                    : ""
                }
                readOnly
                className="rounded-xl"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              {!isEditing ? (
                <Button color="primary" onClick={() => setIsEditing(true)}>
                  <PencilSquareIcon className="size-4" />
                </Button>
              ) : (
                <>
                  <Button onClick={handleCancel} disabled={saving}>
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="dark:bg-dark-500 my-7 h-px bg-gray-200" />

          {/* ===== Change Password ===== */}
          <div>
            <h3 className="mb-4 text-base font-semibold">Change Password</h3>

            {!showPasswordForm ? (
              <Button color="primary" onClick={() => setShowPasswordForm(true)}>
                Change Password
              </Button>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input
                  label="Current Password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="rounded-xl"
                  suffix={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showCurrentPassword ? (
                        <EyeSlashIcon className="size-4.5" />
                      ) : (
                        <EyeIcon className="size-4.5" />
                      )}
                    </button>
                  }
                />
                <Input
                  label="New Password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="rounded-xl"
                  suffix={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="size-4.5" />
                      ) : (
                        <EyeIcon className="size-4.5" />
                      )}
                    </button>
                  }
                />
                <Input
                  label="Confirm New Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="rounded-xl"
                  suffix={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="size-4.5" />
                      ) : (
                        <EyeIcon className="size-4.5" />
                      )}
                    </button>
                  }
                />

                <div className="col-span-full flex gap-3">
                  <Button
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                  >
                    {changingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
