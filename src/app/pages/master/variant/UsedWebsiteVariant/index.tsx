// Import Dependencies
import React, { useState,useEffect } from "react";
import clsx from "clsx";
import apiHelper from "@/utils/apiHelper";
// Local Imports
import { Page } from "@/components/shared/Page";
import { Card } from "@/components/ui";
import { KYCFormProvider } from "./KYCFormProvider.tsx";
import { Stepper } from "./Stepper.tsx";
import { UnderReview } from "./UnderReview";
import { Enginedetails } from "./steps/Enginedetails.tsx";
import { HydraulicTyres } from "./steps/HydraulicTyres.tsx";
import { Transmission } from "./steps/Transmission.tsx";
import { BasicInformation } from "./steps/BasicInformation.tsx";
import { FormState } from "./KYCFormContext.ts";
import { PriceLocation } from "./steps/PriceLocation";
import { MediaDocumnet } from "./steps/MediaDocumnet.tsx"
import {PreviewSubmit } from "./steps/PreviewSubmit.tsx"
// ----------------------------------------------------------------------
import { useNavigate,useSearchParams, } from "react-router";
export interface Step {
  key: keyof FormState["formData"];
  component: React.ComponentType<any>;
  label: string;
  description: string;
}

const steps: Step[] = [
  {
    key: "BasicInformation",
    component: BasicInformation,
    label: "Basic Information",
    description:
      "Please provide your personal information in order to complete your KYC",
  },
  {
    key: "Enginedetails",
    component: Enginedetails,
    label: "Engine Details",
    description: "Enter name, DOB, gender, email, phone and occupation",
  },
  {
    key: "Transmission",
    component: Transmission,
    label: "Transmission",
    description:
      "Upload a scanned copy of ID proof (passport, driver's license or ID Card).",
  },
  {
    key: "HydraulicTyres",
    component: HydraulicTyres,
    label: "Hydraulic & Tyres",
    description:
      "   Add hydraulic system details of this tractor",
  },
  
   {
    key: "PriceLocation",
    component: PriceLocation,
    label: "Price & Location",
    description:
      "Read and agree to the terms and conditions of the form. Check the box to confirm information and consent.",
  },
  {
    key: "MediaDocumnet",
    component: MediaDocumnet,
    label: "Media & Documnet",
    description:
      "Read and agree to the terms and conditions of the form. Check the box to confirm information and consent.",
  },
   {
    key: "PreviewSubmit",
    component: PreviewSubmit,
    label: "Preview & Submit",
    description:
      "Read and agree to the terms and conditions of the form. Check the box to confirm information and consent.",
  },
];

const KYCForm = () => {
  const [currentStep, setCurrentStep] =
    useState(0);

  const [finished, setFinished] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [editData, setEditData] =
    useState<any>(null);

  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  // Dynamic ID from URL
  const urlId =
    searchParams.get("id");

  // Used for both Create and Edit
  const [
    websiteVariantId,
    setWebsiteVariantId,
  ] = useState<string | null>(
    urlId,
  );

  const isEditMode =
    Boolean(urlId);

  // Keep state synchronized with URL
  useEffect(() => {
    setWebsiteVariantId(urlId);
  }, [urlId]);

  // Fetch complete record only one time
 // Fetch complete record only one time
useEffect(() => {
  if (!urlId) {
    setEditData(null);
    return;
  }

  const fetchWebsiteVariant = async () => {
    try {
      setLoading(true);

      const response = await apiHelper.get(`/website-variants/${urlId}`);
      const variant = response?.data?.data ?? response?.data;

      console.log("Website Variant Edit Data:", variant);

      setEditData(variant);

      // ✅ No localStorage — direct state set
      setWebsiteVariantId(String(variant?.id ?? urlId));

      // ✅ Resume from the last saved step
      if (typeof variant?.currentStep === "number") {
        setCurrentStep(variant.currentStep);
      }
    } catch (error) {
      console.error("Failed to fetch Website Variant:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchWebsiteVariant();
}, [urlId]);

  const ActiveForm =
    steps[currentStep].component;

  if (loading) {
    return (
      <Page title="Website Variant">
        <div className="flex min-h-100 items-center justify-center">
          <p className="text-gray-500">
            Loading website variant...
          </p>
        </div>
      </Page>
    );
  }

  const stepsNode = (
    <div className="col-span-12">
      <Card className="mb-5 p-5">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          setCurrentStep={
            setCurrentStep
          }
        />
      </Card>

      <Card className="p-5">
        <h5 className="dark:text-dark-100 text-lg font-medium text-gray-800">
          {
            steps[currentStep]
              .label
          }
        </h5>

        <p className="dark:text-dark-200 mb-6 text-sm text-gray-500">
          {
            steps[currentStep]
              .description
          }
        </p>

        {!finished && (
          <ActiveForm
            setCurrentStep={
              setCurrentStep
            }
            setFinished={
              setFinished
            }

            // Same dynamic ID for all steps
            websiteVariantId={
              websiteVariantId
            }

            // Set ID after new record creation
            setWebsiteVariantId={
              setWebsiteVariantId
            }

            // Complete existing DB data
            editData={
              editData
            }

            // Update parent data after save
            setEditData={
              setEditData
            }

            isEditMode={
              isEditMode
            }
          />
        )}
      </Card>
    </div>
  );

  return (
    <Page title="Website Variant">
      <div className="transition-content grid w-full grid-rows-[auto_1fr] px-(--margin-x) pb-8">
        <div className="flex items-center justify-between py-5 lg:py-6">
          <h2 className="dark:text-dark-50 text-xl font-medium tracking-wide text-gray-800 lg:text-2xl">
            {isEditMode
              ? "Edit Website Variant"
              : "Add Website Variant"}
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/master/variant/website",
              )
            }
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-600"
          >
            ← Back to List
          </button>
        </div>

        <KYCFormProvider>
          <div
            className={clsx(
              "grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6",

              !finished &&
                "grid-rows-[auto_1fr] sm:grid-rows-none",
            )}
          >
            {finished ? (
              <div className="col-span-12 place-self-center">
                <UnderReview />
              </div>
            ) : (
              stepsNode
            )}
          </div>
        </KYCFormProvider>
      </div>
    </Page>
  );
};
export default KYCForm;
