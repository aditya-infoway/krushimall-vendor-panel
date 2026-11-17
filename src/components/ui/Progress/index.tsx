// Import Dependencies
import {
  ComponentPropsWithoutRef,
  CSSProperties,
  forwardRef,
  ForwardedRef,
  ReactNode,
} from "react";
import clsx from "clsx";

// Local Imports
import { ColorType } from "@/constants/app";
import { setThisClass } from "@/utils/setThisClass";

// ----------------------------------------------------------------------

type Variant = "default" | "soft";

export type ProgressProps = {
  children?: ReactNode;
  value?: number;
  showRail?: boolean;
  isActive?: boolean;
  isIndeterminate?: boolean;
  unstyled?: boolean;
  color?: ColorType;
  variant?: Variant;
  className?: string;
  classNames?: {
    root?: string;
    bar?: string;
  };
  animationDuration?: CSSProperties["animationDuration"];
  style?: CSSProperties;
  rootProps?: Record<string, any>;
  // Circular ring options
  circular?: boolean;
  size?: number; // ring size in px
  strokeWidth?: number; // ring thickness in px
} & ComponentPropsWithoutRef<"div">;

const Progress = forwardRef(
  (props: ProgressProps, ref: ForwardedRef<HTMLDivElement>) => {
    const {
      children,
      value = 0,
      showRail = true,
      isActive = false,
      isIndeterminate = false,
      unstyled = false,
      color = "neutral",
      variant = "default",
      className,
      classNames,
      animationDuration,
      style = {},
      rootProps = {},
      circular = false,
      size = 144,
      strokeWidth = 4,
      ...rest
    } = props;

    // ---------------- Circular ring ----------------
    if (circular) {
      const radius = (size - strokeWidth) / 2;
      const circumference = 2 * Math.PI * radius;
      const dash = isIndeterminate
        ? circumference * 0.25
        : (circumference * value) / 100;

      return (
        <div
          {...rootProps}
          ref={ref}
          className={clsx(
            "relative grid place-content-center",
            className,
            classNames?.root,
          )}
          style={{ width: size, height: size }}
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className={clsx(
              "absolute inset-0",
              isIndeterminate && "animate-spin",
              color !== "neutral" && setThisClass(color),
            )}
            style={{ animationDuration: animationDuration ?? "1s" }}
          >
            {/* Track */}
            {showRail && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth={strokeWidth}
                className="stroke-gray-200 dark:stroke-dark-500"
              />
            )}

            {/* Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className={clsx(
                "transition-[stroke-dasharray] duration-300",
                color === "neutral"
                  ? "stroke-primary-600 dark:stroke-primary-400"
                  : "stroke-this dark:stroke-this-light",
              )}
            />
          </svg>

          {/* Beech me logo / content */}
          <div className="relative z-10 grid place-content-center">
            {children}
          </div>
        </div>
      );
    }

    // ---------------- Linear bar (original) ----------------
    return (
      <div
        {...rootProps}
        className={clsx(
          "progress-rail",
          showRail &&
            !unstyled && [
              color === "neutral" || variant !== "soft"
                ? "bg-gray-150 dark:bg-dark-500"
                : [setThisClass(color), "bg-this/[.15] dark:bg-this-light/25"],
            ],
          className,
          classNames?.root,
        )}
      >
        <div
          ref={ref}
          {...rest}
          className={clsx(
            "progress relative rounded-full transition-[width] ease-out",
            !unstyled && [
              color === "neutral"
                ? "dark:bg-dark-400 bg-gray-500"
                : [setThisClass(color), "bg-this dark:bg-this-light"],
            ],
            isActive && "is-active",
            isIndeterminate
              ? "is-indeterminate"
              : "flex items-center justify-end leading-none",
            classNames?.bar,
          )}
          style={{
            width: isIndeterminate ? "100%" : `${value}%`,
            animationDuration,
            ...style,
          }}
        >
          {children}
        </div>
      </div>
    );
  },
);

Progress.displayName = "Progress";

export { Progress };