// TestDriveModal.tsx
import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Combobox } from "@/components/shared/form/Combobox";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Timepicker } from "@/components/shared/form/Timepicker";
import apiHelper from "@/utils/apiHelper";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";

interface TestDriveFormData {
  modelId: number | null;
  showroomVariantId: number | null;
  colourId: number | null;
  testDriveDate: string;
  testDriveFromTime: string;
  testDriveToTime: string;
  duration: string;
  vehicleSpeedometerRunning: string;
  licenceNo: string;
  feedback: string;
  remarks: string;
  placeOfTestDrive: "Dealership" | "Other Place";
}

interface TestDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId?: number;
  onSuccess?: () => void;
}

// Feedback options
const feedbackOptions = [
  { id: "Excellent", name: "Excellent" },
  { id: "Good", name: "Good" },
  { id: "Average", name: "Average" },
  { id: "Poor", name: "Poor" },
];

const placeOptions = [
  { id: "Dealership", name: "Dealership" },
  { id: "Other Place", name: "Other Place" },
];

export function TestDriveModal({
  isOpen,
  onClose,
  leadId,
  onSuccess,
}: TestDriveModalProps) {
  const [models, setModels] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [filteredVariants, setFilteredVariants] = useState<any[]>([]);
  const [filteredColors, setFilteredColors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // React Hook Form implementation
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<TestDriveFormData>({
    defaultValues: {
      modelId: null,
      showroomVariantId: null,
      colourId: null,
      testDriveDate: "",
      testDriveFromTime: "",
      testDriveToTime: "",
      duration: "",
      vehicleSpeedometerRunning: "",
      licenceNo: "",
      feedback: "",
      remarks: "",
      placeOfTestDrive: "Dealership",
    },
  });

  // Watch values for dependent dropdowns
  const formModelId = watch("modelId");
  const formVariantId = watch("showroomVariantId");

  // Form validation rules
  const validationRules = {
    modelId: { required: "Model is required" },
    showroomVariantId: { required: "Variant is required" },
    colourId: { required: "Colour is required" },
    testDriveDate: { required: "Test Drive Date is required" },
    testDriveFromTime: { required: "From Time is required" },
    testDriveToTime: { required: "To Time is required" },
    duration: { required: "Duration is required" },
    licenceNo: { required: "Licence No is required" },
    feedback: { required: "Feedback is required" },
    vehicleSpeedometerRunning: {
      required: "Vehicle Speedometer Reading is required",
    },
  };

  // Fetch dropdown data
  useEffect(() => {
    if (isOpen) {
      fetchVariants();
      fetchModels();
      fetchColors();
      // Reset form when modal opens
      reset({
        modelId: null,
        showroomVariantId: null,
        colourId: null,
        testDriveDate: "",
        testDriveFromTime: "",
        testDriveToTime: "",
        duration: "",
        vehicleSpeedometerRunning: "",
        licenceNo: "",
        feedback: "",
        remarks: "",
        placeOfTestDrive: "Dealership",
      });
      setFilteredVariants([]);
      setFilteredColors([]);
    }
  }, [isOpen, reset]);

  const fetchModels = async () => {
    try {
      const res = await apiHelper.get("/model");
      const data = Array.isArray(res.data) ? res.data : [];
      setModels(
        data.map((item: any) => ({
          id: item.id,
          name: item.modelName,
        })),
      );
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  const fetchVariants = async () => {
    const res = await apiHelper.get("/showroom-variant");

    const data = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data)
        ? res.data
        : [];

    setVariants(data);
  };

  const fetchColors = async () => {
    try {
      const res = await apiHelper.get("/colours");
      const data = Array.isArray(res.data) ? res.data : [];
      setColors(
        data.map((item: any) => ({
          id: item.id,
          name: item.colourName,
          showroomVariantId: item.showroomVariantId,
        })),
      );
    } catch (error) {
      console.error("Error fetching colors:", error);
    }
  };

  // Handle Model Change
  const handleModelChange = (selectedOption: any) => {
    const modelId = selectedOption?.id || null;

    setValue("modelId", modelId);
    setValue("showroomVariantId", null);
    setValue("colourId", null);

    if (modelId) {
      const filtered = variants.filter(
        (v: any) => Number(v.modelId) === Number(modelId),
      );

      setFilteredVariants(
        filtered.map((item: any) => ({
          id: item.id,
          name: item.variantName,
          modelId: item.modelId,
        })),
      );

      setFilteredColors([]);
    } else {
      setFilteredVariants([]);
      setFilteredColors([]);
    }
  };

  // Handle Variant Change
  const handleVariantChange = (selectedOption: any) => {
    const variantId = selectedOption?.id || null;
    setValue("showroomVariantId", variantId);
    setValue("colourId", null);

    if (variantId) {
      const filtered = colors.filter(
        (c: any) => Number(c.showroomVariantId) === Number(variantId),
      );
      setFilteredColors(filtered);
    } else {
      setFilteredColors([]);
    }
  };

  // Handle Color Change
  const handleColorChange = (selectedOption: any) => {
    setValue("colourId", selectedOption?.id || null);
  };

  // Handle Feedback Change
  const handleFeedbackChange = (selectedOption: any) => {
    setValue("feedback", selectedOption?.id || "");
  };

  // Form submission
  const onFormSubmit = async (data: TestDriveFormData) => {
    setLoading(true);
    try {
      const payload = {
        leadId: leadId,
        modelId: data.modelId,
        showroomVariantId: data.showroomVariantId,
        colourId: data.colourId,
        testDriveDate: data.testDriveDate,
        testDriveFromTime: data.testDriveFromTime,
        testDriveToTime: data.testDriveToTime,
        duration: data.duration,
        vehicleSpeedometerRunning: data.vehicleSpeedometerRunning,
        licenceNo: data.licenceNo,
        feedback: data.feedback,
        remarks: data.remarks,
        placeOfTestDrive: data.placeOfTestDrive,
      };

      await apiHelper.post("/test-drives", payload);

      toast.success("Test drive added successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error submitting test drive:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to add test drive. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/30 dark:bg-black/60"
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <DialogPanel className="dark:bg-dark-700 flex h-full w-screen max-w-2xl flex-col bg-white shadow-xl">
          {/* Header */}
          <div className="dark:bg-dark-600 flex items-center justify-between bg-[#003399] px-6 py-4">
            <DialogTitle className="dark:text-dark-50 font-semibold text-white">
              Add Test Drive
            </DialogTitle>
            <button
              onClick={onClose}
              className="dark:text-dark-200 text-white/80 hover:text-white dark:hover:text-white"
            >
              <XMarkIcon className="size-5" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit(onFormSubmit)}
            className="flex flex-1 flex-col"
          >
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Model */}
                <div className="flex flex-col gap-1">
                  <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="modelId"
                    control={control}
                    rules={validationRules.modelId}
                    render={({ field, fieldState }) => (
                      <Combobox
                        data={models}
                        displayField="name"
                        value={models.find((m) => m.id === field.value) || null}
                        onChange={handleModelChange}
                        placeholder="Select Model"
                        searchFields={["name"]}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>

                {/* Variant */}
                <div className="flex flex-col gap-1">
                  <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                    Variant <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="showroomVariantId"
                    control={control}
                    rules={validationRules.showroomVariantId}
                    render={({ field, fieldState }) => (
                      <Combobox
                        data={filteredVariants}
                        displayField="name"
                        value={
                          filteredVariants.find((v) => v.id === field.value) ||
                          null
                        }
                        onChange={handleVariantChange}
                        placeholder={
                          formModelId ? "Select Variant" : "First select model"
                        }
                        searchFields={["name"]}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>

                {/* Colour */}
                <div className="flex flex-col gap-1">
                  <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                    Colour <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="colourId"
                    control={control}
                    rules={validationRules.colourId}
                    render={({ field, fieldState }) => (
                      <Combobox
                        data={filteredColors}
                        displayField="name"
                        value={
                          filteredColors.find((c) => c.id === field.value) ||
                          null
                        }
                        onChange={handleColorChange}
                        placeholder={
                          formVariantId
                            ? "Select Colour"
                            : "First select variant"
                        }
                        searchFields={["name"]}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>

                {/* Test Drive Date */}
                <div className="flex flex-col gap-1">
                  <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                    Test Drive Date <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="testDriveDate"
                    control={control}
                    rules={validationRules.testDriveDate}
                    render={({ field, fieldState }) => (
                      <DatePicker
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                        placeholder="DD-MM-YYYY"
                        options={{ dateFormat: "d-m-Y", disableMobile: true }}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>

                {/* Test Drive From Time */}
                <div className="flex flex-col gap-1">
                  <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                    From Time <span className="text-red-500">*</span>
                  </label>

                  <Controller
                    name="testDriveFromTime"
                    control={control}
                    rules={validationRules.testDriveFromTime}
                    render={({ field, fieldState }) => (
                      <>
                        <Timepicker
                          value={field.value}
                          onChange={(val) => field.onChange(val)}
                          placeholder="Select time"
                        />

                        {fieldState.error && (
                          <p className="mt-1 text-xs text-red-500">
                            {fieldState.error.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>

                {/* Test Drive To Time */}
                <div className="flex flex-col gap-1">
                  <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                    To Time <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="testDriveToTime"
                    control={control}
                    rules={validationRules.testDriveToTime}
                    render={({ field, fieldState }) => (
                      <>
                        <Timepicker
                          value={field.value}
                          onChange={(val) => field.onChange(val)}
                          placeholder="Select time"
                        />

                        {fieldState.error && (
                          <p className="mt-1 text-xs text-red-500">
                            {fieldState.error.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>

                {/* Duration */}
                <div className="flex flex-col gap-1">
                  <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 30 mins"
                    {...register("duration", validationRules.duration)}
                    className={`dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      errors.duration
                        ? "border-red-500 dark:border-red-500"
                        : "dark:border-dark-500 border-gray-300"
                    }`}
                  />
                  {errors.duration && (
                    <span className="text-xs text-red-500">
                      {errors.duration.message}
                    </span>
                  )}
                </div>

                {/* Vehicle Speedometer Running */}
                <div className="flex flex-col gap-1">
                  <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                    <span className="md:hidden">Vehicle Speedometer</span>
                    <span className="hidden md:inline">
                      Vehicle Speedometer Running{" "}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter reading"
                    {...register(
                      "vehicleSpeedometerRunning",
                      validationRules.vehicleSpeedometerRunning,
                    )}
                    className={`dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      errors.vehicleSpeedometerRunning
                        ? "border-red-500 dark:border-red-500"
                        : "dark:border-dark-500 border-gray-300"
                    }`}
                  />
                  {errors.vehicleSpeedometerRunning && (
                    <span className="text-xs text-red-500">
                      {errors.vehicleSpeedometerRunning.message}
                    </span>
                  )}
                </div>

                {/* Licence No */}
                <div className="flex flex-col gap-1">
                  <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                    Licence No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter licence number"
                    {...register("licenceNo", validationRules.licenceNo)}
                    className={`dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      errors.licenceNo
                        ? "border-red-500 dark:border-red-500"
                        : "dark:border-dark-500 border-gray-300"
                    }`}
                  />
                  {errors.licenceNo && (
                    <span className="text-xs text-red-500">
                      {errors.licenceNo.message}
                    </span>
                  )}
                </div>

                {/* Feedback */}
                <div className="flex flex-col gap-1">
                  <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                    Feedback <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="feedback"
                    control={control}
                    rules={validationRules.feedback}
                    render={({ field, fieldState }) => (
                      <Combobox
                        data={feedbackOptions}
                        displayField="name"
                        value={
                          feedbackOptions.find((f) => f.id === field.value) ||
                          null
                        }
                        onChange={handleFeedbackChange}
                        placeholder="Select Feedback"
                        searchFields={["name"]}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>

                {/* Remarks - Full Width */}
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                    Remarks
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter remarks"
                    {...register("remarks")}
                    className="dark:bg-dark-800 dark:border-dark-500 dark:text-dark-200 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Place of Test Drive - Full Width */}
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="dark:text-dark-200 text-sm font-medium text-gray-700">
                    Mention the Place of Test Drive Given
                  </label>
                  <Controller
                    name="placeOfTestDrive"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-6">
                        {placeOptions.map((option) => (
                          <label
                            key={option.id}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <input
                              type="radio"
                              value={option.id}
                              checked={field.value === option.id}
                              onChange={() => field.onChange(option.id)}
                              className="h-4 w-4 accent-blue-600"
                            />
                            {option.name}
                          </label>
                        ))}
                      </div>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="dark:border-dark-500 flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="dark:border-dark-500 dark:text-dark-200 dark:hover:bg-dark-600 rounded-lg border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 cursor-pointer rounded-lg px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
