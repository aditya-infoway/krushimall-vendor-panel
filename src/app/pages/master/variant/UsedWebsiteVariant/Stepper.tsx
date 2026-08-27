// Import Dependencies
import clsx from "clsx";
import { HiCheck } from "react-icons/hi";

// Local Imports
// import { useBreakpointsContext } from "@/app/contexts/breakpoint/context";
// import { createScopedKeydownHandler } from "@/utils/dom/createScopedKeydownHandler";
import { StepKey, useKYCFormContext } from "./KYCFormContext";
import { Step } from ".";

// ----------------------------------------------------------------------

interface StepperProps {
  steps: Step[];
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

export function Stepper({ steps, currentStep, setCurrentStep }: StepperProps) {
  // const { smAndUp } = useBreakpointsContext();
  const kycFormCtx = useKYCFormContext();
  const stepStatus = kycFormCtx.state.stepStatus;
  const stepKeys = Object.keys(kycFormCtx.state.formData) as StepKey[];

  return (
  <div className="w-full overflow-x-auto">
  <div className="min-w-175 px-4 py-2">
      <div className="relative flex items-start justify-between gap-3">
        {/* Background Line */}
        {/* <div className="absolute top-5 left-[8%] right-[8%] h-[2px] bg-gray-200 dark:bg-dark-500" /> */}

        {steps.map((step, i) => {
          const currentStepActualStatus = stepStatus[step.key];
          const leftSiblingStepKey = getLeftSiblingStep(step.key, stepKeys);

          const isClickable =
            currentStepActualStatus.isDone ||
            (leftSiblingStepKey !== undefined &&
              stepStatus[leftSiblingStepKey]?.isDone);

          return (
            <div
              key={step.key}
              className="relative z-10 flex flex-1 flex-col items-center"
            >
              {i < steps.length - 1 && (
                <div
                  className={clsx(
                    "absolute top-5 left-1/2 h-[2px] w-full",
                    currentStep > i
                      ? "bg-primary-500"
                      : "dark:bg-dark-500 bg-gray-300",
                  )}
                />
              )}
              <button
                onClick={
                  isClickable
                    ? () => currentStep !== i && setCurrentStep(i)
                    : undefined
                }
                disabled={!isClickable}
                className={clsx(
                  "relative z-20 flex h-10 w-10 items-center justify-center rounded-full border font-medium transition-all",
                  currentStep === i
                    ? "bg-primary-500 border-primary-500 text-white"
                    : stepStatus[step.key].isDone
                      ? "bg-primary-500 border-primary-500 text-white"
                      : "dark:bg-dark-600 border-gray-300 bg-gray-100 text-gray-300",
                )}
              >
                {stepStatus[step.key].isDone ? (
                  <HiCheck className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </button>

              <span
                className={clsx(
                  "mt-3 text-center text-xs font-medium whitespace-nowrap",
                  currentStep === i ? "text-primary-500" : "text-gray-500",
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
    </div>
  );

  function getLeftSiblingStep(
    stepKey: StepKey,
    keys: StepKey[],
  ): StepKey | undefined {
    const index = keys.indexOf(stepKey);
    return index < 1 ? undefined : keys[index - 1];
  }
}
