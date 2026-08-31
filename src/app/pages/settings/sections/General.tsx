// Import Dependencies
import { PhoneIcon } from "@heroicons/react/20/solid";
import { EnvelopeIcon, UserIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { Avatar, Button, Input } from "@/components/ui";
import apiHelper from "@/utils/apiHelper";
import { toast } from "sonner";

export default function General() {
  const [vendorInfo, setVendorInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

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
      const res = await apiHelper.put("/vendor//update-password", {
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
      toast.error(
        error.response?.data?.message || "Failed to update password",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h5 className="dark:text-dark-50 text-lg font-medium text-gray-800">
          {vendorInfo?.name || "Vendor Profile"}
          
                  </h5>

        <div className="mt-4 flex flex-col space-y-1.5">
          <Avatar
            size={20}
            src={
              vendorInfo?.avatar
                ? apiHelper.getImageUrl(vendorInfo.avatar)
                : "/images/avatar/avatar-20.jpg"
            }
            classNames={{
              root: "ring-primary-600 dark:ring-primary-500 dark:ring-offset-dark-700 rounded-xl ring-offset-[3px] ring-offset-white transition-all",
              display: "rounded-xl",
            }}
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
                readOnly
                className="rounded-xl"
                prefix={<UserIcon className="size-4.5" />}
              />
              <Input
                label="Login Email"
                value={vendorInfo?.email || ""}
                readOnly
                className="rounded-xl"
                prefix={<EnvelopeIcon className="size-4.5" />}
              />
              <Input
                label="Mobile Number"
                value={vendorInfo?.number || ""}
                readOnly
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
              <Input
                label="Country"
                value={vendorInfo?.country || ""}
                readOnly
                className="rounded-xl"
              />
              <Input
                label="State"
                value={vendorInfo?.state || ""}
                readOnly
                className="rounded-xl"
              />
              <Input
                label="District"
                value={vendorInfo?.district || ""}
                readOnly
                className="rounded-xl"
              />
              <Input
                label="City"
                value={vendorInfo?.city || ""}
                readOnly
                className="rounded-xl"
              />
              <Input
                label="Pincode"
                value={vendorInfo?.pincode || ""}
                readOnly
                className="rounded-xl"
              />
              <Input
                label="Address"
                value={vendorInfo?.address || ""}
                readOnly
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
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="rounded-xl"
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="rounded-xl"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="rounded-xl"
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