// Import Dependencies
import { useState, useEffect } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import apiHelper from "@/utils/apiHelper";
// Local Imports
import { Button } from "@/components/ui";
import { useKYCFormContext } from "../KYCFormContext";
import {
  Gauge,
  Tractor,
  Fuel,
  CalendarDays,
  Image as ImageIcon,
  Video,
  FileText,
  ChevronLeft,
  Save,
  Send,
} from "lucide-react";
import { data } from "react-router";
import { toast } from "sonner";
// ----------------------------------------------------------------------

export function PreviewSubmit({
  setCurrentStep,
  setFinished,
  websiteVariantId,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  setFinished: React.Dispatch<React.SetStateAction<boolean>>;
  websiteVariantId?: number | string;
}) {
  // const kycFormCtx = useKYCFormContext();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  // const formData = kycFormCtx.state.formData;
  const [showGallery, setShowGallery] = useState(false);
  const [tractorData, setTractorData] = useState<any>(null);
  useEffect(() => {
    if (images.length > 0) {
      setSelectedIndex(0);
    }
  }, [tractorData]);

  const images = [
    tractorData?.frontView,
    tractorData?.leftView,
    tractorData?.rightView,
    tractorData?.rearView,
    tractorData?.engineView,
    tractorData?.dashboardView,
    tractorData?.tyreView,
    tractorData?.hydraulicView,
    tractorData?.ptoView,
    tractorData?.additionalImage1,
    tractorData?.additionalImage2,
    tractorData?.additionalImage3,
    tractorData?.additionalImage4,
    tractorData?.additionalImage5,
  ].filter(Boolean);
  const selectedImage = images[selectedIndex];
  //   const images = [...new Set([
  //   tractorData?.frontView,
  //   tractorData?.leftView,
  //   tractorData?.rightView,
  //   tractorData?.rearView,
  //   tractorData?.engineView,
  //   tractorData?.dashboardView,
  //   tractorData?.tyreView,
  //   tractorData?.hydraulicView,
  //   tractorData?.ptoView,
  //   tractorData?.additionalImage1,
  //   tractorData?.additionalImage2,
  //   tractorData?.additionalImage3,
  //   tractorData?.additionalImage4,
  //   tractorData?.additionalImage5,
  // ].filter(Boolean))];
  const documentFiles = [
    tractorData?.brochure,
    tractorData?.invoice,
    tractorData?.insuranceCertificate,
    tractorData?.rcBook,
    tractorData?.warrantyCard,
    tractorData?.others,
  ].filter(Boolean);


  const loadData = async () => {
    try {
   
        if (!websiteVariantId) return;

      const res = await apiHelper.get(`/website-variants/${websiteVariantId}`);

      console.log("Full API Response =>", res.data);
      console.log("Variant Data =>", res.data.data);

      setTractorData(res.data);
    } catch (error) {
      console.error(error);
    }
  };
 useEffect(() => {
    loadData();
  }, [websiteVariantId]);

 const handleSubmit = async () => {
  try {
    setLoading(true);

  

    if (!websiteVariantId) {
      toast.warning("Website Variant ID not found");
      return;
    }

    await apiHelper.put(`/website-variants/${websiteVariantId}/submit`, {
      agreed,
    });

    toast.success("Tractor submitted successfully for review!");
    setFinished(true);
  
  } catch (error: any) {
    console.error("Submit Error:", error);
    toast.error(error.response?.data?.message || "Failed to submit. Please try again.");
  } finally {
    setLoading(false);
  }
};

const handleSaveDraft = () => {
  
  toast.success("Draft saved successfully!");
};

  return (
    <div className="mt-6">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-500">
        Dashboard &gt; New Tractor &gt; Add New Tractor &gt;{" "}
        <span className="text-primary-600 font-medium">
          Preview &amp; Submit
        </span>
      </div>

      {/* Tractor Overview Header - Redesigned to match image */}
      <div className="mb-8 rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-semibold text-gray-800">
          Tractor Overview
        </h3>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left - Images */}
          <div className="lg:col-span-4">
            <div
              className="relative overflow-hidden rounded-lg bg-gray-100"
              style={{ minHeight: "250px" }}
            >
              {selectedImage ? (
                <img
                  src={apiHelper.getImageUrl(selectedImage)}
                  alt="Tractor"
                  className="h-65 w-full object-cover"
                />
              ) : (
                <div className="flex h-65 w-full items-center justify-center">
                  <Tractor className="h-20 w-20 text-gray-400" />
                </div>
              )}
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.slice(0, 5).map((img, index) => (
                <img
                  key={index}
                  src={apiHelper.getImageUrl(img)}
                  alt={`thumb-${index}`}
                  onClick={() => setSelectedIndex(index)}
                  className={`h-14 w-14 cursor-pointer rounded object-cover transition-all ${
                    selectedIndex === index
                      ? "border-2 border-blue-500 ring-2 ring-blue-200"
                      : "border border-gray-300 hover:border-blue-300"
                  }`}
                />
              ))}

             {images.length > 5 && (
  <button
    type="button"
    onClick={() => setShowGallery(true)}
    className="flex h-14 w-14 items-center justify-center rounded border border-gray-300 text-sm font-medium"
  >
    +{images.length - 5}
  </button>
)}
            </div>
          </div>

          {/* Center - Details */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-800">
                {tractorData?.productName || "Swaraj"}
              </h2>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                New Tractor
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-5 text-sm">
              <div className="flex items-center gap-1.5">
                <Gauge className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">
                  {tractorData?.horsePower} HP
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Tractor className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">2WD</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Fuel className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">{tractorData?.fuelType}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">
                  {tractorData?.modelYear?.modelYear}
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4">
              <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
                Ex-Showroom Price
              </p>
              <h3 className="text-primary-600 mt-1 text-3xl font-bold">
                ₹ {tractorData?.exShowroomPrice?.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Right - Highlights */}
          <div className="lg:col-span-3">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <h4 className="mb-3 text-sm font-semibold text-gray-700">
                Key Highlights
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <ul className="space-y-2 text-sm">
                  {[
                    tractorData?.highlight1,
                    tractorData?.highlight2,
                    tractorData?.highlight3,
                    tractorData?.highlight4,
                    tractorData?.highlight5,
                  ]
                    .filter(Boolean)
                    .map((highlight, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        {highlight}
                      </li>
                    ))}
                </ul>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Information Sections - Updated styling */}
      <div className="space-y-6">
        {/* Basic Information */}
        <PreviewSection title="Basic Information">
          <PreviewRow
            label="Brand"
            value={tractorData?.brand?.brandName || "-"}
          />

          <PreviewRow
            label="Category"
            value={tractorData?.category?.categoryName || "-"}
          />

          <PreviewRow
            label="Model"
            value={tractorData?.model?.modelName || "-"}
          />

          <PreviewRow
            label="Launch Year"
            value={
              tractorData?.launchYear
                ? new Date(tractorData.launchYear).toLocaleDateString("en-IN")
                : "-"
            }
          />

          <PreviewRow
            label="Variant"
            value={tractorData?.variant?.variantName || "-"}
          />
          <PreviewRow
            label="Country of Origin"
            value={tractorData?.country || "India"}
          />
        </PreviewSection>

        {/* Engine Details */}
        <PreviewSection title="Engine Details">
          <PreviewRow
            label="Horse Power"
            value={`${tractorData?.horsePower || "-"} HP`}
          />

          <PreviewRow
            label="No. Of Cylinders"
            value={tractorData?.numberOfCylinders || "-"}
          />

          <PreviewRow
            label="Cubic Capacity"
            value={tractorData?.cubicCapacity || "-"}
          />

          <PreviewRow
            label="Aspirated Type"
            value={tractorData?.aspiratedType || "-"}
          />

          <PreviewRow
            label="Air Filter"
            value={tractorData?.airFilterType || "-"}
          />

          <PreviewRow
            label="Torque RPM"
            value={tractorData?.torqueRpm || "-"}
          />

          <PreviewRow
            label="Emission Norms"
            value={tractorData?.emissionNorms || "-"}
          />
        </PreviewSection>

        {/* Transmission Details */}
        <PreviewSection title="Transmission Details">
          <PreviewRow label="Clutch Type" value={tractorData?.clutchType} />

          <PreviewRow label="Forward Gears" value={tractorData?.forwardGears} />

          <PreviewRow label="Reverse Gears" value={tractorData?.reverseGears} />

          <PreviewRow label="Gear Type" value={tractorData?.gearType} />

          <PreviewRow
            label="Transmission Type"
            value={tractorData?.transmissionType}
          />

          <PreviewRow label="PTO HP" value={tractorData?.ptoHp} />

          <PreviewRow label="PTO RPM" value={tractorData?.ptoRpm} />

          <PreviewRow label="PTO Type" value={tractorData?.ptoType} />

          <PreviewRow label="PTO Position" value={tractorData?.ptoPosition} />

          {/* <PreviewRow
    label="Reverse PTO"
    value={tractorData?.reversePto ? "Yes" : "No"}
  />

  <PreviewRow
    label="Multi Speed PTO"
    value={tractorData?.multiSpeedPto ? "Yes" : "No"}
  />

  <PreviewRow
    label="Creeper Gears"
    value={tractorData?.creeperGears ? "Yes" : "No"}
  />

  <PreviewRow
    label="Hi-Lo Gears"
    value={tractorData?.hiLoGears ? "Yes" : "No"}
  />

  <PreviewRow
    label="Power Shuttle"
    value={tractorData?.powerShuttle ? "Yes" : "No"}
  />

  <PreviewRow
    label="Shuttle Shift"
    value={tractorData?.shuttleShift ? "Yes" : "No"}
  />

  <PreviewRow
    label="Side Shift Gear"
    value={tractorData?.sideShiftGear ? "Yes" : "No"}
  />

  <PreviewRow
    label="Super Reducer"
    value={tractorData?.superReducer ? "Yes" : "No"}
  /> */}
        </PreviewSection>

        {/* Hydraulic & Tyres */}
        <PreviewSection title="Hydraulic & Tyres">
          <PreviewRow
            label="Lifting Capacity"
            value={tractorData?.liftingCapacity}
          />

          <PreviewRow
            label="Lifting Capacity @610mm"
            value={tractorData?.liftingCapacityAt610mm}
          />

          <PreviewRow
            label="Hydraulic Type"
            value={tractorData?.hydraulicType}
          />

          <PreviewRow label="Control Type" value={tractorData?.controlType} />

          <PreviewRow
            label="Remote Valve Type"
            value={tractorData?.remoteValveType}
          />

          <PreviewRow
            label="Number Of Remote Valves"
            value={tractorData?.numberOfRemoteValves}
          />

          <PreviewRow
            label="3 Point Linkage"
            value={tractorData?.threePointLinkage}
          />

          <PreviewRow
            label="Linkage Category"
            value={tractorData?.linkageCategory}
          />

          <PreviewRow label="Top Link" value={tractorData?.topLink} />

          {/* <PreviewRow
    label="Load Sensing"
    value={tractorData?.loadSensing ? "Yes" : "No"}
  />

  <PreviewRow
    label="Flow Control"
    value={tractorData?.flowControl ? "Yes" : "No"}
  />

  <PreviewRow
    label="Position Control"
    value={tractorData?.positionControl ? "Yes" : "No"}
  />

  <PreviewRow
    label="Draft Control"
    value={tractorData?.draftControl ? "Yes" : "No"}
  /> */}

          <PreviewRow
            label="Draft Sensitivity"
            value={tractorData?.draftSensitivity}
          />

          {/* <PreviewRow
    label="Down Position Control"
    value={tractorData?.downPositionControl ? "Yes" : "No"}
  />

  <PreviewRow
    label="Return To Depth"
    value={tractorData?.returnToDepth ? "Yes" : "No"}
  />

  <PreviewRow
    label="Self Levelling"
    value={tractorData?.selfLevelling ? "Yes" : "No"}
  />

  <PreviewRow
    label="Quick Hitch"
    value={tractorData?.quickHitch ? "Yes" : "No"}
  />

  <PreviewRow
    label="External Hydraulic Cylinder"
    value={tractorData?.externalHydraulicCylinder ? "Yes" : "No"}
  />

  <PreviewRow
    label="Transport Lock"
    value={tractorData?.transportLock ? "Yes" : "No"}
  /> */}
        </PreviewSection>

        {/* Price & Location */}
        <PreviewSection title="Price &amp; Location">
          <PreviewRow
            label="Ex-Showroom Price"
            value={`₹ ${tractorData?.exShowroomPrice.toLocaleString()}`}
          />
          <PreviewRow
            label="On-Road Price"
            value={`₹ ${tractorData?.onRoadPrice.toLocaleString()}`}
          />
          <PreviewRow
            label="Finance Available"
            value={tractorData?.financeAvailable}
          />
          <PreviewRow
            label="EMI Available"
            value={tractorData?.emiAvailable ? "Yes" : "No"}
          />
          <PreviewRow label="State" value={tractorData?.state} />
          <PreviewRow label="District" value={tractorData?.district} />
          <PreviewRow label="Taluka" value={tractorData?.taluka} />
          <PreviewRow label="City" value={tractorData?.city} />
          <PreviewRow label="Landmark" value={tractorData?.landmark} />
          <PreviewRow label="Address" value={tractorData?.fullAddress} />
          <PreviewRow label="Pincode" value={tractorData?.pincode} />
        </PreviewSection>

        {/* Media & Documents - Redesigned to match image */}
       <div className="rounded-xl border border-gray-200 p-6 shadow-sm">
  <div className="mb-4 flex items-center justify-between">
    <h3 className="text-lg font-semibold text-gray-800">
      Media & Documents
    </h3>

    <button
      type="button"
      className="text-primary-600 text-sm font-medium"
      onClick={() => setCurrentStep(5)}
    >
      Edit
    </button>
  </div>

  <div className="grid gap-6 md:grid-cols-3">
    
    {/* Images */}
    <div>
      <h4 className="mb-2 text-sm font-medium text-gray-700">
        Images ({images.length})
      </h4>

      <div className="flex flex-wrap gap-2">
        {images.slice(0, 5).map((img, index) => (
          <img
            key={index}
            src={apiHelper.getImageUrl(img)}
            alt={`img-${index}`}
            className="h-16 w-16 rounded border object-cover"
          />
        ))}

       {images.length > 5 && (
  <button
    type="button"
    onClick={() => setShowGallery(true)}
    className="flex h-16 w-14 items-center justify-center rounded border border-gray-300 text-sm font-medium"
  >
    +{images.length - 5}
  </button>
)}
      </div>
    </div>

    {/* Videos */}
    {/* <div>
      <h4 className="mb-2 text-sm font-medium text-gray-700">
        Videos ({videoFiles.length})
      </h4>

      <div className="flex flex-wrap gap-2">
        {videoFiles.slice(0, 2).map((video, index) => (
          <video
            key={index}
            src={apiHelper.getImageUrl(video)}
            className="h-16 w-24 rounded border object-cover"
          />
        ))}
      </div>
    </div> */}

    {/* Documents */}
    <div>
      <h4 className="mb-2 text-sm font-medium text-gray-700">
        Documents ({documentFiles.length})
      </h4>

      <div className="flex flex-wrap gap-2">
        {documentFiles.slice(0, 3).map((doc, index) => (
          <a
            key={index}
            href={apiHelper.getImageUrl(doc)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded border px-3 py-2 text-sm"
          >
            <FileText className="h-4 w-4" />
            PDF
          </a>
        ))}

        {documentFiles.length > 3 && (
          <div className="flex items-center rounded border px-3 py-2">
            +{documentFiles.length - 3}
          </div>
        )}
      </div>
    </div>

  </div>
</div>
      </div>

      {/* Confirmation Section - Redesigned */}
      <div className="mt-8 rounded-xl border border-gray-200 p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="text-primary-600 focus:ring-primary-500 mt-0.5 h-4 w-4 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">
            I confirm that all the information provided is correct to the best
            of my knowledge. I agree to the{" "}
            <a href="#" className="text-primary-600 hover:underline">
              Terms &amp; Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary-600 hover:underline">
              Listing Policy
            </a>{" "}
            of Tractor Junction.
          </span>
        </label>
      </div>
{showGallery && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div className="max-h-[80vh] w-[50vw] overflow-auto rounded-lg bg-dark-600 p-4">
      <div className="mb-4 flex justify-between">
        <h3 className="text-lg font-semibold">All Images</h3>
        <button onClick={() => setShowGallery(false)} className=" cursor-pointer">✕</button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        {images.map((img, index) => (
          <img
            key={index}
            src={apiHelper.getImageUrl(img)}
            alt={`image-${index}`}
            className="h-32 w-full cursor-pointer rounded border object-cover"
            onClick={() => {
              setSelectedIndex(index);
              setShowGallery(false);
            }}
          />
        ))}
      </div>
    </div>
  </div>
)}
      {/* Info Note - Redesigned */}
      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-center text-sm text-blue-700">
        <CheckCircleIcon className="mr-2 inline h-5 w-5" />
        Once submitted, our team will review your tractor details. You will get
        notified via email / SMS.
      </div>

      {/* Action Buttons - Redesigned */}
      <div className="mt-8 flex flex-col justify-between gap-4 sm:flex-row">
        <Button
          type="button"
          variant="outlined"
          className="flex min-w-28 items-center gap-2"
          onClick={() => setCurrentStep(5)}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outlined"
            className="flex min-w-28 items-center gap-2"
            onClick={handleSaveDraft}
          >
            <Save className="h-4 w-4" />
            Save as Draft
          </Button>
          <Button
            type="button"
            className="flex min-w-28 items-center gap-2"
            color="primary"
            disabled={!agreed || loading}
            onClick={handleSubmit}
          >
            <Send className="h-4 w-4" />
            {loading ? "Submitting..." : "Submit for Review"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper Components - Improved styling
function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
      <h3 className="border-b border-gray-100 px-5 py-3 text-sm font-semibold tracking-wider text-gray-700 uppercase">
        {title}
      </h3>
      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}
